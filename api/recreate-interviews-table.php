<?php
// Recreate interviews table with optimized structure
header('Content-Type: application/json');

try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3307;dbname=hr_management;charset=utf8mb4',
        'root', '', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    
    // Backup existing data
    $pdo->exec("CREATE TABLE interviews_backup AS SELECT * FROM interviews");
    
    // Drop the old table
    $pdo->exec("DROP TABLE interviews");
    
    // Recreate with optimized structure
    $pdo->exec("
        CREATE TABLE interviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            applicant_id INT NOT NULL,
            applicant_name VARCHAR(100),
            interview_date DATE NOT NULL,
            interview_time TIME NOT NULL,
            interview_type ENUM('Phone Screen','Video Call','In-Person','Technical') NOT NULL DEFAULT 'Phone Screen',
            interview_notes TEXT,
            position VARCHAR(100),
            interview_status ENUM('Scheduled','Completed','Cancelled','Rescheduled') NOT NULL DEFAULT 'Scheduled',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE
        )
    ");
    
    // Restore data
    $pdo->exec("
        INSERT INTO interviews (id, applicant_id, applicant_name, interview_date, interview_time, interview_type, interview_notes, position, interview_status, created_at, updated_at)
        SELECT id, applicant_id, applicant_name, interview_date, interview_time, interview_type, interview_notes, position, interview_status, created_at, updated_at
        FROM interviews_backup
    ");
    
    // Drop backup table
    $pdo->exec("DROP TABLE interviews_backup");
    
    echo json_encode([
        'success' => true, 
        'message' => 'Interviews table recreated with optimized structure'
    ]);
    
} catch(Exception $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Error recreating table: ' . $e->getMessage()
    ]);
}
?>
