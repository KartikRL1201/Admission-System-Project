SELECT Status, COUNT(*) as Count
FROM Applications
GROUP BY Status;

SELECT
    d.Dept_Name,
    d.Total_Seats,
    COUNT(a.Application_ID) as Total_Applicants,
    IFNULL(AVG(s.Merit_Score), 0) as Avg_Merit
FROM Departments d
LEFT JOIN Applications a ON d.Dept_ID = a.Dept_ID
LEFT JOIN Students s ON a.Student_ID = s.Student_ID
GROUP BY d.Dept_ID
ORDER BY Total_Applicants DESC;

SELECT s.First_Name, s.Last_Name, s.Merit_Score, d.Dept_Name
FROM Applications a
JOIN Students s ON a.Student_ID = s.Student_ID
JOIN Departments d ON a.Dept_ID = d.Dept_ID
WHERE a.Status = 'Pending'
ORDER BY s.Merit_Score DESC
LIMIT 5;