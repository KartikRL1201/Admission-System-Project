SELECT
    a.Application_ID,
    s.First_Name,
    s.Last_Name,
    s.Merit_Score,
    d.Dept_Name,
    a.Application_Date,
    a.Status
FROM Applications a
JOIN Students s ON a.Student_ID = s.Student_ID
JOIN Departments d ON a.Dept_ID = d.Dept_ID
WHERE a.Status = ?
ORDER BY a.Application_Date DESC;

UPDATE Applications SET Status = 'Approved' WHERE Application_ID = ?;

UPDATE Applications SET Status = 'Rejected' WHERE Application_ID = ?;

UPDATE Applications SET Status = 'Pending' WHERE Application_ID = ?;

DELETE FROM Applications WHERE Application_ID = ?;