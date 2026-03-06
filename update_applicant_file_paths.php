<?php
// Script to update applicant file paths from applicant_files table
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
    
    echo "<h2>Updating Applicant File Paths</h2>";
    
    // First, let's see what files exist in the applicant_files table
    echo "<h3>Current Files in applicant_files table:</h3>";
    $filesStmt = $pdo->query("
        SELECT 
            af.applicant_id, 
            af.file_field, 
            af.file_path, 
            af.file_name,
            CONCAT(a.fname, ' ', a.lname) as applicant_name
        FROM applicant_files af
        LEFT JOIN applicants a ON af.applicant_id = a.id
        ORDER BY af.applicant_id, af.file_field
    ");
    
    $files = $filesStmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($files)) {
        echo "<p style='color: orange;'>No files found in applicant_files table</p>";
        
        // Let's check if there are any uploaded files in the uploads directory
        $uploadDir = __DIR__ . '/uploads/';
        if (is_dir($uploadDir)) {
            echo "<h3>Files in uploads directory:</h3>";
            $directories = ['resumes/', 'birth_certificates/', 'diplomas/', 'cover_letters/'];
            
            foreach ($directories as $dir) {
                $fullDir = $uploadDir . $dir;
                if (is_dir($fullDir)) {
                    $files = scandir($fullDir);
                    echo "<h4>" . htmlspecialchars($dir) . "</h4>";
                    echo "<ul>";
                    foreach ($files as $file) {
                        if ($file !== '.' && $file !== '..') {
                            echo "<li>" . htmlspecialchars($file) . "</li>";
                        }
                    }
                    echo "</ul>";
                } else {
                    echo "<p style='color: red;'>Directory not found: " . htmlspecialchars($dir) . "</p>";
                }
            }
        }
    } else {
        echo "<table border='1' style='border-collapse: collapse; margin: 10px 0;'>";
        echo "<tr><th>Applicant ID</th><th>Name</th><th>File Field</th><th>File Name</th><th>File Path</th></tr>";
        
        foreach ($files as $file) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($file['applicant_id']) . "</td>";
            echo "<td>" . htmlspecialchars($file['applicant_name']) . "</td>";
            echo "<td>" . htmlspecialchars($file['file_field']) . "</td>";
            echo "<td>" . htmlspecialchars($file['file_name']) . "</td>";
            echo "<td>" . htmlspecialchars($file['file_path']) . "</td>";
            echo "</tr>";
        }
        echo "</table>";
        
        // Now update the applicants table with the file paths
        echo "<h3>Updating applicants table with file paths...</h3>";
        
        // Group files by applicant_id
        $applicantFiles = [];
        foreach ($files as $file) {
            $applicantFiles[$file['applicant_id']][$file['file_field']] = $file['file_path'];
        }
        
        $updatedCount = 0;
        
        foreach ($applicantFiles as $applicantId => $paths) {
            $resumePath = $paths['resume'] ?? null;
            $birthCertificatePath = $paths['birth_certificate'] ?? null;
            $diplomaPath = $paths['diploma'] ?? null;
            $coverLetterPath = $paths['cover_letter'] ?? null;
            
            $stmt = $pdo->prepare("
                UPDATE applicants SET 
                    resume_path = ?, 
                    birth_certificate_path = ?, 
                    diploma_path = ?, 
                    cover_letter_path = ?, 
                    updated_at = NOW() 
                WHERE id = ?
            ");
            
            $stmt->execute([
                $resumePath, 
                $birthCertificatePath, 
                $diplomaPath, 
                $coverLetterPath, 
                $applicantId
            ]);
            
            $updatedCount++;
            
            echo "<p style='color: green;'>✓ Updated applicant ID $applicantId</p>";
            echo "<ul>";
            if ($resumePath) echo "<li>Resume: " . htmlspecialchars($resumePath) . "</li>";
            if ($birthCertificatePath) echo "<li>Birth Certificate: " . htmlspecialchars($birthCertificatePath) . "</li>";
            if ($diplomaPath) echo "<li>Diploma: " . htmlspecialchars($diplomaPath) . "</li>";
            if ($coverLetterPath) echo "<li>Cover Letter: " . htmlspecialchars($coverLetterPath) . "</li>";
            echo "</ul>";
        }
        
        echo "<h3>Summary:</h3>";
        echo "<p style='color: green;'>✓ Updated $updatedCount applicants with file paths</p>";
    }
    
    // Show the updated applicants table
    echo "<h3>Updated Applicants Table:</h3>";
    $applicantsStmt = $pdo->query("
        SELECT 
            id, fname, lname, email, position, status,
            resume_path, birth_certificate_path, diploma_path, cover_letter_path
        FROM applicants 
        ORDER BY id
    ");
    
    $applicants = $applicantsStmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table border='1' style='border-collapse: collapse; margin: 10px 0;'>";
    echo "<tr><th>ID</th><th>Name</th><th>Email</th><th>Position</th><th>Status</th><th>Resume</th><th>Birth Cert</th><th>Diploma</th><th>Cover Letter</th></tr>";
    
    foreach ($applicants as $applicant) {
        echo "<tr>";
        echo "<td>" . htmlspecialchars($applicant['id']) . "</td>";
        echo "<td>" . htmlspecialchars($applicant['fname'] . ' ' . $applicant['lname']) . "</td>";
        echo "<td>" . htmlspecialchars($applicant['email']) . "</td>";
        echo "<td>" . htmlspecialchars($applicant['position']) . "</td>";
        echo "<td>" . htmlspecialchars($applicant['status']) . "</td>";
        echo "<td>" . ($applicant['resume_path'] ? '<span style="color: green;">✓</span>' : '<span style="color: red;">✗</span>') . "</td>";
        echo "<td>" . ($applicant['birth_certificate_path'] ? '<span style="color: green;">✓</span>' : '<span style="color: red;">✗</span>') . "</td>";
        echo "<td>" . ($applicant['diploma_path'] ? '<span style="color: green;">✓</span>' : '<span style="color: red;">✗</span>') . "</td>";
        echo "<td>" . ($applicant['cover_letter_path'] ? '<span style="color: green;">✓</span>' : '<span style="color: red;">✗</span>') . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    echo "<hr>";
    echo "<p><strong>Next Steps:</strong></p>";
    echo "<ul>";
    echo "<li>The file paths have been updated from the applicant_files table</li>";
    echo "<li>You can now access file paths directly from the applicants table</li>";
    echo "<li>The get_applications API endpoint can return these file paths if needed</li>";
    echo "</ul>";
    
} catch(PDOException $e) {
    echo "<p style='color: red;'>Database error: " . htmlspecialchars($e->getMessage()) . "</p>";
}
?>
