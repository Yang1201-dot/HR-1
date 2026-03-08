<?php
// Enable error output buffering to catch any errors
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/api_errors.log');

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = 'localhost';
$port = '3307';
$dbname = 'hr_management';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    error_log('Database connection failed: ' . $e->getMessage());
    jsonResponse(['error' => 'Database connection failed: ' . $e->getMessage()]);
}

function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit();
}

try {
    // Get current table structure
    $stmt = $pdo->query("DESCRIBE interviews");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Current interviews table structure:\n";
    foreach ($columns as $column) {
        echo "- {$column['Field']} ({$column['Type']})\n";
    }
    
    // Check if notes column exists
    $hasNotes = false;
    foreach ($columns as $column) {
        if ($column['Field'] === 'notes') {
            $hasNotes = true;
            break;
        }
    }
    
    if ($hasNotes) {
        echo "\n✅ Notes column already exists!\n";
        jsonResponse(['success' => true, 'message' => 'Notes column already exists', 'columns' => $columns]);
    } else {
        echo "\n❌ Notes column missing. Cannot add due to row size limit.\n";
        echo "📝 Solution: Use existing 'interview_status' column or modify table structure.\n";
        jsonResponse(['error' => 'Notes column missing due to row size limit', 'columns' => $columns]);
    }
    
} catch(PDOException $e) {
    error_log('Error checking table structure: ' . $e->getMessage());
    jsonResponse(['error' => 'Error checking table structure: ' . $e->getMessage()]);
}
?>
