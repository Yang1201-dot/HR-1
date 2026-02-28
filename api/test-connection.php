<?php
// Simple connection test
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
    
    echo json_encode([
        'success' => true,
        'message' => 'Connection successful',
        'host' => $host,
        'port' => $port,
        'dbname' => $dbname,
        'username' => $username
    ]);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Connection failed: ' . $e->getMessage()
    ]);
}
?>
