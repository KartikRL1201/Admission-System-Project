const db = require("../db");
const bcrypt = require("bcrypt");

async function seed() {
    try {
        console.log("Starting database seeding...");

        await db.query("USE AdmissionSystem");

        console.log("Cleaning existing records...");
        await db.query("SET FOREIGN_KEY_CHECKS = 0");
        await db.query("TRUNCATE TABLE Ticket_Replies");
        await db.query("TRUNCATE TABLE Tickets");
        await db.query("TRUNCATE TABLE Audit_Logs");
        await db.query("TRUNCATE TABLE Applications");
        await db.query("TRUNCATE TABLE Students");
        await db.query("TRUNCATE TABLE Admins");
        
        await db.query("UPDATE Departments SET Total_Seats = 60 WHERE Dept_Name = 'Computer Science'");
        await db.query("UPDATE Departments SET Total_Seats = 60 WHERE Dept_Name = 'Information Science'");
        await db.query("UPDATE Departments SET Total_Seats = 120 WHERE Dept_Name = 'Mechanical Engineering'");
        await db.query("SET FOREIGN_KEY_CHECKS = 1");

        const [depts] = await db.query("SELECT Dept_ID, Dept_Name FROM Departments");
        if (depts.length === 0) {
            console.error("Departments not found. Run the server first to initialize departments.");
            process.exit(1);
        }

        const deptMap = {};
        depts.forEach(d => {
            deptMap[d.Dept_Name] = d.Dept_ID;
        });

        console.log("Seeding Admins...");
        const admins = [
            { username: "admin@system.io", password: "admin123", role: "SuperAdmin" },
            { username: "reviewer1", password: "rev1", role: "Reviewer" },
            { username: "reviewer2", password: "rev2", role: "Reviewer" }
        ];

        for (const admin of admins) {
            const hashedPassword = await bcrypt.hash(admin.password, 10);
            await db.query(
                "INSERT INTO Admins (Username, Password_Hash, Role) VALUES (?, ?, ?)",
                [admin.username, hashedPassword, admin.role]
            );
        }

        console.log("Inserting 15 pending students...");
        const students = [
            { first: "Aarav", last: "Sharma", email: "aarav.sharma@example.com", phone: "9876543210", merit: 94.5 },
            { first: "Aditya", last: "Verma", email: "aditya.verma@example.com", phone: "9876543211", merit: 88.2 },
            { first: "Ananya", last: "Iyer", email: "ananya.iyer@example.com", phone: "9876543212", merit: 91.8 },
            { first: "Diya", last: "Patel", email: "diya.patel@example.com", phone: "9876543213", merit: 76.5 },
            { first: "Kabir", last: "Mehta", email: "kabir.mehta@example.com", phone: "9876543214", merit: 82.0 },
            { first: "Ishaan", last: "Nair", email: "ishaan.nair@example.com", phone: "9876543215", merit: 95.0 },
            { first: "Meera", last: "Joshi", email: "meera.joshi@example.com", phone: "9876543216", merit: 89.4 },
            { first: "Pranav", last: "Rao", email: "pranav.rao@example.com", phone: "9876543217", merit: 79.1 },
            { first: "Riya", last: "Sen", email: "riya.sen@example.com", phone: "9876543218", merit: 97.2 },
            { first: "Rohan", last: "Gupta", email: "rohan.gupta@example.com", phone: "9876543219", merit: 85.0 },
            { first: "Siddharth", last: "Singh", email: "siddharth.singh@example.com", phone: "9876543220", merit: 90.5 },
            { first: "Tanya", last: "Choudhury", email: "tanya.c@example.com", phone: "9876543221", merit: 83.6 },
            { first: "Vivaan", last: "Kapoor", email: "vivaan.k@example.com", phone: "9876543222", merit: 72.8 },
            { first: "Zoya", last: "Khan", email: "zoya.khan@example.com", phone: "9876543223", merit: 93.1 },
            { first: "Dev", last: "Mishra", email: "dev.mishra@example.com", phone: "9876543224", merit: 87.9 }
        ];

        const studentIds = [];
        for (const s of students) {
            const [res] = await db.query(
                "INSERT INTO Students (First_Name, Last_Name, Email, Phone, Merit_Score) VALUES (?, ?, ?, ?, ?)",
                [s.first, s.last, s.email, s.phone, s.merit]
            );
            studentIds.push({ id: res.insertId, name: `${s.first} ${s.last}` });
        }

        console.log("Inserting pending applications...");
        const appStatuses = [
            { dept: 'Computer Science' },
            { dept: 'Computer Science' },
            { dept: 'Information Science' },
            { dept: 'Mechanical Engineering' },
            { dept: 'Computer Science' },
            { dept: 'Computer Science' },
            { dept: 'Information Science' },
            { dept: 'Mechanical Engineering' },
            { dept: 'Computer Science' },
            { dept: 'Information Science' },
            { dept: 'Computer Science' },
            { dept: 'Mechanical Engineering' },
            { dept: 'Mechanical Engineering' },
            { dept: 'Information Science' },
            { dept: 'Computer Science' }
        ];

        const applicationIds = [];
        for (let i = 0; i < studentIds.length; i++) {
            const student = studentIds[i];
            const appConfig = appStatuses[i];
            const deptId = deptMap[appConfig.dept];

            // Explicitly all set to 'Pending'
            const [res] = await db.query(
                "INSERT INTO Applications (Student_ID, Dept_ID, Status) VALUES (?, ?, 'Pending')",
                [student.id, deptId]
            );
            
            applicationIds.push({ appId: res.insertId, studentName: student.name, deptName: appConfig.dept });
        }

        console.log("Generating support tickets and chats...");
        const ticketTopics = [
            {
                appIdx: 3, 
                subject: "Requesting update on my Application status",
                replies: [
                    { sender: "Student", msg: "Hello, I submitted my application last week. When can I expect a decision?" },
                    { sender: "admin@system.io", msg: "Hi Diya, your merit score (76.5) is currently being reviewed for Mechanical Engineering. We will update the status shortly." },
                    { sender: "Student", msg: "Thank you for the update. Looking forward to it!" }
                ]
            },
            {
                appIdx: 4, 
                subject: "Typo in my Phone Number",
                replies: [
                    { sender: "Student", msg: "Hi, I wrote my phone number incorrectly. It should be 9876543299 instead of 9876543214." },
                    { sender: "admin@system.io", msg: "Hello Kabir, we have noted your correction. The department reviewer has been informed." }
                ]
            },
            {
                appIdx: 7, 
                subject: "Query regarding application criteria",
                replies: [
                    { sender: "Student", msg: "Hello, I wanted to know the cutoff score for Mechanical?" },
                    { sender: "admin@system.io", msg: "Hi Pranav, cutoff details will be finalized shortly. Please wait for your application status update." }
                ]
            },
            {
                appIdx: 9, 
                subject: "Can I transfer to Computer Science?",
                replies: [
                    { sender: "Student", msg: "Hi, I applied for IS but want to change my preference to CS if seats are available." },
                    { sender: "admin@system.io", msg: "Hello Rohan, CS seats are highly competitive. You can request a transfer only after the initial round is processed." }
                ]
            },
            {
                appIdx: 11, 
                subject: "Hostel accommodation details needed",
                replies: [
                    { sender: "Student", msg: "Hello, does the mechanical engineering campus have girls hostel facilities?" },
                    { sender: "admin@system.io", msg: "Yes Tanya, we have fully equipped girls hostels on campus. Once approved, you will receive a hostel registration link." }
                ]
            },
            {
                appIdx: 12, 
                subject: "Is there a waitlist option?",
                replies: [
                    { sender: "Student", msg: "Hello, can I be put on a waitlist if seats fill up?" },
                    { sender: "admin@system.io", msg: "Hi Vivaan, waitlisting is only offered once all standard acceptances are processed." }
                ]
            }
        ];

        for (const t of ticketTopics) {
            const app = applicationIds[t.appIdx];
            const [res] = await db.query(
                "INSERT INTO Tickets (Application_ID, Subject, Status) VALUES (?, ?, ?)",
                [app.appId, t.subject, 'Open']
            );
            const ticketId = res.insertId;

            for (const r of t.replies) {
                await db.query(
                    "INSERT INTO Ticket_Replies (Ticket_ID, Sender, Message) VALUES (?, ?, ?)",
                    [ticketId, r.sender, r.msg]
                );
            }
        }

        console.log("Database seeded successfully with pending students and open tickets (NO logs)!");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed: ", err);
        process.exit(1);
    }
}

seed();