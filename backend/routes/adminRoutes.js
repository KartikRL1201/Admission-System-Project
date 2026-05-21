const express = require("express");
const router = express.Router();
const db = require("../../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyAdmin = require("../middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_presentation_key";

router.post("/register", async (req, res) => {
    try {
        await db.query("USE AdmissionSystem");
        const { username, password } = req.body;

        const [existingAdmins] = await db.query(
            "SELECT * FROM Admins WHERE Username = ?",
            [username],
        );
        if (existingAdmins.length > 0) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Username is already taken.",
                });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            "INSERT INTO Admins (Username, Password_Hash) VALUES (?, ?)",
            [username, hashedPassword],
        );

        res.status(201).json({
            success: true,
            message: "Account created successfully! You can now log in.",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        await db.query("USE AdmissionSystem");
        const { username, password } = req.body;

        const [admins] = await db.query(
            "SELECT * FROM Admins WHERE Username = ?",
            [username],
        );
        if (admins.length === 0)
            return res
                .status(404)
                .json({ success: false, message: "Admin user not found." });

        const validPassword = await bcrypt.compare(
            password,
            admins[0].Password_Hash,
        );
        if (!validPassword)
            return res
                .status(401)
                .json({ success: false, message: "Invalid password." });

        const token = jwt.sign(
            { id: admins[0].Admin_ID, username: admins[0].Username },
            JWT_SECRET,
            { expiresIn: "2h" },
        );
        res.status(200).json({ success: true, token });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get("/analytics", verifyAdmin, async (req, res) => {
    try {
        await db.query("USE AdmissionSystem");

        const [statusCounts] = await db.query(`
            SELECT Status, COUNT(*) as Count
            FROM Applications
            GROUP BY Status
        `);

        const [procedureResult] = await db.query(
            "CALL Generate_Admission_Report()",
        );
        const deptStats = procedureResult[0];

        const [topCandidates] = await db.query(`
            SELECT s.First_Name, s.Last_Name, s.Merit_Score, d.Dept_Name
            FROM Applications a
            JOIN Students s ON a.Student_ID = s.Student_ID
            JOIN Departments d ON a.Dept_ID = d.Dept_ID
            WHERE a.Status = 'Pending'
            ORDER BY s.Merit_Score DESC
            LIMIT 5
        `);

        res.status(200).json({
            success: true,
            data: { statusCounts, deptStats, topCandidates },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get("/applications", verifyAdmin, async (req, res) => {
    try {
        await db.query("USE AdmissionSystem");
        const { status } = req.query;
        let query = `
            SELECT a.Application_ID, s.First_Name, s.Last_Name, s.Merit_Score, d.Dept_Name, a.Application_Date, a.Status
            FROM Applications a
            JOIN Students s ON a.Student_ID = s.Student_ID
            JOIN Departments d ON a.Dept_ID = d.Dept_ID
        `;
        const queryParams = [];
        if (status && status !== "All") {
            query += " WHERE a.Status = ?";
            queryParams.push(status);
        }
        query += " ORDER BY a.Application_Date DESC";
        const [applications] = await db.query(query, queryParams);
        res.status(200).json({ success: true, data: applications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put("/applications/:id/approve", verifyAdmin, async (req, res) => {
    try {
        await db.query("USE AdmissionSystem");
        await db.query(
            "UPDATE Applications SET Status = ? WHERE Application_ID = ?",
            ["Approved", req.params.id],
        );
        res.status(200).json({
            success: true,
            message: "Application approved",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put("/applications/:id/reject", verifyAdmin, async (req, res) => {
    try {
        await db.query("USE AdmissionSystem");
        await db.query(
            "UPDATE Applications SET Status = ? WHERE Application_ID = ?",
            ["Rejected", req.params.id],
        );
        res.status(200).json({
            success: true,
            message: "Application rejected",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put("/applications/:id/restore", verifyAdmin, async (req, res) => {
    try {
        await db.query("USE AdmissionSystem");
        await db.query(
            "UPDATE Applications SET Status = ? WHERE Application_ID = ?",
            ["Pending", req.params.id],
        );
        res.status(200).json({
            success: true,
            message: "Application restored",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete("/applications/:id", verifyAdmin, async (req, res) => {
    try {
        await db.query("USE AdmissionSystem");
        await db.query("DELETE FROM Applications WHERE Application_ID = ?", [
            req.params.id,
        ]);
        res.status(200).json({ success: true, message: "Application deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post("/reset", verifyAdmin, async (req, res) => {
    try {
        await db.query("USE AdmissionSystem");
        await db.query("SET FOREIGN_KEY_CHECKS = 0");
        await db.query("TRUNCATE TABLE Applications");
        await db.query("TRUNCATE TABLE Students");
        await db.query(
            "UPDATE Departments SET Total_Seats = 60 WHERE Dept_Name = 'Computer Science'",
        );
        await db.query(
            "UPDATE Departments SET Total_Seats = 60 WHERE Dept_Name = 'Information Science'",
        );
        await db.query(
            "UPDATE Departments SET Total_Seats = 120 WHERE Dept_Name = 'Mechanical Engineering'",
        );
        await db.query("SET FOREIGN_KEY_CHECKS = 1");
        res.status(200).json({
            success: true,
            message: "All records cleared successfully",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
