<?php
// Return JSON only and avoid PHP HTML error output which breaks JSON parsing on the client
ini_set('display_errors', 0);
error_reporting(0);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

function connectPDO($dbname, $user = 'root', $pass = '') {
    $ports = [3306, 3307];
    foreach ($ports as $port) {
        try {
            $dsn = "mysql:host=localhost;port={$port};dbname={$dbname};charset=utf8mb4";
            $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
            return $pdo;
        } catch (PDOException $e) {
            // try next
        }
    }
    throw new Exception('Could not connect to database on known ports');
}

$dbname = 'microfinance_hr1';
try {
    $pdo = connectPDO($dbname);

    $employee_id = $_GET['employee_id'] ?? 0;

    $stmt = $pdo->prepare("SELECT COUNT(DISTINCT AttendanceDate) as days_present, SUM(HoursWorked) as total_hours, SUM(CASE WHEN Status = 'Late' THEN 1 ELSE 0 END) as late_count FROM hr4_attendance_log WHERE EmployeeID = ? AND MONTH(AttendanceDate) = MONTH(CURDATE()) AND YEAR(AttendanceDate) = YEAR(CURDATE())");
    $stmt->execute([$employee_id]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    $working_days = date('j'); // days in current month so far
    $days_absent = $working_days - ($data['days_present'] ?? 0);

    echo json_encode([
        'success' => true,
        'days_present' => $data['days_present'] ?? 0,
        'days_absent' => max(0, $days_absent),
        'hours_worked' => round($data['total_hours'] ?? 0, 1),
        'late_ins' => $data['late_count'] ?? 0
    ]);
} catch (Exception $e) {
    // error_log($e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Database connection error']);
}
?>