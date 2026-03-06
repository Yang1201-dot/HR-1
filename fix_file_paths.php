<?php
// Script to fix file paths with proper directory structure
error_reporting(E_ALL);
ini_set('display_errors', 1);

$host = 'localhost';
$port = '3307';
$dbname = 'hr_management';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<h2>Fixing File Paths with Proper Directory Structure</h2>";
    
    // Get current applicants with their file paths
    $stmt = $pdo->query("
        SELECT 
            id, fname, lname, 
            resume_path, birth_certificate_path, diploma_path, cover_letter_path
        FROM applicants 
        WHERE resume_path IS NOT NULL 
           OR birth_certificate_path IS NOT NULL 
           OR diploma_path IS NOT NULL 
           OR cover_letter_path IS NOT NULL
        ORDER BY id
    ");
    
    $applicants = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<h3>Current File Paths (before fix):</h3>";
    echo "<table border='1' style='border-collapse: collapse; margin: 10px 0;'>";
    echo "<tr><th>ID</th><th>Name</th><th>Resume</th><th>Birth Cert</th><th>Diploma</th><th>Cover Letter</th></tr>";
    
    foreach ($applicants as $applicant) {
        echo "<tr>";
        echo "<td>" . htmlspecialchars($applicant['id']) . "</td>";
        echo "<td>" . htmlspecialchars($applicant['fname'] . ' ' . $applicant['lname']) . "</td>";
        echo "<td>" . htmlspecialchars($applicant['resume_path'] ?? 'NULL') . "</td>";
        echo "<td>" . htmlspecialchars($applicant['birth_certificate_path'] ?? 'NULL') . "</td>";
        echo "<td>" . htmlspecialchars($applicant['diploma_path'] ?? 'NULL') . "</td>";
        echo "<td>" . htmlspecialchars($applicant['cover_letter_path'] ?? 'NULL') . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    // Update file paths with proper directory structure
    echo "<h3>Updating with proper directory paths...</h3>";
    
    $updatedCount = 0;
    
    foreach ($applicants as $applicant) {
        $applicantId = $applicant['id'];
        
        // Create proper file paths
        $resumePath = null;
        $birthCertificatePath = null;
        $diplomaPath = null;
        $coverLetterPath = null;
        
        if ($applicant['resume_path']) {
            $resumePath = 'uploads/resumes/' . $applicant['resume_path'];
        }
        
        if ($applicant['birth_certificate_path']) {
            $birthCertificatePath = 'uploads/birth_certificates/' . $applicant['birth_certificate_path'];
        }
        
        if ($applicant['diploma_path']) {
            $diplomaPath = 'uploads/diplomas/' . $applicant['diploma_path'];
        }
        
        if ($applicant['cover_letter_path']) {
            $coverLetterPath = 'uploads/cover_letters/' . $applicant['cover_letter_path'];
        }
        
        // Update the database
        $updateStmt = $pdo->prepare("
            UPDATE applicants SET 
                resume_path = ?, 
                birth_certificate_path = ?, 
                diploma_path = ?, 
                cover_letter_path = ?, 
                updated_at = NOW() 
            WHERE id = ?
        ");
        
        $updateStmt->execute([
            $resumePath, 
            $birthCertificatePath, 
            $diplomaPath, 
            $coverLetterPath, 
            $applicantId
        ]);
        
        $updatedCount++;
        
        echo "<p style='color: green;'>✓ Updated applicant ID $applicantId (" . htmlspecialchars($applicant['fname'] . ' ' . $applicant['lname']) . ")</p>";
        echo "<ul>";
        if ($resumePath) echo "<li>Resume: " . htmlspecialchars($resumePath) . "</li>";
        if ($birthCertificatePath) echo "<li>Birth Certificate: " . htmlspecialchars($birthCertificatePath) . "</li>";
        if ($diplomaPath) echo "<li>Diploma: " . htmlspecialchars($diplomaPath) . "</li>";
        if ($coverLetterPath) echo "<li>Cover Letter: " . htmlspecialchars($coverLetterPath) . "</li>";
        echo "</ul>";
    }
    
    // Show the final result
    echo "<h3>Final Result (after fix):</h3>";
    $finalStmt = $pdo->query("
        SELECT 
            id, fname, lname, email, position, status,
            resume_path, birth_certificate_path, diploma_path, cover_letter_path
        FROM applicants 
        ORDER BY id
    ");
    
    $finalApplicants = $finalStmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table border='1' style='border-collapse: collapse; margin: 10px 0;'>";
    echo "<tr><th>ID</th><th>Name</th><th>Email</th><th>Position</th><th>Status</th><th>Resume Path</th><th>Birth Cert Path</th><th>Diploma Path</th><th>Cover Letter Path</th></tr>";
    
    foreach ($finalApplicants as $applicant) {
        echo "<tr>";
        echo "<td>" . htmlspecialchars($applicant['id']) . "</td>";
        echo "<td>" . htmlspecialchars($applicant['fname'] . ' ' . $applicant['lname']) . "</td>";
        echo "<td>" . htmlspecialchars($applicant['email']) . "</td>";
        echo "<td>" . htmlspecialchars($applicant['position']) . "</td>";
        echo "<td>" . htmlspecialchars($applicant['status']) . "</td>";
        echo "<td style='font-size: 10px; max-width: 150px; word-break: break-all;'>" . htmlspecialchars($applicant['resume_path'] ?? 'NULL') . "</td>";
        echo "<td style='font-size: 10px; max-width: 150px; word-break: break-all;'>" . htmlspecialchars($applicant['birth_certificate_path'] ?? 'NULL') . "</td>";
        echo "<td style='font-size: 10px; max-width: 150px; word-break: break-all;'>" . htmlspecialchars($applicant['diploma_path'] ?? 'NULL') . "</td>";
        echo "<td style='font-size: 10px; max-width: 150px; word-break: break-all;'>" . htmlspecialchars($applicant['cover_letter_path'] ?? 'NULL') . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    echo "<h3>Summary:</h3>";
    echo "<p style='color: green;'>✓ Fixed file paths for $updatedCount applicants</p>";
    echo "<p>File paths now include proper directory structure:</p>";
    echo "<ul>";
    echo "<li>Resumes: uploads/resumes/[filename]</li>";
    echo "<li>Birth Certificates: uploads/birth_certificates/[filename]</li>";
    echo "<li>Diplomas: uploads/diplomas/[filename]</li>";
    echo "<li>Cover Letters: uploads/cover_letters/[filename]</li>";
    echo "</ul>";
    
} catch(PDOException $e) {
    echo "<p style='color: red;'>Database error: " . htmlspecialchars($e->getMessage()) . "</p>";
}
?>
