<?php
// Script to drop duplicate status column from interviews table
header('Content-Type: application/json');

try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3307;dbname=hr_management;charset=utf8mb4',
        'root', '', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    
    // Drop the duplicate status column
    try {
        $pdo->exec("ALTER TABLE interviews DROP COLUMN status");
        echo json_encode([
            'success' => true, 
            'message' => 'Duplicate status column dropped successfully'
        ]);
    } catch(Exception $e) {
        echo json_encode([
            'success' => false, 
            'message' => 'Status column does not exist or could not be dropped: ' . $e->getMessage()
        ]);
    }
    
} catch(Exception $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
}
?>
