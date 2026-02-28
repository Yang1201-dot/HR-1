<?php
// Debug the save_application endpoint
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

// Database connection
$host = 'localhost';
$port = '3307';
$dbname = 'hr_management';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Simulate POST data
    $_POST['first_name'] = 'Test';
    $_POST['last_name'] = 'User';
    $_POST['email'] = 'test@example.com';
    $_POST['phone'] = '123456789';
    $_POST['position'] = 'Test Position';
    $_POST['message'] = 'Test message';
    
    // Get form data
    $fname = $_POST['first_name'] ?? '';
    $lname = $_POST['last_name'] ?? '';
    $email = $_POST['email'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $position = $_POST['position'] ?? '';
    $message = $_POST['message'] ?? '';
    
    echo json_encode([
        'success' => true,
        'debug' => 'Data received',
        'data' => [
            'fname' => $fname,
            'lname' => $lname,
            'email' => $email,
            'phone' => $phone,
            'position' => $position,
            'message' => $message
        ]
    ]);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database connection failed: ' . $e->getMessage()
    ]);
}
?>
