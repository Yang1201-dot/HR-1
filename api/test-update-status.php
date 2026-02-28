<?php
// Test the update_status endpoint
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
    
    // Test update
    $applicantId = '6'; // Use existing applicant ID
    $newStatus = 'under-review';
    
    $stmt = $pdo->prepare("UPDATE applicants SET status = ?, updated_at = NOW() WHERE id = ?");
    $stmt->execute([$newStatus, $applicantId]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Status update test successful',
        'applicant_id' => $applicantId,
        'new_status' => $newStatus
    ]);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
