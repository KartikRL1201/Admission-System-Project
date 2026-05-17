const db = require("./db");

async function removeAdmin() {
    try {
        await db.query("USE AdmissionSystem");
        await db.query("DELETE FROM Admins WHERE Username = 'admin'");
        console.log("Success: The admin account has been permanently removed.");
        process.exit(0);
    } catch (err) {
        console.error("Error:", err.message);
        process.exit(1);
    }
}

removeAdmin();
