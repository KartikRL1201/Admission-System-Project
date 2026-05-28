const mysql = require("mysql2/promise");
require("dotenv").config();

async function configureTriggers() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        await connection.query("USE AdmissionSystem");

        const [triggers] = await connection.query("SHOW TRIGGERS");
        for (let t of triggers) {
            await connection.query(`DROP TRIGGER IF EXISTS \`${t.Trigger}\``);
        }

        try {
            await connection.query(
                "ALTER TABLE Departments ADD COLUMN Max_Capacity INT",
            );
        } catch (e) {}

        await connection.query(
            "UPDATE Departments SET Max_Capacity = 60 WHERE Dept_Name = 'Computer Science'",
        );
        await connection.query(
            "UPDATE Departments SET Max_Capacity = 60 WHERE Dept_Name = 'Information Science'",
        );
        await connection.query(
            "UPDATE Departments SET Max_Capacity = 120 WHERE Dept_Name = 'Mechanical Engineering'",
        );

        await connection.query(`
            UPDATE Departments d
            SET d.Total_Seats = d.Max_Capacity - (
                SELECT COUNT(*)
                FROM Applications a
                WHERE a.Dept_ID = d.Dept_ID AND a.Status = 'Approved'
            )
        `);

        await connection.query(`
            CREATE TRIGGER Prevent_Over_Approval
            BEFORE UPDATE ON Applications
            FOR EACH ROW
            BEGIN
                DECLARE seats INT;
                IF NEW.Status = 'Approved' AND OLD.Status != 'Approved' THEN
                    SELECT Total_Seats INTO seats FROM Departments WHERE Dept_ID = NEW.Dept_ID;
                    IF seats <= 0 THEN
                        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No seats available';
                    END IF;
                END IF;
            END
        `);

        await connection.query(`
            CREATE TRIGGER Handle_Status_Update
            AFTER UPDATE ON Applications
            FOR EACH ROW
            BEGIN
                IF NEW.Status = 'Approved' AND OLD.Status != 'Approved' THEN
                    UPDATE Departments SET Total_Seats = Total_Seats - 1 WHERE Dept_ID = NEW.Dept_ID;
                ELSEIF NEW.Status != 'Approved' AND OLD.Status = 'Approved' THEN
                    UPDATE Departments SET Total_Seats = Total_Seats + 1 WHERE Dept_ID = NEW.Dept_ID;
                END IF;
            END
        `);

        await connection.query(`
            CREATE TRIGGER Handle_Delete_Approved
            AFTER DELETE ON Applications
            FOR EACH ROW
            BEGIN
                IF OLD.Status = 'Approved' THEN
                    UPDATE Departments SET Total_Seats = Total_Seats + 1 WHERE Dept_ID = OLD.Dept_ID;
                END IF;
            END
        `);

        console.log("SUCCESS");
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

configureTriggers();
