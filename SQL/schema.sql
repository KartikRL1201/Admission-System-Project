-- =================================================================================
-- ADMISSION SYSTEM - CORE DATABASE SCHEMA
-- This file defines the core tables required for the University Admission System.
-- Execute this script before attempting to start the backend services.
-- =================================================================================

-- Create the database if it doesn't exist and switch to it
CREATE DATABASE IF NOT EXISTS AdmissionSystem;
USE AdmissionSystem;

-- --------------------------------------------------------------------------------
-- Table: Admins
-- Purpose: Stores credentials and roles for system administrators.
-- Notes: Passwords must be hashed (e.g., via bcrypt) before insertion.
-- --------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Admins (
    Admin_ID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) UNIQUE NOT NULL,
    Password_Hash VARCHAR(255) NOT NULL,
    Role VARCHAR(20) DEFAULT 'Reviewer',
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------------------
-- Table: Departments
-- Purpose: Holds available departments/courses and their total seat capacities.
-- --------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Departments (
    Dept_ID INT AUTO_INCREMENT PRIMARY KEY,
    Dept_Name VARCHAR(100) NOT NULL UNIQUE,
    Total_Seats INT NOT NULL
);

-- --------------------------------------------------------------------------------
-- Table: Students
-- Purpose: Records base student information and their computed merit score.
-- --------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Students (
    Student_ID INT AUTO_INCREMENT PRIMARY KEY,
    First_Name VARCHAR(50) NOT NULL,
    Last_Name VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Phone VARCHAR(15),
    Merit_Score DECIMAL(5,2)
);

-- --------------------------------------------------------------------------------
-- Table: Applications
-- Purpose: Links students to their chosen department.
-- Status Workflow: Pending -> (Approved | Rejected) -> Archived
-- --------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Applications (
    Application_ID INT AUTO_INCREMENT PRIMARY KEY,
    Student_ID INT,
    Dept_ID INT,
    Application_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Pending', 'Approved', 'Rejected', 'Archived') DEFAULT 'Pending',
    FOREIGN KEY (Student_ID) REFERENCES Students(Student_ID) ON DELETE CASCADE,
    FOREIGN KEY (Dept_ID) REFERENCES Departments(Dept_ID) ON DELETE CASCADE
);

-- --------------------------------------------------------------------------------
-- Table: Audit_Logs
-- Purpose: Tracks administrative actions for accountability and transparency.
-- --------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Audit_Logs (
    Log_ID INT AUTO_INCREMENT PRIMARY KEY,
    Action_Type VARCHAR(50) NOT NULL,
    Description TEXT NOT NULL,
    Admin_Username VARCHAR(50),
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------------------
-- Table: Tickets
-- Purpose: Helpdesk tickets raised by students regarding their application.
-- --------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Tickets (
    Ticket_ID INT AUTO_INCREMENT PRIMARY KEY,
    Application_ID INT,
    Subject VARCHAR(255) NOT NULL,
    Status ENUM('Open', 'Resolved') DEFAULT 'Open',
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Application_ID) REFERENCES Applications(Application_ID) ON DELETE CASCADE
);

-- --------------------------------------------------------------------------------
-- Table: Ticket_Replies
-- Purpose: Individual chat messages/replies inside a specific support ticket.
-- --------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Ticket_Replies (
    Reply_ID INT AUTO_INCREMENT PRIMARY KEY,
    Ticket_ID INT,
    Sender VARCHAR(50) NOT NULL,
    Message TEXT NOT NULL,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Ticket_ID) REFERENCES Tickets(Ticket_ID) ON DELETE CASCADE
);