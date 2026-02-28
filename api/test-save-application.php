<?php
// Test the save_application endpoint
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
    
    echo json_encode([
        'success' => true,
        'message' => 'Database connection successful',
        'test_data' => [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'phone' => '123456789',
            'position' => 'Test Position',
            'message' => 'Test message'
        ]
    ]);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database connection failed: ' . $e->getMessage()
    ]);
}
?>
