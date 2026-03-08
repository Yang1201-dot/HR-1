<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

// File upload directory
$uploadDir = __DIR__ . '/../uploads/applicants/';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3307;dbname=hr_management;charset=utf8mb4',
        'root', '', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

    // Ensure columns exist
    try { $pdo->exec("ALTER TABLE applicants ADD COLUMN location VARCHAR(255) NULL"); } catch(Exception $e) {}
    try { $pdo->exec("ALTER TABLE applicants ADD COLUMN employment_type VARCHAR(100) NULL"); } catch(Exception $e) {}
    try { $pdo->exec("ALTER TABLE applicants ADD COLUMN salary VARCHAR(100) NULL"); } catch(Exception $e) {}
    try { $pdo->exec("ALTER TABLE applicants ADD COLUMN description TEXT NULL"); } catch(Exception $e) {}
    try { $pdo->exec("ALTER TABLE applicants ADD COLUMN job_posting_id INT NULL"); } catch(Exception $e) {}
    try { $pdo->exec("ALTER TABLE applicants ADD COLUMN resume_path VARCHAR(500) NULL"); } catch(Exception $e) {}
    try { $pdo->exec("ALTER TABLE applicants ADD COLUMN birth_certificate_path VARCHAR(500) NULL"); } catch(Exception $e) {}
    try { $pdo->exec("ALTER TABLE applicants ADD COLUMN diploma_path VARCHAR(500) NULL"); } catch(Exception $e) {}
    try { $pdo->exec("ALTER TABLE applicants ADD COLUMN cover_letter_path VARCHAR(500) NULL"); } catch(Exception $e) {}

    $fname     = trim($_POST['first_name'] ?? '');
    $mname     = trim($_POST['middle_name'] ?? '');
    $lname     = trim($_POST['last_name'] ?? '');
    $email     = trim($_POST['email'] ?? '');
    $phone     = trim($_POST['phone'] ?? '');
    $position  = trim($_POST['position'] ?? '');
    $dept      = trim($_POST['department'] ?? '');
    $location  = trim($_POST['location'] ?? '');
    $emptype   = trim($_POST['employment_type'] ?? '');
    $salary    = trim($_POST['salary'] ?? '');
    $desc      = trim($_POST['description'] ?? '');
    $jobId     = trim($_POST['job_posting_id'] ?? '');

    if (!$fname || !$lname || !$email || !$phone) {
        echo json_encode(['error' => 'Missing required fields']); exit;
    }

    // Handle file uploads
    function saveFile($key, $uploadDir) {
        if (!isset($_FILES[$key]) || $_FILES[$key]['error'] !== UPLOAD_ERR_OK) return null;
        $ext  = pathinfo($_FILES[$key]['name'], PATHINFO_EXTENSION);
        $name = preg_replace('/[^a-zA-Z0-9_-]/', '_', pathinfo($_FILES[$key]['name'], PATHINFO_FILENAME));
        $file = $name . '_' . time() . '.' . $ext;
        $dest = $uploadDir . $file;
        if (move_uploaded_file($_FILES[$key]['tmp_name'], $dest)) {
            return 'uploads/applicants/' . $file;
        }
        return null;
    }

    $resumePath = saveFile('resume', $uploadDir);
    $birthPath  = saveFile('birth_certificate', $uploadDir);
    $diplomaPath = saveFile('diploma', $uploadDir);
    $coverPath  = saveFile('cover_letter', $uploadDir);

    $stmt = $pdo->prepare("
        INSERT INTO applicants (fname, lname, email, phone, position, dept, status, applied_at,
            resume_path, birth_certificate_path, diploma_path, cover_letter_path,
            location, employment_type, salary, description, job_posting_id)
        VALUES (?, ?, ?, ?, ?, ?, 'New', NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$fname, $lname, $email, $phone, $position, $dept,
        $resumePath, $birthPath, $diplomaPath, $coverPath,
        $location, $emptype, $salary, $desc, $jobId]);

    $id = $pdo->lastInsertId();
    echo json_encode(['success' => true, 'id' => $id, 'message' => 'Application submitted successfully']);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
