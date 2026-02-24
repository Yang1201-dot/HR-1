<?php
// Lightweight migration script (dev only):
// - Hashes any PasswordPlain values using PHP's password_hash()
// - Writes result to PasswordHash and clears PasswordPlain
// WARNING: Run this once in your local/dev environment then remove this file.

ini_set('display_errors', 0);
error_reporting(0);
header('Content-Type: application/json');

function connectPDO($dbname, $user = 'root', $pass = '') {
    $ports = [3306, 3307];
    foreach ($ports as $port) {
        try {
            $dsn = "mysql:host=localhost;port={$port};dbname={$dbname};charset=utf8mb4";
            $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
            return $pdo;
        } catch (PDOException $e) {
            // try next
        }
    }
    throw new Exception('Could not connect to database on known ports');
}

try {
    $pdo = connectPDO('hr4');

    // Fetch accounts that still have a plaintext password
    $stmt = $pdo->prepare("SELECT id, PasswordPlain FROM useraccounts WHERE PasswordPlain IS NOT NULL AND PasswordPlain <> ''");
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $updated = 0;
    foreach ($rows as $r) {
        $hash = password_hash($r['PasswordPlain'], PASSWORD_DEFAULT);
        $up = $pdo->prepare("UPDATE useraccounts SET PasswordHash = ?, PasswordPlain = NULL WHERE id = ?");
        $up->execute([$hash, $r['id']]);
        $updated++;
    }

    echo json_encode(['success' => true, 'updated' => $updated, 'message' => "Hashed {$updated} account(s). Please remove this migration file after use."]); 
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Migration failed: ' . $e->getMessage()]);
}

?>
