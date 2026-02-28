<?php
error_reporting(E_ALL);
ini_set('display_errors', 0); // Turn off display_errors to prevent HTML in JSON
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
    error_log('Database connection failed: ' . $e->getMessage());
    jsonResponse(['error' => 'Database connection failed: ' . $e->getMessage()]);
}

function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch($action) {
    case 'test':
        jsonResponse(['message' => 'API is working', 'timestamp' => date('Y-m-d H:i:s')]);
        break;
        
    case 'get_applications':
        // First check if there are any applicants
        $countStmt = $pdo->query("SELECT COUNT(*) as count FROM applicants");
        $count = $countStmt->fetch(PDO::FETCH_ASSOC)['count'];
        error_log("Total applicants in database: " . $count);
        
        $stmt = $pdo->query("
            SELECT 
                id,
                fname as first_name,
                lname as last_name,
                email,
                phone,
                position,
                dept as department,
                applied_at as application_date,
                status,
                updated_at
            FROM applicants 
            ORDER BY applied_at DESC
        ");
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        error_log("Applications query returned: " . count($result) . " rows");
        error_log("First applicant data: " . json_encode($result[0] ?? 'null'));
        jsonResponse($result);
        break;
        
    case 'update_applicant_details':
        error_log("update_applicant_details called with method: " . $method);
        
        // Get data from either GET or POST
        if ($method === 'POST') {
            $applicantId = $_POST['id'] ?? '';
            $position = $_POST['position'] ?? '';
            $department = $_POST['department'] ?? '';
            error_log("POST data: " . json_encode($_POST));
        } else {
            $applicantId = $_GET['id'] ?? '';
            $position = $_GET['position'] ?? '';
            $department = $_GET['department'] ?? '';
            error_log("GET data: " . json_encode($_GET));
        }
        
        error_log("Updating applicant ID: " . $applicantId . " with position: " . $position . " and department: " . $department);
        
        if ($applicantId) {
            $stmt = $pdo->prepare("UPDATE applicants SET position = ?, dept = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$position, $department, $applicantId]);
            jsonResponse(['success' => true, 'message' => 'Applicant details updated']);
        } else {
            jsonResponse(['error' => 'Applicant ID required']);
        }
        break;
        
    case 'update_status':
        if ($method === 'POST') {
            $applicantId = $_POST['id'] ?? '';
            $newStatus = $_POST['status'] ?? '';
            
            $stmt = $pdo->prepare("UPDATE applicants SET status = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$newStatus, $applicantId]);
            
            jsonResponse(['success' => true, 'message' => 'Status updated successfully']);
        }
        break;
        
    case 'save_assessment':
        if ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare("INSERT INTO assessments (applicant_id, tech, comm, prob, fit, notes, assessed_at) VALUES (?, ?, ?, ?, ?, ?, NOW())");
            $stmt->execute([
                $input['applicant_id'],
                $input['tech'],
                $input['comm'],
                $input['prob'],
                $input['fit'],
                $input['notes']
            ]);
            
            jsonResponse(['success' => true, 'message' => 'Assessment saved']);
        }
        break;
        
    case 'get_assessments':
        $stmt = $pdo->query("SELECT a.*, ap.fname, ap.lname FROM assessments a LEFT JOIN applicants ap ON a.applicant_id = ap.id ORDER BY a.assessed_at DESC");
        jsonResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
        
    case 'save_application':
        if ($method === 'POST') {
            // Get form data
            $fname = $_POST['first_name'] ?? '';
            $lname = $_POST['last_name'] ?? '';
            $email = $_POST['email'] ?? '';
            $phone = $_POST['phone'] ?? '';
            $position = $_POST['position'] ?? '';
            $message = $_POST['message'] ?? '';
            
            // Insert into database
            $stmt = $pdo->prepare("INSERT INTO applicants (fname, lname, email, phone, position, message, applied_at) VALUES (?, ?, ?, ?, ?, ?, NOW())");
            $stmt->execute([$fname, $lname, $email, $phone, $position, $message]);
            
            $id = $pdo->lastInsertId();
            
            jsonResponse([
                'success' => true, 
                'id' => $id,
                'message' => 'Application submitted successfully'
            ]);
        }
        break;
        
    case 'get_communications':
        $applicantId = $_GET['applicant_id'] ?? null;
        if ($applicantId) {
            $stmt = $pdo->prepare("SELECT * FROM communications WHERE applicant_id = ? ORDER BY sent_at DESC");
            $stmt->execute([$applicantId]);
        } else {
            $stmt = $pdo->query("SELECT * FROM communications ORDER BY sent_at DESC");
        }
        jsonResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
        
    case 'create_sample_applicant':
        try {
            // Check if applicants table is empty
            $countStmt = $pdo->query("SELECT COUNT(*) as count FROM applicants");
            $count = $countStmt->fetch(PDO::FETCH_ASSOC)['count'];
            
            if ($count > 0) {
                jsonResponse(['message' => 'Applicants already exist', 'count' => $count]);
            }
            
            // Insert sample applicants
            $sampleApplicants = [
                ['John', 'Doe', 'john.doe@email.com', '555-0101'],
                ['Jane', 'Smith', 'jane.smith@email.com', '555-0102'],
                ['Mike', 'Johnson', 'mike.johnson@email.com', '555-0103']
            ];
            
            $insertStmt = $pdo->prepare("INSERT INTO applicants (first_name, last_name, email, phone, created_at) VALUES (?, ?, ?, ?, NOW())");
            
            foreach ($sampleApplicants as $applicant) {
                $insertStmt->execute($applicant);
            }
            
            jsonResponse(['success' => true, 'message' => 'Sample applicants created']);
        } catch(Exception $e) {
            jsonResponse(['error' => 'Error creating sample applicants: ' . $e->getMessage()]);
        }
        break;
        
    case 'create_job_posting':
        if ($method === 'POST') {
            $title = $_POST['title'] ?? '';
            $department = $_POST['department'] ?? '';
            $location = $_POST['location'] ?? '';
            $employmentType = $_POST['employment_type'] ?? '';
            $salary = $_POST['salary'] ?? '';
            $description = $_POST['description'] ?? '';
            
            if ($title && $department && $location && $employmentType && $salary && $description) {
                $stmt = $pdo->prepare("INSERT INTO jobs (title, dept, location, emptype, salary, description, status, posted) VALUES (?, ?, ?, ?, ?, ?, 'Active', NOW())");
                $stmt->execute([$title, $department, $location, $employmentType, $salary, $description]);
                jsonResponse(['success' => true, 'message' => 'Job posting created successfully']);
            } else {
                jsonResponse(['error' => 'Missing required fields']);
            }
        } else {
            jsonResponse(['error' => 'POST method required']);
        }
        break;
        
    case 'clear_data':
        if ($method === 'DELETE') {
            $pdo->exec("DELETE FROM applicants");
            $pdo->exec("DELETE FROM assessments");
            $pdo->exec("DELETE FROM communications");
            jsonResponse(['success' => true, 'message' => 'All data cleared']);
        }
        break;
        
    default:
        jsonResponse(['error' => 'Unknown action'], 400);
}
?>
