<?php
// Script to update applicant job details from jobs table
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
    
    echo "<h2>Updating Applicant Job Details</h2>";
    
    // First, let's see what jobs are available
    echo "<h3>Available Jobs:</h3>";
    $jobsStmt = $pdo->query("
        SELECT id, title, department, location, employment_type, description, salary_range
        FROM jobs 
        ORDER BY title
    ");
    
    $jobs = $jobsStmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($jobs)) {
        echo "<p style='color: orange;'>No jobs found in jobs table</p>";
    } else {
        echo "<table border='1' style='border-collapse: collapse; margin: 10px 0;'>";
        echo "<tr><th>ID</th><th>Title</th><th>Department</th><th>Location</th><th>Employment Type</th><th>Salary Range</th></tr>";
        
        foreach ($jobs as $job) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($job['id']) . "</td>";
            echo "<td>" . htmlspecialchars($job['title']) . "</td>";
            echo "<td>" . htmlspecialchars($job['department']) . "</td>";
            echo "<td>" . htmlspecialchars($job['location']) . "</td>";
            echo "<td>" . htmlspecialchars($job['employment_type']) . "</td>";
            echo "<td>" . htmlspecialchars($job['salary_range']) . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    }
    
    // Now let's see current applicants and their positions
    echo "<h3>Current Applicants (before update):</h3>";
    $applicantsStmt = $pdo->query("
        SELECT 
            id, fname, lname, position, dept, employment_type, salary, description
        FROM applicants 
        ORDER BY id
    ");
    
    $applicants = $applicantsStmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table border='1' style='border-collapse: collapse; margin: 10px 0;'>";
    echo "<tr><th>ID</th><th>Name</th><th>Position</th><th>Dept</th><th>Employment Type</th><th>Salary</th><th>Description</th></tr>";
    
    foreach ($applicants as $applicant) {
        echo "<tr>";
        echo "<td>" . htmlspecialchars($applicant['id']) . "</td>";
        echo "<td>" . htmlspecialchars($applicant['fname'] . ' ' . $applicant['lname']) . "</td>";
        echo "<td>" . htmlspecialchars($applicant['position']) . "</td>";
        echo "<td>" . htmlspecialchars($applicant['dept']) . "</td>";
        echo "<td>" . htmlspecialchars($applicant['employment_type']) . "</td>";
        echo "<td>" . htmlspecialchars($applicant['salary']) . "</td>";
        echo "<td style='max-width: 200px; word-break: break-all;'>" . htmlspecialchars($applicant['description']) . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    // Create a mapping of position to job details
    $jobMapping = [];
    foreach ($jobs as $job) {
        $jobMapping[$job['title']] = $job;
    }
    
    // Update applicants with job details
    echo "<h3>Updating Applicants with Job Details...</h3>";
    
    $updatedCount = 0;
    $skippedCount = 0;
    
    foreach ($applicants as $applicant) {
        $applicantId = $applicant['id'];
        $position = $applicant['position'];
        
        // Find matching job
        if (isset($jobMapping[$position])) {
            $job = $jobMapping[$position];
            
            $updateStmt = $pdo->prepare("
                UPDATE applicants SET 
                    dept = ?, 
                    employment_type = ?, 
                    salary = ?, 
                    description = ?, 
                    updated_at = NOW() 
                WHERE id = ?
            ");
            
            $updateStmt->execute([
                $job['department'] ?? null,
                $job['employment_type'] ?? null,
                $job['salary_range'] ?? null,
                $job['description'] ?? null,
                $applicantId
            ]);
            
            $updatedCount++;
            
            echo "<p style='color: green;'>✓ Updated applicant ID $applicantId (" . htmlspecialchars($applicant['fname'] . ' ' . $applicant['lname']) . ")</p>";
            echo "<ul>";
            echo "<li>Position: " . htmlspecialchars($position) . "</li>";
            echo "<li>Department: " . htmlspecialchars($job['department'] ?? 'NULL') . "</li>";
            echo "<li>Employment Type: " . htmlspecialchars($job['employment_type'] ?? 'NULL') . "</li>";
            echo "<li>Salary: " . htmlspecialchars($job['salary_range'] ?? 'NULL') . "</li>";
            echo "<li>Description: " . htmlspecialchars(substr($job['description'] ?? 'NULL', 0, 100) . '...') . "</li>";
            echo "</ul>";
        } else {
            $skippedCount++;
            echo "<p style='color: orange;'>⚠ Skipped applicant ID $applicantId (" . htmlspecialchars($applicant['fname'] . ' ' . $applicant['lname']) . ") - No matching job found for position: " . htmlspecialchars($position) . "</p>";
        }
    }
    
    // Show final result
    echo "<h3>Final Result (after update):</h3>";
    $finalStmt = $pdo->query("
        SELECT 
            id, fname, lname, position, dept, employment_type, salary, description
        FROM applicants 
        ORDER BY id
    ");
    
    $finalApplicants = $finalStmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table border='1' style='border-collapse: collapse; margin: 10px 0;'>";
    echo "<tr><th>ID</th><th>Name</th><th>Position</th><th>Dept</th><th>Employment Type</th><th>Salary</th><th>Description</th></tr>";
    
    foreach ($finalApplicants as $applicant) {
        echo "<tr>";
        echo "<td>" . htmlspecialchars($applicant['id']) . "</td>";
        echo "<td>" . htmlspecialchars($applicant['fname'] . ' ' . $applicant['lname']) . "</td>";
        echo "<td>" . htmlspecialchars($applicant['position']) . "</td>";
        echo "<td>" . htmlspecialchars($applicant['dept']) . "</td>";
        echo "<td>" . htmlspecialchars($applicant['employment_type']) . "</td>";
        echo "<td>" . htmlspecialchars($applicant['salary']) . "</td>";
        echo "<td style='max-width: 200px; word-break: break-all;'>" . htmlspecialchars($applicant['description']) . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    echo "<h3>Summary:</h3>";
    echo "<p style='color: green;'>✓ Updated $updatedCount applicants with job details</p>";
    echo "<p style='color: orange;'>⚠ Skipped $skippedCount applicants (no matching job found)</p>";
    
    echo "<hr>";
    echo "<p><strong>Next Steps:</strong></p>";
    echo "<ul>";
    echo "<li>The job details have been updated from the jobs table</li>";
    echo "<li>Applicants now have correct department, employment_type, salary, and description</li>";
    echo "<li>The get_applications API endpoint will return these updated details</li>";
    echo "</ul>";
    
} catch(PDOException $e) {
    echo "<p style='color: red;'>Database error: " . htmlspecialchars($e->getMessage()) . "</p>";
}
?>
