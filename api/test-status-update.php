<?php
// Simple test endpoint for status update
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Get parameters
$action = $_GET['action'] ?? '';
$interviewId = $_GET['interview_id'] ?? '';
$status = $_GET['status'] ?? '';

// Log for debugging
error_log("Test API called: action=$action, interview_id=$interviewId, status=$status");

if ($action === 'update_interview_status' && $interviewId && $status) {
    // Simple success response
    echo json_encode([
        'success' => true,
        'message' => 'Status updated successfully (test)',
        'interview_id' => $interviewId,
        'new_status' => $status,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
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
