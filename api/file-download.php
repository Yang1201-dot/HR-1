<?php
// File Download API
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Database connection (same as simple-api-new.php)
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

try {
    // Get parameters
    $applicantId = $_GET['applicant_id'] ?? null;
    $fileKey = $_GET['file_key'] ?? null;
    $viewMode = $_GET['view'] ?? null;
    
    if (!$applicantId || !$fileKey) {
        jsonResponse(['error' => 'Missing applicant_id or file_key parameter'], 400);
        exit;
    }
    
    // Map file keys to database field names
    $fieldMap = [
        'resume' => 'resume',
        'birth' => 'birth_certificate', 
        'diploma' => 'diploma',
        'cover' => 'cover_letter'
    ];
    
    $fieldName = $fieldMap[$fileKey] ?? null;
    if (!$fieldName) {
        jsonResponse(['error' => 'Invalid file key'], 400);
        exit;
    }
    
    // Get file from applicant_files table
    $stmt = $pdo->prepare("
        SELECT * FROM applicant_files 
        WHERE applicant_id = ? AND file_field = ?
        ORDER BY uploaded_at DESC 
        LIMIT 1
    ");
    $stmt->execute([$applicantId, $fieldName]);
    $file = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$file) {
        jsonResponse(['error' => 'File not found'], 404);
        exit;
    }
    
    // Debug: Log file info
    error_log("File download debug - File info: " . print_r($file, true));
    
    // Set headers for download/view
    $fileName = $file['file_name'];
    $fileSize = $file['file_size'];
    $mimeType = $file['file_type'] ?: 'application/octet-stream';
    
    if ($viewMode) {
        // View mode - display in browser
        header('Content-Type: ' . $mimeType);
        header('Content-Disposition: inline; filename="' . $fileName . '"');
    } else {
        // Download mode - force download
        header('Content-Type: ' . $mimeType);
        header('Content-Disposition: attachment; filename="' . $fileName . '"');
        header('Content-Length: ' . $fileSize);
    }
    
    // Prevent caching
    header('Cache-Control: no-cache, must-revalidate');
    header('Pragma: no-cache');
    header('Expires: 0);
    
    // Output file content from database
    echo $file['file_content'];
    exit;
    
} catch (Exception $e) {
    error_log('File download error: ' . $e->getMessage());
    jsonResponse(['error' => 'Internal server error'], 500);
}

function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}
?>
