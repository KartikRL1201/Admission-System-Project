DELIMITER //

CREATE PROCEDURE Close_Admissions_For_Department(IN p_dept_id INT)
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE v_app_id INT;

    DECLARE pending_cursor CURSOR FOR
        SELECT Application_ID
        FROM Applications
        WHERE Dept_ID = p_dept_id AND Status = 'Pending';

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN pending_cursor;

    rejection_loop: LOOP
        FETCH pending_cursor INTO v_app_id;
        IF done = 1 THEN
            LEAVE rejection_loop;
        END IF;

        UPDATE Applications
        SET Status = 'Rejected'
        WHERE Application_ID = v_app_id;
    END LOOP;

    CLOSE pending_cursor;
END //

CREATE PROCEDURE Transfer_Department(
    IN p_application_id INT,
    IN p_new_dept_id INT
)
BEGIN
    DECLARE v_old_dept_id INT;
    DECLARE v_status VARCHAR(20);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
    END;

    START TRANSACTION;

    SELECT Dept_ID, Status INTO v_old_dept_id, v_status
    FROM Applications
    WHERE Application_ID = p_application_id FOR UPDATE;

    IF v_status = 'Approved' THEN
        UPDATE Departments SET Total_Seats = Total_Seats + 1 WHERE Dept_ID = v_old_dept_id;
        UPDATE Departments SET Total_Seats = Total_Seats - 1 WHERE Dept_ID = p_new_dept_id;
    END IF;

    UPDATE Applications SET Dept_ID = p_new_dept_id WHERE Application_ID = p_application_id;

    COMMIT;
END //

DELIMITER ;