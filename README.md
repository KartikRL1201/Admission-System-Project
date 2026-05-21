College Admission Management System
A full-stack web application built with the MERN stack (MySQL, Express, React, Node.js) to automate and manage college admission procedures dynamically.

Key Features
->Dynamic Analytics Dashboard: Visualizes application funnel statistics and real-time department enrollment distributions via responsive bar charts.
->Advanced DBMS Automations: Implements robust database performance optimizations and checks using custom Triggers, Stored Procedures, Cursors, and ACID-compliant Transactions.
->Role-Based Security: Protected administrative controls backed by JWT-based token authentication.

Setup Instructions

1. Prerequisites
Ensure you have the following installed locally on your system:
->Node.js (v18 or higher recommended)

2. Database Environment Setup
->Create a .env file in the root backend directory and configure your MySQL database credentials:
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=AdmissionSystem
JWT_SECRET=your_jwt_secret_key

4. Frontend Dependency Setup
Navigate to the frontend folder and install the necessary data visualization packages:
->cd frontend
->npm install
->npm install recharts
->cd ..

4. Running the Application
From the root project directory, run the concurrent startup command. The backend initialization file will automatically compile and inject the schema, triggers, and procedures directly into your database.
->npm run dev
Frontend UI: Running locally on http://localhost:5173/
Backend Server: Running locally on http://localhost:5000/
