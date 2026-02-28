<?php
try {
    $pdo = new PDO('mysql:host=localhost;port=3307;dbname=hr_management', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Checking recent PHP error logs...\n";
    
    // Check if there are any recent error logs
    $logFile = 'C:/xampp/apache/logs/error.log';
    if (file_exists($logFile)) {
        $logs = file_get_contents($logFile);
        $recentLogs = substr($logs, -2000); // Last 2000 characters
        echo "Recent error logs:\n" . $recentLogs . "\n";
    } else {
        echo "No error log file found at: " . $logFile . "\n";
    }
    
    // Test a simple insert to see if database connection works
    echo "\nTesting database insert...\n";
    $testStmt = $pdo->prepare("INSERT INTO applicants (fname, lname, email, phone, position, dept) VALUES (?, ?, ?, ?, ?, ?)");
    $testResult = $testStmt->execute(['Test', 'User', 'test@example.com', '1234567890', 'Test Position']);
    $testId = $pdo->lastInsertId();
    echo "Test insert result: " . ($testResult ? "SUCCESS" : "FAILED") . " - ID: " . $testId . "\n";
    
} catch(Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
