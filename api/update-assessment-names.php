<?php
// Update existing assessments with applicant names
header('Content-Type: application/json');

try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3307;dbname=hr_management;charset=utf8mb4',
        'root', '', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    
    // Get all assessments without applicant names
    $stmt = $pdo->query("
        SELECT a.id, a.applicant_id, a.applicant_name 
        FROM assessments a 
        WHERE a.applicant_name IS NULL OR a.applicant_name = ''
    ");
    $assessments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $updated = 0;
    foreach ($assessments as $assessment) {
        // Get applicant name
        $stmt = $pdo->prepare("SELECT CONCAT(first_name, ' ', last_name) as name FROM applicants WHERE id = ?");
        $stmt->execute([$assessment['applicant_id']]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result && !empty($result['name'])) {
            // Update assessment with applicant name
            $updateStmt = $pdo->prepare("UPDATE assessments SET applicant_name = ? WHERE id = ?");
            $updateStmt->execute([$result['name'], $assessment['id']]);
            $updated++;
            
            error_log("Updated assessment ID {$assessment['id']} with applicant name: {$result['name']}");
        }
    }
    
    echo json_encode([
        'success' => true, 
        'message' => "Updated $updated assessments with applicant names"
    ]);
    
} catch(Exception $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Error updating assessments: ' . $e->getMessage()
    ]);
}
?>
