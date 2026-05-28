const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
require("dotenv").config();

async function resetAdmins() {
    try {
        console.log("Connecting to database...");
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        console.log("Checking database schema...");
        try {
            await connection.query(
                "ALTER TABLE Admins ADD COLUMN Role ENUM('SuperAdmin', 'Reviewer') DEFAULT 'Reviewer'",
            );
            console.log("Added missing 'Role' column.");
        } catch (err) {
            if (err.code === "ER_DUP_FIELDNAME") {
                console.log("'Role' column already exists. Proceeding...");
            } else {
                throw err;
            }
        }

        console.log("Clearing old admins...");
        await connection.query("TRUNCATE TABLE Admins");

        console.log("Hashing new password...");
        const hashedPassword = await bcrypt.hash("admin123", 10);

        console.log("Creating new SuperAdmin...");
        await connection.query(
            "INSERT INTO Admins (Username, Password_Hash, Role) VALUES (?, ?, ?)",
            ["admin@system.io", hashedPassword, "SuperAdmin"],
        );

        console.log("SUCCESS! You can now log in.");
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error("FAILED:", error.message);
        process.exit(1);
    }
}

resetAdmins();
