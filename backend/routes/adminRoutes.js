const express = require("express");
const router = express.Router();
const db = require("../../db");
const jwt = require("jsonwebtoken");
const { verifyAdmin, verifySuperAdmin } = require("../middleware/auth");
const bcrypt = require("bcrypt");

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_presentation_key";

router.post("/register", verifySuperAdmin, async (req, res) => {
    try {
        await db.query("USE AdmissionSystem");
        const { username, password, role = "Reviewer" } = req.body;

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
            "INSERT INTO Admins (Username, Password_Hash, Role) VALUES (?, ?, ?)",
            [username, hashedPassword, role],
        );

        const adminUsername =
            req.user?.username || req.admin?.username || "System Admin";

        await db.query(
            "INSERT INTO Audit_Logs (Action_Type, Description, Admin_Username) VALUES (?, ?, ?)",
            [
                "Team Management",
                `Provisioned new reviewer account for: ${username}`,
                adminUsername,
            ],
        );

        res.status(201).json({
            success: true,
            message: "Account created successfully.",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        await db.query("USE AdmissionSystem");

        const [admins] = await db.query(
            "SELECT * FROM Admins WHERE Username = ?",
            [username],
        );

        if (admins.length === 0) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid credentials." });
        }

        const admin = admins[0];
        const hashToCompare = admin.Password_Hash || admin.Password;

        if (!hashToCompare) {
            return res
                .status(500)
                .json({
                    success: false,
                    message: "Database configuration error.",
                });
        }

        const isMatch = await bcrypt.compare(password, hashToCompare);

        if (!isMatch) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid credentials." });
        }

        const token = jwt.sign(
            { id: admin.Admin_ID, role: admin.Role, username: admin.Username },
            JWT_SECRET,
            { expiresIn: "24h" },
        );

        res.json({ success: true, token });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error." });
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

        const [deptStats] = await db.query(`
            SELECT
                d.Dept_Name,
                COUNT(a.Application_ID) as Total_Applications,
                SUM(CASE WHEN a.Status = 'Approved' THEN 1 ELSE 0 END) as Total_Admitted
            FROM Departments d
            LEFT JOIN Applications a ON d.Dept_ID = a.Dept_ID
            GROUP BY d.Dept_ID, d.Dept_Name
        `);

        const [topCandidates] = await db.query(`
            SELECT a.Application_ID, s.First_Name, s.Last_Name, s.Merit_Score, d.Dept_Name
            FROM Applications a
            JOIN Students s ON a.Student_ID = s.Student_ID
            JOIN Departments d ON a.Dept_ID = d.Dept_ID
            WHERE a.Status = 'Pending'
            ORDER BY s.Merit_Score DESC
            LIMIT 5
        `);

        const [velocityData] = await db.query(`
            SELECT DATE_FORMAT(MIN(Application_Date), '%b %d') as date, COUNT(*) as count
            FROM Applications
            GROUP BY DATE(Application_Date)
            ORDER BY DATE(Application_Date) ASC
            LIMIT 7
        `);

        const sanitizedDeptStats = deptStats.map((stat) => ({
            Dept_Name: stat.Dept_Name,
            Total_Applications: Number(stat.Total_Applications) || 0,
            Total_Admitted: Number(stat.Total_Admitted) || 0,
        }));

        res.status(200).json({
            success: true,
            data: {
                statusCounts,
                deptStats: sanitizedDeptStats,
                topCandidates,
                velocityData,
            },
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
        query += " ORDER BY a.Application_Date ASC, a.Application_ID ASC";
        const [applications] = await db.query(query, queryParams);
        res.status(200).json({ success: true, data: applications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put("/applications/:id/:action", verifyAdmin, async (req, res) => {
    try {
        const { id, action } = req.params;
        const adminUsername =
            req.user?.username || req.admin?.username || "System Admin";

        let newStatus = "Pending";
        if (action === "approve") newStatus = "Approved";
        else if (action === "reject") newStatus = "Rejected";
        else if (action === "restore") newStatus = "Pending";
        else if (action === "archive") newStatus = "Archived";

        await db.query("USE AdmissionSystem");
        await db.query("SET @admin_username = ?", [adminUsername]);
        await db.query(
            "UPDATE Applications SET Status = ? WHERE Application_ID = ?",
            [newStatus, id],
        );

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete("/applications/:id", verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const adminUsername =
            req.user?.username || req.admin?.username || "System Admin";

        await db.query("USE AdmissionSystem");
        await db.query("SET @admin_username = ?", [adminUsername]);
        await db.query("DELETE FROM Applications WHERE Application_ID = ?", [
            id,
        ]);

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get("/activity", verifyAdmin, async (req, res) => {
    try {
        await db.query("USE AdmissionSystem");
        const [logs] = await db.query(`
            SELECT Log_ID, Action_Type, Description, Admin_Username, Created_At
            FROM Audit_Logs
            ORDER BY Created_At DESC
            LIMIT 50
        `);
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete("/activity", verifyAdmin, async (req, res) => {
    try {
        await db.query("USE AdmissionSystem");
        
        await db.query("TRUNCATE TABLE Audit_Logs");
        res.status(200).json({
            success: true,
            message: "Activity logs cleared.",
        });
    } catch (error) {
        console.error("Activity Clear Error:", error);
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

router.delete("/applications/:id", verifySuperAdmin, async (req, res) => {
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

router.post("/reset", verifySuperAdmin, async (req, res) => {
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

router.get("/reviewers", verifySuperAdmin, async (req, res) => {
    try {
        await db.query("USE AdmissionSystem");
        const [reviewers] = await db.query(
            "SELECT Admin_ID, Username, Role FROM Admins WHERE Role = 'Reviewer'",
        );
        res.status(200).json({ success: true, data: reviewers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete("/reviewers/:id", verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const adminUsername =
            req.user?.username || req.admin?.username || "System Admin";

        await db.query("USE AdmissionSystem");

        const [targetUser] = await db.query(
            "SELECT Username FROM Admins WHERE Admin_ID = ?",
            [id],
        );
        const removedName =
            targetUser.length > 0 ? targetUser[0].Username : `ID #${id}`;

        await db.query("DELETE FROM Admins WHERE Admin_ID = ?", [id]);

        await db.query(
            "INSERT INTO Audit_Logs (Action_Type, Description, Admin_Username) VALUES (?, ?, ?)",
            [
                "Team Management",
                `Revoked access for reviewer: ${removedName}`,
                adminUsername,
            ],
        );

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get("/tickets", verifyAdmin, async (req, res) => {
    try {
        await db.query("USE AdmissionSystem");
        const [tickets] = await db.query(`
            SELECT t.*, a.First_Name, a.Last_Name
            FROM Tickets t
            JOIN Applications app ON t.Application_ID = app.Application_ID
            JOIN Students a ON app.Student_ID = a.Student_ID
            ORDER BY t.Status ASC, t.Created_At ASC
        `);
        res.status(200).json({ success: true, data: tickets });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete("/tickets/all", verifyAdmin, async (req, res) => {
    try {
        await db.query("USE AdmissionSystem");
        await db.query("SET FOREIGN_KEY_CHECKS = 0");
        await db.query("TRUNCATE TABLE Ticket_Replies");
        await db.query("TRUNCATE TABLE Tickets");
        await db.query("SET FOREIGN_KEY_CHECKS = 1");
        res.status(200).json({ success: true });
    } catch (error) {
        await db.query("SET FOREIGN_KEY_CHECKS = 1");
        console.error("Critical Delete Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete("/tickets/:id", verifyAdmin, async (req, res) => {
    try {
        await db.query("USE AdmissionSystem");
        await db.query("DELETE FROM Tickets WHERE Ticket_ID = ?", [req.params.id]);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put("/tickets/:id/resolve", verifyAdmin, async (req, res) => {
    try {
        await db.query("USE AdmissionSystem");
        await db.query(
            "UPDATE Tickets SET Status = 'Resolved' WHERE Ticket_ID = ?",
            [req.params.id],
        );
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
