<?php
// Return JSON only and avoid PHP HTML error output which breaks JSON parsing on the client
ini_set('display_errors', 0);
error_reporting(0);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Helper: try to connect on common MySQL ports (3306 then 3307)
function connectPDO($dbname, $user = 'root', $pass = '') {
    $hosts = ['localhost'];
    $ports = [3306, 3307];

    foreach ($ports as $port) {
        try {
            $dsn = "mysql:host=localhost;port={$port};dbname={$dbname};charset=utf8mb4";
            $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
            return $pdo;
        } catch (PDOException $e) {
            // try next port
        }
    }
    throw new Exception('Could not connect to database on known ports');
}

$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

try {
    // Note: the HR4 database name was used previously; keep same name here
    $pdo_hr4 = connectPDO('hr4');

    // Check HR4's useraccounts table
    $stmt = $pdo_hr4->prepare("SELECT ua.*, e.FirstName, e.LastName, e.EmployeeID FROM useraccounts ua JOIN employee e ON ua.EmployeeID = e.EmployeeID WHERE ua.Email = ? AND ua.AccountStatus = 'Active'");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Only support hashed passwords. If you previously used a dev plaintext column,
    // run the migration endpoint /api/migrate-hr4-password.php to populate PasswordHash.
    $passwordOk = false;
    if ($user && !empty($user['PasswordHash']) && password_verify($password, $user['PasswordHash'])) {
        $passwordOk = true;
    }

    if ($user && $passwordOk) {
        echo json_encode([
            'success' => true,
            'token' => bin2hex(random_bytes(32)),
            'name' => $user['FirstName'] . ' ' . $user['LastName'],
            'employee_id' => $user['EmployeeID']
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
    }
} catch (Exception $e) {
    // Log the exception server-side (if desired) and return a clean JSON error
    // error_log($e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Database connection error']);
}
?>