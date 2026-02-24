<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Connect to HR4 database for login
$pdo_hr4 = new PDO("mysql:host=localhost;dbname=hr4;port=3307", 'root', '');
$pdo_hr4->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$data = json_decode(file_get_contents('php://input'), true);
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

try {
    // Check HR4's useraccounts and roles tables
    $stmt = $pdo_hr4->prepare("
        SELECT ua.*, e.FirstName, e.LastName, r.RoleName
        FROM useraccounts ua
        JOIN employee e ON ua.EmployeeID = e.EmployeeID
        JOIN useraccountroles uar ON ua.AccountID = uar.AccountID
        JOIN roles r ON uar.RoleID = r.RoleID
        WHERE (ua.Username = ? OR ua.Email = ?) 
        AND ua.AccountStatus = 'Active'
        AND r.RoleName IN ('HR Manager', 'HR STAFF', 'Administrator')
    ");
    $stmt->execute([$username, $username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user && password_verify($password, $user['PasswordHash'])) {
        $role = ($user['RoleName'] === 'HR Manager') ? 'HR_Manager' : 'HR_Staff';
        
        echo json_encode([
            'success' => true,
            'token' => bin2hex(random_bytes(32)),
            'name' => $user['FirstName'] . ' ' . $user['LastName'],
            'staff_id' => $user['EmployeeID'],
            'role' => $role
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
    }
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>