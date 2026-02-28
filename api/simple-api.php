<?php
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
$port = '3307'; // MySQL is running on port 3307
$dbname = 'hr_management';
$username = 'root';
$password = ''; // Empty password (commented out in config)

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$id = $_GET['id'] ?? '';

try {
    switch($action) {
        case 'get_applications':
            $stmt = $pdo->query("SELECT * FROM applicants ORDER BY applied_at DESC");
            jsonResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
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
            $applicantId = $_GET['applicant_id'] ?? null;
            if ($applicantId) {
                $stmt = $pdo->prepare("SELECT * FROM assessments WHERE applicant_id = ? ORDER BY assessed_at DESC");
                $stmt->execute([$applicantId]);
            } else {
                $stmt = $pdo->query("SELECT * FROM assessments ORDER BY assessed_at DESC");
            }
            jsonResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
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
    
} catch(Exception $e) {
    jsonResponse(['error' => 'Server error: ' . $e->getMessage()], 500);
}
?>
