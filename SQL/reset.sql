SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE Applications;

TRUNCATE TABLE Students;

UPDATE Departments SET Total_Seats = 60 WHERE Dept_Name = 'Computer Science';

UPDATE Departments SET Total_Seats = 60 WHERE Dept_Name = 'Information Science';

UPDATE Departments SET Total_Seats = 120 WHERE Dept_Name = 'Mechanical Engineering';

SET FOREIGN_KEY_CHECKS = 1;