<?php
header('Content-Type: application/json');

// Database connection
$host = 'localhost';
$port = '3307';
$dbname = 'hr_management';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $username, $password);
    
    // Test basic query
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM applicants");
    $result = $stmt->fetch();
    
    echo json_encode([
        'success' => true,
        'message' => 'API working perfectly!',
        'applicant_count' => $result['count']
    ]);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
