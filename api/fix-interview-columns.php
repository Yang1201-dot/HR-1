<?php
// Direct script to drop the duplicate 'status' column from interviews table
header('Content-Type: application/json');

try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3307;dbname=hr_management;charset=utf8mb4',
        'root', '', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    
    // Drop the duplicate 'status' column, keep 'interview_status'
    $pdo->exec("ALTER TABLE interviews DROP COLUMN status");
    
    echo json_encode([
        'success' => true, 
        'message' => 'Duplicate status column dropped successfully. Only interview_status remains.'
    ]);
    
} catch(Exception $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Error dropping status column: ' . $e->getMessage()
    ]);
}
?>
