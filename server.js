const express = require("express");
require("dotenv").config();
const db = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_presentation_key";

async function initDatabase() {
    try {
        await db.query("CREATE DATABASE IF NOT EXISTS AdmissionSystem");
        await db.query("USE AdmissionSystem");

        await db.query(`
            CREATE TABLE IF NOT EXISTS Admins (
                Admin_ID INT AUTO_INCREMENT PRIMARY KEY,
                Username VARCHAR(50) UNIQUE NOT NULL,
                Password_Hash VARCHAR(255) NOT NULL,
                Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS Departments (
                Dept_ID INT AUTO_INCREMENT PRIMARY KEY,
                Dept_Name VARCHAR(100) NOT NULL UNIQUE,
                Total_Seats INT NOT NULL
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS Students (
                Student_ID INT AUTO_INCREMENT PRIMARY KEY,
                First_Name VARCHAR(50) NOT NULL,
                Last_Name VARCHAR(50) NOT NULL,
                Email VARCHAR(100) UNIQUE NOT NULL,
                Phone VARCHAR(15),
                Merit_Score DECIMAL(5,2)
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS Applications (
                Application_ID INT AUTO_INCREMENT PRIMARY KEY,
                Student_ID INT,
                Dept_ID INT,
                Application_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                Status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
                FOREIGN KEY (Student_ID) REFERENCES Students(Student_ID) ON DELETE CASCADE,
                FOREIGN KEY (Dept_ID) REFERENCES Departments(Dept_ID) ON DELETE CASCADE
            )
        `);

        const [deptRows] = await db.query(
            "SELECT COUNT(*) as count FROM Departments",
        );
        if (deptRows[0].count === 0) {
            await db.query(`
                INSERT INTO Departments (Dept_Name, Total_Seats) VALUES
                ('Computer Science', 60),
                ('Information Science', 60),
                ('Mechanical Engineering', 120)
            `);
        }

        await db.query("DROP TRIGGER IF EXISTS Decrease_Seats_On_Approval");
        await db.query(`
            CREATE TRIGGER Decrease_Seats_On_Approval
            AFTER UPDATE ON Applications
            FOR EACH ROW
            BEGIN
                DECLARE current_seats INT;
                SELECT Total_Seats INTO current_seats FROM Departments WHERE Dept_ID = NEW.Dept_ID;
                IF NEW.Status = 'Approved' AND OLD.Status != 'Approved' THEN
                    IF current_seats <= 0 THEN
                        SIGNAL SQLSTATE '45000'
                        SET MESSAGE_TEXT = 'Operation Cancelled: No remaining seats available in this department.';
                    ELSE
                        UPDATE Departments
                        SET Total_Seats = Total_Seats - 1
                        WHERE Dept_ID = NEW.Dept_ID;
                    END IF;
                END IF;
            END
        `);
    } catch (err) {
        console.error(err.message);
    }
}

const verifyAdmin = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token)
        return res
            .status(403)
            .json({
                success: false,
                message: "Access Denied: No Token Provided!",
            });

    try {
        const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        return res
            .status(401)
            .json({ success: false, message: "Unauthorized: Invalid Token!" });
    }
};

app.get("/api/departments", async (req, res) => {
    try {
        await db.query("USE AdmissionSystem");
        const [departments] = await db.query("SELECT * FROM Departments");
        res.status(200).json({ success: true, data: departments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post("/api/students", async (req, res) => {
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

app.post("/api/applications", async (req, res) => {
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

app.post("/api/admin/register", async (req, res) => {
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

app.post("/api/admin/login", async (req, res) => {
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

app.get("/api/admin/analytics", verifyAdmin, async (req, res) => {
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
                d.Total_Seats,
                COUNT(a.Application_ID) as Total_Applicants,
                IFNULL(AVG(s.Merit_Score), 0) as Avg_Merit
            FROM Departments d
            LEFT JOIN Applications a ON d.Dept_ID = a.Dept_ID
            LEFT JOIN Students s ON a.Student_ID = s.Student_ID
            GROUP BY d.Dept_ID
            ORDER BY Total_Applicants DESC
        `);

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

app.get("/api/admin/applications", verifyAdmin, async (req, res) => {
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

app.put(
    "/api/admin/applications/:id/approve",
    verifyAdmin,
    async (req, res) => {
        try {
            await db.query("USE AdmissionSystem");
            const query =
                "UPDATE Applications SET Status = ? WHERE Application_ID = ?";
            await db.query(query, ["Approved", req.params.id]);
            res.status(200).json({
                success: true,
                message: "Application approved",
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
);

app.put("/api/admin/applications/:id/reject", verifyAdmin, async (req, res) => {
    try {
        await db.query("USE AdmissionSystem");
        const query =
            "UPDATE Applications SET Status = ? WHERE Application_ID = ?";
        await db.query(query, ["Rejected", req.params.id]);
        res.status(200).json({
            success: true,
            message: "Application rejected",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.put(
    "/api/admin/applications/:id/restore",
    verifyAdmin,
    async (req, res) => {
        try {
            await db.query("USE AdmissionSystem");
            const query =
                "UPDATE Applications SET Status = ? WHERE Application_ID = ?";
            await db.query(query, ["Pending", req.params.id]);
            res.status(200).json({
                success: true,
                message: "Application restored",
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
);

app.delete("/api/admin/applications/:id", verifyAdmin, async (req, res) => {
    try {
        await db.query("USE AdmissionSystem");
        const query = "DELETE FROM Applications WHERE Application_ID = ?";
        await db.query(query, [req.params.id]);
        res.status(200).json({ success: true, message: "Application deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post("/api/admin/reset", verifyAdmin, async (req, res) => {
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    await initDatabase();
    console.log(`Listening on port ${PORT}`);
});
