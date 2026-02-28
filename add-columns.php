<?php
try {
    $pdo = new PDO('mysql:host=localhost;port=3307;dbname=hr_management', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Adding missing columns to applicants table...\n";
    
    // Add missing columns
    $pdo->exec('ALTER TABLE applicants ADD COLUMN location VARCHAR(200) AFTER dept');
    echo "Added location column\n";
    
    $pdo->exec('ALTER TABLE applicants ADD COLUMN employment_type VARCHAR(100) AFTER location');
    echo "Added employment_type column\n";
    
    $pdo->exec('ALTER TABLE applicants ADD COLUMN salary VARCHAR(100) AFTER employment_type');
    echo "Added salary column\n";
    
    $pdo->exec('ALTER TABLE applicants ADD COLUMN description TEXT AFTER salary');
    echo "Added description column\n";
    
    $pdo->exec('ALTER TABLE applicants ADD COLUMN job_posting_id VARCHAR(50) AFTER description');
    echo "Added job_posting_id column\n";
    
    echo "\n=== UPDATED TABLE STRUCTURE ===\n";
    $stmt = $pdo->query('DESCRIBE applicants');
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo $row['Field'] . ' - ' . $row['Type'] . "\n";
    }
    
} catch(Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
