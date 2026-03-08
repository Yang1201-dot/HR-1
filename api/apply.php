<?php

// Simple application handler - saves uploaded files and writes a JSON record.

// Dev-only: do not use on production without proper security checks.



ini_set('display_errors', 0);

header('Content-Type: application/json');



function ensure_dir($d) {

    if (!is_dir($d)) mkdir($d, 0755, true);

}



try {

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') throw new Exception('Invalid method');



    $uploadsBase = __DIR__ . '/../uploads/applications';

    ensure_dir($uploadsBase);



    $record = [];

    $record['role'] = $_POST['role'] ?? '';

    $record['name'] = $_POST['name'] ?? '';

    $record['email'] = $_POST['email'] ?? '';

    $record['phone'] = $_POST['phone'] ?? '';

    $record['message'] = $_POST['message'] ?? '';

    $record['submitted_at'] = date('c');



    // handle file fields: resume, birth_certificate, diploma, cover_letter

    $savedFiles = [];

    $fileFields = ['resume','birth_certificate','diploma','cover_letter'];

    foreach ($fileFields as $f) {

        if (!empty($_FILES[$f]) && $_FILES[$f]['error'] === UPLOAD_ERR_OK) {

            $tmp = $_FILES[$f]['tmp_name'];

            $name = basename($_FILES[$f]['name']);

            // simple sanitized filename

            $name = preg_replace('/[^A-Za-z0-9._-]/', '_', $name);

            $dest = $uploadsBase . '/' . time() . '_' . $name;

            if (move_uploaded_file($tmp, $dest)) {

                $savedFiles[$f] = str_replace($_SERVER['DOCUMENT_ROOT'], '', $dest);

            }

        }

    }



    $record['files'] = $savedFiles;



    // append record to a JSON lines file

    $logfile = $uploadsBase . '/applications.jsonl';

    file_put_contents($logfile, json_encode($record) . PHP_EOL, FILE_APPEND | LOCK_EX);



    echo json_encode(['success' => true, 'message' => 'Application received']);

} catch (Exception $e) {

    http_response_code(400);

    echo json_encode(['success' => false, 'message' => $e->getMessage()]);

}



?>

