DROP TRIGGER IF EXISTS Decrease_Seats_On_Approval;

DELIMITER //
CREATE TRIGGER Decrease_Seats_On_Approval
AFTER UPDATE ON Applications
FOR EACH ROW
BEGIN
    DECLARE current_seats INT;
    SELECT Total_Seats INTO current_seats FROM Departments WHERE Dept_ID = NEW.Dept_ID;

    IF NEW.Status = 'Approved' AND OLD.Status != 'Approved' THEN
        IF current_seats <= 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Operation Cancelled: No remaining seats available in this department.';
        ELSE
            UPDATE Departments
            SET Total_Seats = Total_Seats - 1
            WHERE Dept_ID = NEW.Dept_ID;
        END IF;
    END IF;
END //
DELIMITER ;