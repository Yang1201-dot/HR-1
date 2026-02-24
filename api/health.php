<?php
// Simple health endpoint to diagnose DB connectivity (dev only)
ini_set('display_errors', 0);
error_reporting(0);
header('Content-Type: application/json');

$hosts = ['localhost'];
$ports = [3306, 3307];
$dbChecks = ['hr4', 'microfinance_hr1'];
$results = [];

foreach ($ports as $port) {
    $portResult = ['port' => $port, 'connected' => false, 'error' => null, 'databases' => []];
    try {
        $dsn = "mysql:host=localhost;port={$port};charset=utf8mb4";
        $pdo = new PDO($dsn, 'root', '', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $portResult['connected'] = true;

        // list databases
        $stmt = $pdo->query("SHOW DATABASES");
        $dbs = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);
        $portResult['databases_list'] = $dbs;

        // check expected DBs and key tables
        foreach ($dbChecks as $dbname) {
            $dbok = ['name' => $dbname, 'exists' => in_array($dbname, $dbs), 'tables' => []];
            if ($dbok['exists']) {
                try {
                    $pdo->exec("USE `{$dbname}`");
                    // check a couple of tables by name (may or may not exist)
                    $tablesToCheck = ['useraccounts', 'employee', 'hr4_attendance_log'];
                    foreach ($tablesToCheck as $t) {
                        try {
                            $r = $pdo->query("SELECT 1 FROM `{$t}` LIMIT 1");
                            $dbok['tables'][$t] = true;
                        } catch (Exception $e) {
                            $dbok['tables'][$t] = false;
                        }
                    }
                } catch (Exception $e) {
                    $dbok['tables'] = null;
                }
            }
            $portResult['databases'][] = $dbok;
        }

    } catch (Exception $e) {
        $portResult['error'] = $e->getMessage();
    }
    $results[] = $portResult;
}

echo json_encode(['ok' => true, 'checked_ports' => $results], JSON_PRETTY_PRINT);
exit;
?>