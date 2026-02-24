<?php
// MySQL Database Configuration and Helper Functions for HR1 System
// Designed for use with XAMPP/MySQL local development

class MySQLDatabase {
    // Database connection parameters
    private $host = 'localhost';
    private $database = 'microfinance_hr1';
    private $username = 'root';
    private $password = '';
    private $port = 3307;
    private $connection = null;

    // Constructor - establishes database connection
    public function __construct() {
        $this->connect();
    }

    // Establish PDO connection to MySQL database
    private function connect() {
        try {
            $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->database};charset=utf8mb4";
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];

            $this->connection = new PDO($dsn, $this->username, $this->password, $options);
            
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            throw new Exception("Database connection failed. Please check your configuration.");
        }
    }

    // Get the active PDO connection
    public function getConnection() {
        return $this->connection;
    }

    // Execute a SELECT query and return all results
    public function query($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Query failed: " . $e->getMessage());
            throw new Exception("Query execution failed.");
        }
    }

    // Execute an INSERT/UPDATE/DELETE query
    public function execute($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("Execute failed: " . $e->getMessage());
            throw new Exception("Query execution failed.");
        }
    }

    // Execute an INSERT and return the last inserted ID
    public function insert($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $this->connection->lastInsertId();
        } catch (PDOException $e) {
            error_log("Insert failed: " . $e->getMessage());
            throw new Exception("Insert operation failed.");
        }
    }

    // Get a single row from a query
    public function queryOne($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetch();
        } catch (PDOException $e) {
            error_log("QueryOne failed: " . $e->getMessage());
            throw new Exception("Query execution failed.");
        }
    }

    // Begin a transaction
    public function beginTransaction() {
        return $this->connection->beginTransaction();
    }

    // Commit a transaction
    public function commit() {
        return $this->connection->commit();
    }

    // Rollback a transaction
    public function rollback() {
        return $this->connection->rollBack();
    }

    // Close the database connection
    public function close() {
        $this->connection = null;
    }
}

// Helper function to format dates for MySQL
function formatDateForMySQL($date) {
    if ($date instanceof DateTime) {
        return $date->format('Y-m-d H:i:s');
    }
    return date('Y-m-d H:i:s', strtotime($date));
}

// Helper function to sanitize input
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Helper function to send JSON response
function sendJSONResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Helper function to send error response
function sendErrorResponse($message, $statusCode = 400) {
    sendJSONResponse(['error' => $message], $statusCode);
}

// Helper function to send success response
function sendSuccessResponse($data, $message = 'Success') {
    sendJSONResponse([
        'success' => true,
        'message' => $message,
        'data' => $data
    ]);
}
?>