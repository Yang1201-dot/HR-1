<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
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
        $countStmt = $pdo->query("SELECT COUNT(*) as count FROM applicants");
        $count = $countStmt->fetch(PDO::FETCH_ASSOC)['count'];
        error_log("Total applicants in database: " . $count);
        
        $stmt = $pdo->query("
            SELECT 
                id, fname as first_name, lname as last_name, email, phone, position,
                dept as department, applied_at as application_date, status, updated_at
            FROM applicants 
            ORDER BY applied_at DESC
        ");
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        error_log("Applications query returned: " . count($result) . " rows");
        jsonResponse($result);
        break;
        
    case 'get_applicant_files':
        try {
            $stmt = $pdo->query("
                SELECT 
                    af.id, af.applicant_id, af.file_name, af.file_type, af.file_size,
                    af.file_path, af.uploaded_at, af.file_field,
                    CONCAT(a.fname, ' ', a.lname) as applicant_name
                FROM applicant_files af
                LEFT JOIN applicants a ON af.applicant_id = a.id
                ORDER BY af.uploaded_at DESC
            ");
            $files = $stmt->fetchAll(PDO::FETCH_ASSOC);
            error_log("Files query returned: " . count($files) . " files");
            jsonResponse($files);
        } catch(Exception $e) {
            error_log("Error getting files: " . $e->getMessage());
            jsonResponse(['error' => $e->getMessage()], 500);
        }
        break;
        
    case 'update_applicant_details':
        if ($method === 'POST') {
            $applicantId = $_POST['id'] ?? '';
            $position = $_POST['position'] ?? '';
            $department = $_POST['department'] ?? '';
        } else {
            $applicantId = $_GET['id'] ?? '';
            $position = $_GET['position'] ?? '';
            $department = $_GET['department'] ?? '';
        }
        
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
                $input['applicant_id'], $input['tech'], $input['comm'],
                $input['prob'], $input['fit'], $input['notes']
            ]);
            jsonResponse(['success' => true, 'message' => 'Assessment saved']);
        }
        break;
        
    case 'get_assessments':
        $stmt = $pdo->query("SELECT a.*, ap.fname, ap.lname FROM assessments a LEFT JOIN applicants ap ON a.applicant_id = ap.id ORDER BY a.assessed_at DESC");
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
        
    case 'get_job_postings':
        try {
            // Create jobs table if it doesn't exist
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS jobs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    department VARCHAR(255),
                    location VARCHAR(255),
                    employment_type VARCHAR(100),
                    description TEXT,
                    requirements TEXT,
                    benefits TEXT,
                    salary_range VARCHAR(100),
                    status ENUM('Active', 'Draft', 'Closed') DEFAULT 'Active',
                    posted_date DATE DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            ");
            
            // Add missing columns if they don't exist
            try {
                $pdo->exec("ALTER TABLE jobs ADD COLUMN employment_type VARCHAR(100) AFTER location");
            } catch (Exception $e) {
                // Column already exists, ignore error
            }
            
            try {
                $pdo->exec("ALTER TABLE jobs ADD COLUMN requirements TEXT AFTER description");
            } catch (Exception $e) {
                // Column already exists, ignore error
            }
            
            try {
                $pdo->exec("ALTER TABLE jobs ADD COLUMN benefits TEXT AFTER requirements");
            } catch (Exception $e) {
                // Column already exists, ignore error
            }
            
            try {
                $pdo->exec("ALTER TABLE jobs ADD COLUMN salary_range VARCHAR(100) AFTER benefits");
            } catch (Exception $e) {
                // Column already exists, ignore error
            }
            
            try {
                $pdo->exec("ALTER TABLE jobs ADD COLUMN posted_date DATE DEFAULT CURRENT_TIMESTAMP AFTER salary_range");
            } catch (Exception $e) {
                // Column already exists, ignore error
            }
            
            try {
                $pdo->exec("ALTER TABLE jobs ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER posted_date");
            } catch (Exception $e) {
                // Column already exists, ignore error
            }
            
            try {
                $pdo->exec("ALTER TABLE jobs ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at");
            } catch (Exception $e) {
                // Column already exists, ignore error
            }
            
            $stmt = $pdo->query("
                SELECT 
                    id, title, department, location, employment_type, 
                    description, requirements, benefits, salary_range, status,
                    posted_date, created_at, updated_at
                FROM jobs 
                ORDER BY created_at DESC
            ");
            $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Count applicants for each job
            foreach ($jobs as &$job) {
                $countStmt = $pdo->prepare("
                    SELECT COUNT(*) as count 
                    FROM applicants 
                    WHERE position = ?
                ");
                $countStmt->execute([$job['title']]);
                $job['applicants_count'] = $countStmt->fetch(PDO::FETCH_ASSOC)['count'];
                
                // Get actual applicants for this job
                $appsStmt = $pdo->prepare("
                    SELECT 
                        id, fname as first_name, lname as last_name, email, phone,
                        applied_at as application_date, status
                    FROM applicants 
                    WHERE position = ?
                    ORDER BY applied_at DESC
                ");
                $appsStmt->execute([$job['title']]);
                $job['applicants'] = $appsStmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
            jsonResponse($jobs);
        } catch(Exception $e) {
            error_log("Error getting job postings: " . $e->getMessage());
            jsonResponse(['error' => $e->getMessage()], 500);
        }
        break;
        
    case 'save_job_posting':
        if ($method === 'POST') {
            try {
                $data = json_decode(file_get_contents('php://input'), true);
                
                $stmt = $pdo->prepare("
                    INSERT INTO jobs (
                        title, department, location, employment_type, 
                        description, requirements, benefits, salary_range, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                
                $stmt->execute([
                    $data['title'],
                    $data['department'],
                    $data['location'],
                    $data['employment_type'],
                    $data['description'],
                    $data['requirements'] ?? '',
                    $data['benefits'] ?? '',
                    $data['salary_range'] ?? '',
                    $data['status'] ?? 'Active'
                ]);
                
                $jobId = $pdo->lastInsertId();
                jsonResponse(['success' => true, 'job_id' => $jobId]);
            } catch(Exception $e) {
                error_log("Error saving job posting: " . $e->getMessage());
                jsonResponse(['error' => $e->getMessage()], 500);
            }
        }
        break;
        
    case 'delete_job_posting':
        if ($method === 'DELETE') {
            try {
                $jobId = $_GET['id'] ?? '';
                if (empty($jobId)) {
                    jsonResponse(['error' => 'Job ID is required'], 400);
                    break;
                }
                
                $stmt = $pdo->prepare("DELETE FROM jobs WHERE id = ?");
                $stmt->execute([$jobId]);
                
                jsonResponse(['success' => true, 'message' => 'Job posting deleted']);
            } catch(Exception $e) {
                error_log("Error deleting job posting: " . $e->getMessage());
                jsonResponse(['error' => $e->getMessage()], 500);
            }
        }
        break;
        
    case 'clear_data':
        if ($method === 'DELETE') {
            $pdo->exec("DELETE FROM applicants");
            $pdo->exec("DELETE FROM assessments");
            $pdo->exec("DELETE FROM communications");
            $pdo->exec("DELETE FROM jobs");
            jsonResponse(['success' => true, 'message' => 'All data cleared']);
        }
        break;
        
    default:
        jsonResponse(['error' => 'Unknown action'], 400);
}
?>