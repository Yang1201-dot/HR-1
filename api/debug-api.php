<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection
$host = 'localhost';
$port = '3307'; // MySQL is running on port 3307
$dbname = 'hr_management';
$username = 'root';
$password = ''; // Empty password (commented out in config)

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode([
        'error' => 'Database connection failed', 
        'message' => $e->getMessage(),
        'host' => $host,
        'dbname' => $dbname
    ]);
    exit();
}

function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Debug: Show what we received
echo json_encode([
    'debug' => true,
    'method' => $method,
    'action' => $action,
    'database_connected' => true,
    'message' => 'API is working'
]);
?>
