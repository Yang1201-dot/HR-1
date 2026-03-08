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
        // Ensure required columns exist
        try { $pdo->exec("ALTER TABLE applicants ADD COLUMN location VARCHAR(255) NULL"); } catch(Exception $ignored) {}
        try { $pdo->exec("ALTER TABLE applicants ADD COLUMN employment_type VARCHAR(100) NULL"); } catch(Exception $ignored) {}
        try { $pdo->exec("ALTER TABLE applicants ADD COLUMN salary VARCHAR(100) NULL"); } catch(Exception $ignored) {}
        try { $pdo->exec("ALTER TABLE applicants ADD COLUMN description TEXT NULL"); } catch(Exception $ignored) {}
        try { $pdo->exec("ALTER TABLE applicants ADD COLUMN job_posting_id INT NULL"); } catch(Exception $ignored) {}
        try { $pdo->exec("ALTER TABLE applicants ADD COLUMN message TEXT NULL"); } catch(Exception $ignored) {}
        
        // Remove expected_salary column if it exists
        try { $pdo->exec("ALTER TABLE applicants DROP COLUMN expected_salary"); } catch(Exception $ignored) {}
        
        $countStmt = $pdo->query("SELECT COUNT(*) as count FROM applicants");
        $count = $countStmt->fetch(PDO::FETCH_ASSOC)['count'];
        error_log("Total applicants in database: " . $count);
        
        $stmt = $pdo->query("
            SELECT 
                id, fname as first_name, lname as last_name, email, phone, position,
                dept as department, applied_at as application_date, status, updated_at,
                location, employment_type, salary, description, job_posting_id,
                resume_path, birth_certificate_path, diploma_path, cover_letter_path, message
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
                    af.file_path, af.uploaded_at, af.mime_type,
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
            
            // Drop legacy unused columns if they still exist
            foreach (['benefits', 'emptype', 'salary', 'requirements'] as $dropCol) {
                try {
                    $check = $pdo->query("SHOW COLUMNS FROM jobs LIKE '$dropCol'")->rowCount();
                    if ($check > 0) { $pdo->exec("ALTER TABLE jobs DROP COLUMN `$dropCol`"); }
                } catch (Exception $ignored) {}
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
                    description, salary_range, status,
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
                        description, salary_range, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                ");

                $stmt->execute([
                    $data['title'],
                    $data['department'] ?? '',
                    $data['location'] ?? '',
                    $data['employment_type'] ?? '',
                    $data['description'],
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
    case 'ensure_interview_status_column':
        if ($method === 'POST') {
            try {
                // Create interviews table if it doesn't exist
                $pdo->exec("
                    CREATE TABLE IF NOT EXISTS interviews (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        applicant_name VARCHAR(255) NOT NULL,
                        interview_date DATE NOT NULL,
                        interview_time TIME NOT NULL,
                        interview_type VARCHAR(100) NOT NULL,
                        status VARCHAR(50) DEFAULT 'Scheduled',
                        notes TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                ");
                
                // Add status column if it doesn't exist (multiple attempts)
                try {
                    $pdo->exec("ALTER TABLE interviews ADD COLUMN status VARCHAR(50) DEFAULT 'Scheduled' AFTER interview_type");
                    error_log("Status column added successfully");
                } catch (Exception $e) {
                    error_log("Status column might already exist: " . $e->getMessage());
                }
                
                // Try alternative column name if needed
                try {
                    $pdo->exec("ALTER TABLE interviews ADD COLUMN interview_status VARCHAR(50) DEFAULT 'Scheduled' AFTER interview_type");
                } catch (Exception $e) {
                    error_log("Interview_status column might already exist: " . $e->getMessage());
                }
                
                jsonResponse([
                    'success' => true, 
                    'message' => 'Interview status column ensured',
                    'columns_checked' => 'status and interview_status'
                ]);
            } catch(Exception $e) {
                error_log("Error ensuring interview status column: " . $e->getMessage());
                jsonResponse(['error' => $e->getMessage()], 500);
            }
        }
        break;
        
    case 'update_interview_status':
        if ($method === 'POST') {
            try {
                // Get JSON input
                $input = json_decode(file_get_contents('php://input'), true);
                $interviewId = $input['id'] ?? '';
                $newStatus = $input['status'] ?? '';
                
                if (empty($interviewId) || empty($newStatus)) {
                    jsonResponse(['error' => 'Interview ID and status are required'], 400);
                    break;
                }
                
                // Create interviews table if it doesn't exist
                $pdo->exec("
                    CREATE TABLE IF NOT EXISTS interviews (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        applicant_name VARCHAR(255) NOT NULL,
                        interview_date DATE NOT NULL,
                        interview_time TIME NOT NULL,
                        interview_type VARCHAR(100) NOT NULL,
                        interview_status VARCHAR(50) DEFAULT 'Scheduled',
                        notes TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                ");
                
                // Add interview_status column if it doesn't exist
                try { $pdo->exec("ALTER TABLE interviews ADD COLUMN interview_status VARCHAR(50) DEFAULT 'Scheduled'"); } catch(Exception $ignored) {}
                $stmt = $pdo->prepare("
                    UPDATE interviews 
                    SET interview_status = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                ");
                $stmt->execute([$newStatus, $interviewId]);
                
                error_log("Interview status updated: ID $interviewId, Status: $newStatus");
                jsonResponse([
                    'success' => true, 
                    'message' => 'Interview status updated successfully',
                    'interview_id' => $interviewId,
                    'new_status' => $newStatus
                ]);
            } catch(Exception $e) {
                error_log("Error updating interview status: " . $e->getMessage());
                jsonResponse(['error' => $e->getMessage()], 500);
            }
        }
        break;
        
    case 'save_interview':
        if ($method === 'POST') {
            try {
                // Create interviews table if it doesn't exist
                $pdo->exec("
                    CREATE TABLE IF NOT EXISTS interviews (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        applicant_name VARCHAR(255) NOT NULL,
                        interview_date DATE NOT NULL,
                        interview_time TIME NOT NULL,
                        interview_type VARCHAR(100) NOT NULL,
                        interview_status VARCHAR(50) DEFAULT 'Scheduled',
                        notes TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                ");
                
                // Add interview_status column if it doesn't exist
                try { $pdo->exec("ALTER TABLE interviews ADD COLUMN interview_status VARCHAR(50) DEFAULT 'Scheduled'"); } catch(Exception $ignored) {}
                
                $input = json_decode(file_get_contents('php://input'), true);
                $interviewId = $input['id'] ?? null;
                
                if ($interviewId) {
                    $position    = $input['position']     ?? '';
                    $applicantId = $input['applicant_id'] ?? null;
                    if (empty($position) || empty($applicantId)) {
                        try {
                            $appStmt = $pdo->prepare("SELECT id, position FROM applicants WHERE CONCAT(fname, ' ', lname) = ? LIMIT 1");
                            $appStmt->execute([$input['applicant_name'] ?? '']);
                            $appRow = $appStmt->fetch(PDO::FETCH_ASSOC);
                            if ($appRow) {
                                if (empty($position))    $position    = $appRow['position'] ?? '';
                                if (empty($applicantId)) $applicantId = $appRow['id'];
                            }
                        } catch(Exception $ignored) {}
                    }
                    $stmt = $pdo->prepare("UPDATE interviews SET applicant_name = ?, applicant_id = ?, interview_date = ?, interview_time = ?, interview_type = ?, position = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
                    $stmt->execute([
                        $input['applicant_name'],
                        $applicantId ? (int)$applicantId : null,
                        $input['interview_date'],
                        $input['interview_time'],
                        $input['interview_type'],
                        $position,
                        $input['notes'] ?? '',
                        $interviewId
                    ]);
                    error_log("Interview updated with ID: " . $interviewId);
                    jsonResponse([
                        'success' => true, 
                        'message' => 'Interview updated successfully',
                        'interview_id' => $interviewId
                    ]);
                } else {
                    foreach (["applicant_id INT NULL", "position VARCHAR(255) NULL"] as $colDef) {
                        try { $pdo->exec("ALTER TABLE interviews ADD COLUMN $colDef"); } catch(Exception $ignored) {}
                    }
                    $position    = $input['position']     ?? '';
                    $applicantId = $input['applicant_id'] ?? null;
                    if (empty($position) || empty($applicantId)) {
                        try {
                            $appStmt = $pdo->prepare("SELECT id, position FROM applicants WHERE CONCAT(fname, ' ', lname) = ? LIMIT 1");
                            $appStmt->execute([$input['applicant_name'] ?? '']);
                            $appRow = $appStmt->fetch(PDO::FETCH_ASSOC);
                            if ($appRow) {
                                if (empty($position))    $position    = $appRow['position'] ?? '';
                                if (empty($applicantId)) $applicantId = $appRow['id'];
                            }
                        } catch(Exception $ignored) {}
                    }
                    $stmt = $pdo->prepare("INSERT INTO interviews (applicant_name, applicant_id, interview_date, interview_time, interview_type, position, notes) VALUES (?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([
                        $input['applicant_name'],
                        $applicantId ? (int)$applicantId : null,
                        $input['interview_date'],
                        $input['interview_time'],
                        $input['interview_type'],
                        $position,
                        $input['notes'] ?? ''
                    ]);
                    $interviewId = $pdo->lastInsertId();
                    error_log("Interview saved with ID: " . $interviewId);
                    jsonResponse([
                        'success' => true, 
                        'message' => 'Interview scheduled successfully',
                        'interview_id' => $interviewId
                    ]);
                }
            } catch(Exception $e) {
                error_log("Error saving interview: " . $e->getMessage());
                jsonResponse(['error' => $e->getMessage()], 500);
            }
        }
        break;
        
    case 'get_interviews':
        try {
            // Ensure interviews table has correct structure
            $requiredColumns = [
                'id' => 'INT AUTO_INCREMENT PRIMARY KEY',
                'applicant_id' => 'INT NOT NULL',
                'applicant_name' => 'VARCHAR(255)',
                'interview_date' => 'DATE NOT NULL',
                'interview_time' => 'TIME NOT NULL',
                'interview_type' => "VARCHAR(50) NOT NULL DEFAULT 'Phone Screen'",
                'interview_notes' => 'TEXT',
                'position' => 'VARCHAR(255)',
                'interview_status' => "VARCHAR(20) NOT NULL DEFAULT 'Scheduled'",
                'created_at' => 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
                'updated_at' => 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
            ];
            
            // Create table if it doesn't exist
            $columns = implode(', ', array_map(function($col, $def) {
                return "$col $def";
            }, array_keys($requiredColumns), $requiredColumns));
            
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS interviews (
                    $columns,
                    FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE
                )
            ");
            
            // Ensure individual columns exist
            foreach ($requiredColumns as $col => $def) {
                try {
                    $pdo->exec("ALTER TABLE interviews ADD COLUMN $col $def");
                } catch(Exception $e) {
                    // Column already exists, ignore error
                }
            }
            
            // Drop duplicate status column if it exists
            try {
                $pdo->exec("ALTER TABLE interviews DROP COLUMN status");
            } catch(Exception $e) {
                // Column doesn't exist or already dropped, ignore error
            }
            
            // Get interviews with applicant names using JOIN (with fallback to stored name)
            $stmt = $pdo->query("
                SELECT i.id, i.applicant_id, i.interview_date, i.interview_time, i.interview_type, 
                       i.interview_notes, i.position, i.interview_status, i.created_at, i.updated_at,
                       COALESCE(i.applicant_name, CONCAT(a.fname, ' ', a.lname)) as applicant_name,
                       a.position as applicant_position
                FROM interviews i
                LEFT JOIN applicants a ON i.applicant_id = a.id
                ORDER BY i.created_at DESC
            ");
            $interviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
            error_log("Interviews query returned: " . count($interviews) . " rows");
            jsonResponse($interviews);
        } catch(Exception $e) {
            error_log("Error getting interviews: " . $e->getMessage());
            jsonResponse(['error' => $e->getMessage()], 500);
        }
        break;
        
    case 'delete_interview':
        if ($method === 'DELETE') {
            try {
                $interviewId = $_GET['id'] ?? '';
                if (empty($interviewId)) {
                    jsonResponse(['error' => 'Interview ID is required'], 400);
                    break;
                }
                
                $stmt = $pdo->prepare("DELETE FROM interviews WHERE id = ?");
                $stmt->execute([$interviewId]);
                
                jsonResponse(['success' => true, 'message' => 'Interview deleted']);
            } catch(Exception $e) {
                error_log("Error deleting interview: " . $e->getMessage());
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
            $pdo->exec("DELETE FROM interviews");
            jsonResponse(['success' => true, 'message' => 'All data cleared']);
        }
        break;
        
    case 'get_applicant_files':
        try {
            // Ensure applicant_files table exists
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS applicant_files (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    applicant_id INT NOT NULL,
                    file_type VARCHAR(50) NOT NULL,
                    file_name VARCHAR(255) NOT NULL,
                    file_path VARCHAR(500) NOT NULL,
                    file_size INT NOT NULL,
                    mime_type VARCHAR(100) NOT NULL,
                    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE
                )
            ");
            
            // Ensure mime_type column exists (in case table was created without it)
            try { $pdo->exec("ALTER TABLE applicant_files ADD COLUMN mime_type VARCHAR(100) NOT NULL DEFAULT ''"); } catch(Exception $e) {}
            
            // Drop unused file_field column if it exists
            try { $pdo->exec("ALTER TABLE applicant_files DROP COLUMN file_field"); } catch(Exception $e) {}
            
            $applicantId = $_GET['applicant_id'] ?? null;
            if ($applicantId) {
                // Get files for specific applicant
                $stmt = $pdo->prepare("
                    SELECT id, applicant_id, file_type, file_name, file_path, file_size, mime_type, uploaded_at
                    FROM applicant_files 
                    WHERE applicant_id = ?
                    ORDER BY uploaded_at DESC
                ");
                $stmt->execute([$applicantId]);
                $files = $stmt->fetchAll(PDO::FETCH_ASSOC);
                jsonResponse($files);
            } else {
                // Get all files with applicant info
                $stmt = $pdo->query("
                    SELECT af.id, af.applicant_id, af.file_type, af.file_name, af.file_path, 
                           af.file_size, af.mime_type, af.uploaded_at,
                           a.fname, a.lname, a.email, a.position
                    FROM applicant_files af
                    LEFT JOIN applicants a ON af.applicant_id = a.id
                    ORDER BY af.uploaded_at DESC
                ");
                $files = $stmt->fetchAll(PDO::FETCH_ASSOC);
                jsonResponse($files);
            }
        } catch(Exception $e) {
            error_log("Error getting applicant files: " . $e->getMessage());
            jsonResponse(['error' => $e->getMessage()], 500);
        }
        break;
        
    case 'schedule_interview':
        $applicantId = $_POST['applicant_id'] ?? null;
        $interviewDate = $_POST['interview_date'] ?? null;
        $interviewTime = $_POST['interview_time'] ?? null;
        $interviewType = $_POST['interview_type'] ?? 'Phone Screen';
        $interviewNotes = $_POST['interview_notes'] ?? '';
        $position = $_POST['position'] ?? '';
        
        if (!$applicantId || !$interviewDate || !$interviewTime) {
            jsonResponse(['error' => 'Missing required fields'], 400);
            break;
        }
        
        // Ensure all required columns exist in interviews table
        try {
            $requiredColumns = [
                'id' => 'INT AUTO_INCREMENT PRIMARY KEY',
                'applicant_id' => 'INT NOT NULL',
                'applicant_name' => 'VARCHAR(255)',
                'interview_date' => 'DATE NOT NULL',
                'interview_time' => 'TIME NOT NULL',
                'interview_type' => "VARCHAR(50) NOT NULL DEFAULT 'Phone Screen'",
                'interview_notes' => 'TEXT',
                'position' => 'VARCHAR(255)',
                'interview_status' => "VARCHAR(20) NOT NULL DEFAULT 'Scheduled'",
                'created_at' => 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
                'updated_at' => 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
            ];
            
            // Create table if it doesn't exist
            $columns = implode(', ', array_map(function($col, $def) {
                return "$col $def";
            }, array_keys($requiredColumns), $requiredColumns));
            
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS interviews (
                    $columns,
                    FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE
                )
            ");
            
            // Ensure individual columns exist (for backward compatibility)
            foreach ($requiredColumns as $col => $def) {
                try {
                    $pdo->exec("ALTER TABLE interviews ADD COLUMN $col $def");
                } catch(Exception $e) {
                    // Column already exists, ignore error
                }
            }
            
            // Drop duplicate status column if it exists
            try {
                $pdo->exec("ALTER TABLE interviews DROP COLUMN status");
                error_log("Dropped duplicate status column");
            } catch(Exception $e) {
                // Column doesn't exist or already dropped, ignore error
            }
            
            error_log("Interviews table structure verified/updated");
        } catch(Exception $e) {
            error_log("Error updating interviews table: " . $e->getMessage());
        }
        
        // Get applicant name for storage
        $applicantName = '';
        if ($applicantId) {
            try {
                $stmt = $pdo->prepare("SELECT fname, lname FROM applicants WHERE id = ?");
                $stmt->execute([$applicantId]);
                $applicant = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($applicant) {
                    $applicantName = trim($applicant['fname'] . ' ' . $applicant['lname']);
                }
            } catch(Exception $e) {
                error_log("Error getting applicant name: " . $e->getMessage());
            }
        }
        
        // Insert interview
        try {
            $stmt = $pdo->prepare("
                INSERT INTO interviews (applicant_id, applicant_name, interview_date, interview_time, interview_type, interview_notes, position, interview_status)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'Scheduled')
            ");
            $stmt->execute([$applicantId, $applicantName, $interviewDate, $interviewTime, $interviewType, $interviewNotes, $position]);
            
            $interviewId = $pdo->lastInsertId();
            jsonResponse(['success' => true, 'interview_id' => $interviewId, 'message' => 'Interview scheduled successfully']);
        } catch(Exception $e) {
            jsonResponse(['error' => 'Failed to schedule interview: ' . $e->getMessage()], 500);
        }
        break;
        
    default:
        jsonResponse(['error' => 'Unknown action'], 400);
}
?>