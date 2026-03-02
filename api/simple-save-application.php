<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/application_save.log');

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection
$host = 'localhost';
$port = '3307';
$dbname = 'hr_management';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    error_log("=== APPLICATION SUBMISSION START ===");
    error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);
    error_log("POST Data: " . print_r($_POST, true));
    error_log("FILES Data: " . print_r(array_keys($_FILES), true));
    
    // Check if it's a POST request
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Only POST requests allowed');
    }
    
    // Get form data
    $fname = $_POST['first_name'] ?? '';
    $mname = $_POST['middle_name'] ?? '';
    $lname = $_POST['last_name'] ?? '';
    $email = $_POST['email'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $position = $_POST['position'] ?? '';
    $department = $_POST['department'] ?? '';
    $location = $_POST['location'] ?? '';
    $employment_type = $_POST['employment_type'] ?? '';
    $salary = $_POST['salary'] ?? '';
    $description = $_POST['description'] ?? '';
    $job_posting_id = $_POST['job_posting_id'] ?? null;
    $message = $_POST['message'] ?? '';
    
    // Combine middle name with first name since table doesn't have mname column
    if (!empty($mname)) {
        $fname = $fname . ' ' . $mname;
    }
    
    error_log("Applicant Data:");
    error_log("  Name: $fname $lname");
    error_log("  Email: $email");
    error_log("  Phone: $phone");
    error_log("  Position: $position");
    error_log("  Department: $department");
    
    // Validate required fields
    if (empty($fname) || empty($lname) || empty($email) || empty($phone)) {
        error_log("Validation failed: Missing required fields");
        throw new Exception('Missing required fields: first_name, last_name, email, or phone');
    }
    
    // Check if email already exists
    $checkStmt = $pdo->prepare("SELECT id FROM applicants WHERE email = ?");
    $checkStmt->execute([$email]);
    $existingApplicant = $checkStmt->fetch();
    
    if ($existingApplicant) {
        error_log("Application rejected: Email already exists");
        echo json_encode([
            'success' => false, 
            'error' => 'An application with this email already exists. Please use a different email.'
        ]);
        exit;
    }
    
    // Start transaction
    $pdo->beginTransaction();
    error_log("Transaction started");
    
    // Insert applicant into database
    // Note: status is lowercase 'new' (ENUM constraint), no mname column
    $sql = "INSERT INTO applicants (
        fname, 
        lname, 
        email, 
        phone, 
        position, 
        dept, 
        location, 
        employment_type, 
        salary, 
        description, 
        job_posting_id, 
        message,
        status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')";
    
    $stmt = $pdo->prepare($sql);
    
    error_log("Executing INSERT with values:");
    error_log("  fname: $fname");
    error_log("  lname: $lname");
    error_log("  email: $email");
    
    $result = $stmt->execute([
        $fname, 
        $lname, 
        $email, 
        $phone, 
        $position, 
        $department, 
        $location, 
        $employment_type, 
        $salary, 
        $description, 
        $job_posting_id,
        $message
    ]);
    
    $applicant_id = $pdo->lastInsertId();
    error_log("✓ Applicant inserted successfully with ID: $applicant_id");
    
    // Handle file uploads to applicant_files table
    $uploadedFiles = [];
    $fileFields = [
        'resume' => 'Resume / CV',
        'birth_certificate' => 'Birth Certificate',
        'diploma' => 'Diploma / TOR',
        'cover_letter' => 'Cover Letter'
    ];
    
    error_log("=== FILE UPLOAD DEBUG ===");
    error_log("FILES array: " . print_r($_FILES, true));
    error_log("Expected file fields: " . implode(', ', array_keys($fileFields)));
    
    foreach ($fileFields as $fieldName => $displayName) {
        if (isset($_FILES[$fieldName]) && $_FILES[$fieldName]['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES[$fieldName];
            
            error_log("Processing file: $fieldName");
            error_log("  File name: " . $file['name']);
            error_log("  File size: " . $file['size'] . " bytes");
            error_log("  File type: " . $file['type']);
            
            $fileName = $file['name'];
            $fileSize = $file['size'];
            $fileType = $file['type'];
            
            // Save file to applicant_files table with field name
            try {
                $fileStmt = $pdo->prepare("
                    INSERT INTO applicant_files 
                    (applicant_id, file_name, file_type, file_size, file_path, uploaded_at, file_field) 
                    VALUES (?, ?, ?, ?, ?, NOW(), ?)
                ");
                
                $fileStmt->execute([
                    $applicant_id,
                    $fileName,
                    $fileType,
                    $fileSize,
                    $fileName,  // Using filename as path for now
                    $fieldName  // Store which form field this file came from
                ]);
                
                $file_id = $pdo->lastInsertId();
                error_log("  ✓ File saved to applicant_files with ID: $file_id");
                
                $uploadedFiles[$fieldName] = [
                    'id' => $file_id,
                    'name' => $fileName,
                    'size' => $fileSize,
                    'type' => $fileType
                ];
            } catch (PDOException $fileErr) {
                error_log("  ✗ Error saving file to applicant_files: " . $fileErr->getMessage());
                // Continue even if file save fails
                $uploadedFiles[$fieldName] = [
                    'name' => $fileName,
                    'error' => 'Could not save file: ' . $fileErr->getMessage()
                ];
            }
        } else if (isset($_FILES[$fieldName])) {
            $errorCode = $_FILES[$fieldName]['error'];
            error_log("File upload error for $fieldName: error code $errorCode");
        }
    }
    
    // Commit transaction
    $pdo->commit();
    error_log("✓ Transaction committed successfully");
    error_log("Total files uploaded: " . count($uploadedFiles));
    error_log("=== APPLICATION SUBMISSION SUCCESS ===");
    
    echo json_encode([
        'success' => true, 
        'id' => $applicant_id,
        'files' => $uploadedFiles,
        'message' => 'Application submitted successfully',
        'debug' => [
            'applicant_id' => $applicant_id,
            'files_count' => count($uploadedFiles),
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ]);
    
} catch(PDOException $e) {
    // Rollback if transaction was started
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
        error_log("Transaction rolled back");
    }
    error_log("=== PDO EXCEPTION ===");
    error_log("Message: " . $e->getMessage());
    error_log("Code: " . $e->getCode());
    error_log("SQL State: " . $e->errorInfo[0] ?? 'N/A');
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage(),
        'error_code' => $e->getCode()
    ]);
} catch(Exception $e) {
    // Rollback if transaction was started
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
        error_log("Transaction rolled back");
    }
    error_log("=== GENERAL EXCEPTION ===");
    error_log("Message: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Error: ' . $e->getMessage()
    ]);
}
?>
