INSERT INTO Students (First_Name, Last_Name, Email, Phone, Merit_Score)
VALUES (?, ?, ?, ?, ?);

INSERT INTO Applications (Student_ID, Dept_ID)
VALUES (?, ?);

INSERT INTO Tickets (Application_ID, Subject) 
VALUES (?, ?);

INSERT INTO Ticket_Replies (Ticket_ID, Sender, Message) 
VALUES (?, ?, ?);

INSERT INTO Audit_Logs (Action_Type, Description, Admin_Username) 
VALUES (?, ?, ?);