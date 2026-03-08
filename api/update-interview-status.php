<?php
// Working status update endpoint
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Database connection
$host = 'localhost';
$port = '3307';
$dbname = 'hr_management';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Get parameters
$action = $_GET['action'] ?? '';
$interviewId = $_GET['interview_id'] ?? '';
$status = $_GET['status'] ?? '';

// Log for debugging
error_log("Status update API called: action=$action, interview_id=$interviewId, status=$status");

if ($action === 'update_interview_status' && $interviewId && $status) {
    try {
        // Update the interview status
        $stmt = $pdo->prepare("
            UPDATE interviews 
            SET interview_status = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        ");
        $stmt->execute([$status, $interviewId]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Interview status updated successfully',
                'interview_id' => $interviewId,
                'new_status' => $status,
                'timestamp' => date('Y-m-d H:i:s')
            ]);
        } else {
            echo json_encode([
                'error' => 'Interview not found or no changes made',
                'interview_id' => $interviewId,
                'status' => $status
            ]);
        }
    } catch(Exception $e) {
        echo json_encode(['error' => 'Failed to update status: ' . $e->getMessage()]);
    }
} else {
    echo json_encode([
        'error' => 'Missing parameters',
        'received' => [
            'action' => $action,
            'interview_id' => $interviewId,
            'status' => $status
        ]
    ]);
}
?>
