<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

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
    
    // Check if it's a POST request
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Get form data
        $fname = $_POST['first_name'] ?? '';
        $lname = $_POST['last_name'] ?? '';
        $email = $_POST['email'] ?? '';
        $phone = $_POST['phone'] ?? '';
        $position = $_POST['position'] ?? '';
        $department = $_POST['department'] ?? '';
        $location = $_POST['location'] ?? '';
        $employment_type = $_POST['employment_type'] ?? '';
        $salary = $_POST['salary'] ?? '';
        $description = $_POST['description'] ?? '';
        $job_posting_id = $_POST['job_posting_id'] ?? '';
        $message = $_POST['message'] ?? '';
        
        // Check if email already exists
        $checkStmt = $pdo->prepare("SELECT id FROM applicants WHERE email = ?");
        $checkStmt->execute([$email]);
        $existingApplicant = $checkStmt->fetch();
        
        if ($existingApplicant) {
            echo json_encode([
                'success' => false, 
                'error' => 'An application with this email already exists. Please use a different email or contact us if you need to update your application.'
            ]);
            exit;
        }
        
        // Insert into database with job posting information
        $stmt = $pdo->prepare("INSERT INTO applicants (fname, lname, email, phone, position, dept, location, employment_type, salary, description, job_posting_id, applied_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
        
        // Debug: Log the data being inserted
        error_log("Inserting application: fname=$fname, lname=$lname, email=$email, phone=$phone, position=$position, dept=$department, location=$location, job_posting_id=$job_posting_id");
        
        $result = $stmt->execute([$fname, $lname, $email, $phone, $position, $department, $location, $employment_type, $salary, $description, $job_posting_id]);
        
        if ($result) {
            $id = $pdo->lastInsertId();
            error_log("Application inserted successfully with ID: $id");
        } else {
            error_log("Failed to insert application. PDO Error: " . print_r($stmt->errorInfo(), true));
        }
        
        $id = $pdo->lastInsertId();
        
        echo json_encode([
            'success' => true, 
            'id' => $id,
            'message' => 'Application submitted successfully'
        ]);
    } else {
        echo json_encode([
            'success' => false, 
            'error' => 'Only POST requests allowed'
        ]);
    }
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'General error: ' . $e->getMessage()
    ]);
}
?>
