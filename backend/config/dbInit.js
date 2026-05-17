const db = require("../../db");

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

module.exports = initDatabase;
