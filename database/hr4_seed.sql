-- Minimal HR4 seed for local development
-- Creates hr4 database, useraccounts, employee and attendance log with a sample user

CREATE DATABASE IF NOT EXISTS hr4;
USE hr4;

-- employee table (minimal)
CREATE TABLE IF NOT EXISTS `employee` (
  `EmployeeID` INT AUTO_INCREMENT PRIMARY KEY,
  `FirstName` VARCHAR(100) NOT NULL,
  `LastName` VARCHAR(100) NOT NULL,
  `Email` VARCHAR(255)
);

-- useraccounts table compatible with existing PHP code
CREATE TABLE IF NOT EXISTS `useraccounts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `EmployeeID` INT,
  `Email` VARCHAR(255) NOT NULL,
  `PasswordHash` VARCHAR(255) DEFAULT NULL,
  `PasswordPlain` VARCHAR(255) DEFAULT NULL,
  `AccountStatus` VARCHAR(20) DEFAULT 'Active'
);

-- attendance log table used by get-attendance-summary.php
CREATE TABLE IF NOT EXISTS `hr4_attendance_log` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `EmployeeID` INT NOT NULL,
  `AttendanceDate` DATE NOT NULL,
  `HoursWorked` DECIMAL(5,2) DEFAULT 0,
  `Status` VARCHAR(20) DEFAULT 'Present'
);

-- Insert a sample employee and account (dev convenience: PasswordPlain set to 'Admin@12345')
INSERT INTO `employee` (`FirstName`, `LastName`, `Email`) VALUES ('Suruiz', 'Joshua', 'suruiz.joshuabcp@gmail.com');
SET @eid = LAST_INSERT_ID();
INSERT INTO `useraccounts` (`EmployeeID`, `Email`, `PasswordPlain`, `AccountStatus`) VALUES (@eid, 'suruiz.joshuabcp@gmail.com', 'Admin@12345', 'Active');

-- Add some attendance sample rows for the current month
INSERT INTO `hr4_attendance_log` (`EmployeeID`, `AttendanceDate`, `HoursWorked`, `Status`) VALUES
(@eid, CURDATE(), 8, 'Present'),
(@eid, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 8, 'Present'),
(@eid, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 7.5, 'Late');

-- End of seed
