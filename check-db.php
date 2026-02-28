<?php
try {
    $pdo = new PDO('mysql:host=localhost;port=3307;dbname=hr_management', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== APPLICANTS TABLE STRUCTURE ===\n";
    $stmt = $pdo->query('DESCRIBE applicants');
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo $row['Field'] . ' - ' . $row['Type'] . ' - ' . $row['Null'] . ' - ' . $row['Key'] . "\n";
    }
    
    echo "\n=== SAMPLE DATA ===\n";
    $stmt = $pdo->query('SELECT * FROM applicants LIMIT 3');
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "ID: " . $row['id'] . " - Name: " . $row['fname'] . " " . $row['lname'] . " - Email: " . $row['email'] . "\n";
    }
    
} catch(Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
