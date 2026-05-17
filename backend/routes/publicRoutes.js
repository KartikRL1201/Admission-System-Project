const express = require("express");
const router = express.Router();
const db = require("../../db");

router.get("/departments", async (req, res) => {
    try {
        await db.query("USE AdmissionSystem");
        const [departments] = await db.query("SELECT * FROM Departments");
        res.status(200).json({ success: true, data: departments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post("/students", async (req, res) => {
    try {
        await db.query("USE AdmissionSystem");
        const { first_name, last_name, email, phone, merit_score } = req.body;
        const query =
            "INSERT INTO Students (First_Name, Last_Name, Email, Phone, Merit_Score) VALUES (?, ?, ?, ?, ?)";
        const [result] = await db.query(query, [
            first_name,
            last_name,
            email,
            phone,
            merit_score,
        ]);
        res.status(201).json({ success: true, studentId: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post("/applications", async (req, res) => {
    try {
        await db.query("USE AdmissionSystem");
        const { student_id, dept_id } = req.body;
        const query =
            "INSERT INTO Applications (Student_ID, Dept_ID) VALUES (?, ?)";
        const [result] = await db.query(query, [student_id, dept_id]);
        res.status(201).json({ success: true, applicationId: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
