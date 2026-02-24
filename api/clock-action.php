<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Connect to HR1 database for attendance
$pdo_hr1 = new PDO("mysql:host=localhost;dbname=microfinance_hr1;port=3307", 'root', '');
$pdo_hr1->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$data = json_decode(file_get_contents('php://input'), true);
$employee_id = $data['employee_id'];
$action = $data['action'];
$timestamp = $data['timestamp'];

try {
    if ($action === 'clock_in') {
        $stmt = $pdo_hr1->prepare("
            INSERT INTO attendance_log (EmployeeID, ClockInTime, AttendanceDate, Status) 
            VALUES (?, ?, DATE(?), 'On Time')
        ");
        $stmt->execute([$employee_id, $timestamp, $timestamp]);
    } else if ($action === 'clock_out') {
        $hours = $data['hours_worked'];
        $stmt = $pdo_hr1->prepare("
            UPDATE attendance_log 
            SET ClockOutTime = ?, HoursWorked = ? 
            WHERE EmployeeID = ? AND AttendanceDate = CURDATE() AND ClockOutTime IS NULL
        ");
        $stmt->execute([$timestamp, $hours, $employee_id]);
    }
    
    echo json_encode(['success' => true]);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>