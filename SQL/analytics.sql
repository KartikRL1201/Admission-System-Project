DELIMITER //

CREATE PROCEDURE Generate_Admission_Report()
BEGIN
    SELECT d.Dept_Name,
           COUNT(a.Application_ID) AS Total_Applications,
           SUM(CASE WHEN a.Status = 'Approved' THEN 1 ELSE 0 END) AS Total_Admitted,
           IFNULL(AVG(s.Merit_Score), 0) AS Avg_Score
    FROM Departments d
    LEFT JOIN Applications a ON d.Dept_ID = a.Dept_ID
    LEFT JOIN Students s ON a.Student_ID = s.Student_ID
    GROUP BY d.Dept_ID;
END //

DELIMITER ;