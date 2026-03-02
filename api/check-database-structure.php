<?php
// Check database structure
header('Content-Type: application/json');

$host = 'localhost';
$port = '3307';
$dbname = 'hr_management';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get applicants table structure
    $stmt = $pdo->query("DESCRIBE applicants");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Count existing records
    $countStmt = $pdo->query("SELECT COUNT(*) as count FROM applicants");
    $count = $countStmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    // Check if applicant_files table exists
    $tablesStmt = $pdo->query("SHOW TABLES LIKE 'applicant_files'");
    $fileTableExists = $tablesStmt->rowCount() > 0;
    
    $fileColumns = [];
    if ($fileTableExists) {
        $fileStmt = $pdo->query("DESCRIBE applicant_files");
        $fileColumns = $fileStmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    echo json_encode([
        'success' => true,
        'database' => $dbname,
        'applicants_table' => [
            'exists' => true,
            'columns' => array_column($columns, 'Field'),
            'record_count' => $count,
            'full_structure' => $columns
        ],
        'applicant_files_table' => [
            'exists' => $fileTableExists,
            'columns' => $fileTableExists ? array_column($fileColumns, 'Field') : [],
            'full_structure' => $fileColumns
        ]
    ], JSON_PRETTY_PRINT);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
