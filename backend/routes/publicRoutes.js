const express = require("express");
const router = express.Router();
const db = require("../../db");

router.get("/departments", async (req, res) => {
    try {
        await db.query("USE AdmissionSystem");

        const [departments] = await db.query(`
            SELECT
                d.Dept_ID,
                d.Dept_Name,
                COALESCE(d.Max_Capacity, d.Total_Seats) AS Total_Seats,
                (COALESCE(d.Max_Capacity, d.Total_Seats) - COUNT(a.Application_ID)) AS Available_Seats
            FROM Departments d
            LEFT JOIN Applications a ON d.Dept_ID = a.Dept_ID AND a.Status = 'Approved'
            GROUP BY d.Dept_ID, d.Dept_Name, d.Max_Capacity, d.Total_Seats
        `);

        res.status(200).json({ success: true, data: departments });
    } catch (error) {
        console.error("Departments Route Error:", error);
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

router.get("/status/:id", async (req, res) => {
    try {
        await db.query("USE AdmissionSystem");
        const [rows] = await db.query(
            `SELECT a.Application_ID, a.Status, a.Application_Date, s.First_Name, s.Last_Name, d.Dept_Name
             FROM Applications a
             JOIN Students s ON a.Student_ID = s.Student_ID
             JOIN Departments d ON a.Dept_ID = d.Dept_ID
             WHERE a.Application_ID = ?`,
            [req.params.id],
        );

        if (rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Application ID not found." });
        }

        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error." });
    }
});

router.post("/tickets", async (req, res) => {
    try {
        const { application_id, subject, message } = req.body;
        await db.query("USE AdmissionSystem");

        const [appCheck] = await db.query(
            "SELECT Application_ID FROM Applications WHERE Application_ID = ?",
            [application_id],
        );
        if (appCheck.length === 0)
            return res
                .status(404)
                .json({ success: false, message: "Invalid Application ID." });

        const [ticketRes] = await db.query(
            "INSERT INTO Tickets (Application_ID, Subject) VALUES (?, ?)",
            [application_id, subject],
        );
        await db.query(
            "INSERT INTO Ticket_Replies (Ticket_ID, Sender, Message) VALUES (?, 'Student', ?)",
            [ticketRes.insertId, message],
        );

        res.status(200).json({ success: true, ticketId: ticketRes.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get("/tickets/:appId", async (req, res) => {
    try {
        await db.query("USE AdmissionSystem");
        const [tickets] = await db.query(
            "SELECT * FROM Tickets WHERE Application_ID = ? ORDER BY Created_At DESC",
            [req.params.appId],
        );
        res.status(200).json({ success: true, data: tickets });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get("/tickets/thread/:ticketId", async (req, res) => {
    try {
        await db.query("USE AdmissionSystem");
        const [replies] = await db.query(
            "SELECT * FROM Ticket_Replies WHERE Ticket_ID = ? ORDER BY Created_At ASC",
            [req.params.ticketId],
        );
        res.status(200).json({ success: true, data: replies });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post("/tickets/reply", async (req, res) => {
    try {
        const { ticket_id, message, sender } = req.body;
        await db.query("USE AdmissionSystem");
        await db.query(
            "INSERT INTO Ticket_Replies (Ticket_ID, Sender, Message) VALUES (?, ?, ?)",
            [ticket_id, sender, message],
        );

        if (sender === "Student") {
            await db.query(
                "UPDATE Tickets SET Status = 'Open' WHERE Ticket_ID = ?",
                [ticket_id],
            );
        }

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
