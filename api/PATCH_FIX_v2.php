<?php
/**
 * ONE-CLICK FIX v2 — run at: http://localhost/microfinance/HR-1/api/PATCH_FIX_v2.php
 * DELETE this file after running.
 */
$results = [];

// ── Fix recruitment.html ──────────────────────────────────────────────────────
$htmlFile = __DIR__ . '/../modules/recruitment.html';
$html = file_get_contents($htmlFile);
$before = $html;

// Remove requirements from r_save payload
$html = preg_replace('/,?\s*\n\s+requirements: \(function\(\) \{.*?\}\)\(\),?/s', '', $html);

// Remove checkbox CSS block
$html = preg_replace('/\n\/\* ── Requirements Checkboxes ── \*\/\n.*?\.req-checkbox-item em \{[^\}]+\}\n/s', "\n", $html);

// Remove checkbox form group HTML
$html = preg_replace('/[ \t]*<div class="form-group">\s*<label>Application Requirements<\/label>.*?<\/div>\s*<\/div>/s', '', $html);

file_put_contents($htmlFile, $html);
$results[] = (strpos($html, 'r_req_resume') !== false) ? "❌ HTML: r_req_resume still present" : "✅ HTML: requirements removed";
$results[] = ($html !== $before) ? "✅ HTML: file was changed" : "⚠️ HTML: no changes made (may already be clean)";

// ── Fix simple-api-new.php ────────────────────────────────────────────────────
$phpFile = __DIR__ . '/simple-api-new.php';
$php = file_get_contents($phpFile);

$php = preg_replace(
    '/INSERT INTO jobs \(\s*title, department, location, employment_type,\s*description, requirements, salary_range, status\s*\) VALUES \(\?, \?, \?, \?, \?, \?, \?, \?\)/',
    "INSERT INTO jobs (\n                        title, department, location, employment_type,\n                        description, salary_range, status\n                    ) VALUES (?, ?, ?, ?, ?, ?, ?)",
    $php
);
$php = preg_replace("/\\\$data\['requirements'\] \?\? '',\s*\n\s*\\\$data\['salary_range'\]/", "\$data['salary_range']", $php);
$php = str_replace('description, requirements, salary_range', 'description, salary_range', $php);
$php = str_replace("foreach (['benefits', 'emptype', 'salary'] as \$dropCol)", "foreach (['benefits', 'emptype', 'salary', 'requirements'] as \$dropCol)", $php);
file_put_contents($phpFile, $php);

$results[] = (strpos($php, "VALUES (?, ?, ?, ?, ?, ?, ?)") !== false) ? "✅ PHP: INSERT fixed (7 params)" : "❌ PHP: INSERT still wrong";
$results[] = (strpos($php, 'description, requirements') === false) ? "✅ PHP: SELECT fixed" : "❌ PHP: SELECT still has requirements";

// ── Drop requirements column from DB ─────────────────────────────────────────
try {
    $pdo = new PDO("mysql:host=localhost;port=3307;dbname=hr_management", "root", "");
    $pdo->exec("ALTER TABLE jobs DROP COLUMN IF EXISTS requirements");
    $results[] = "✅ DB: requirements column dropped (or didn't exist)";
} catch (Exception $e) {
    $results[] = "⚠️ DB: " . $e->getMessage();
}

echo "<pre style='font-family:monospace;font-size:15px;padding:30px;background:#111;color:#eee'>";
echo "PATCH v2 RESULTS:\n\n";
foreach ($results as $r) echo $r . "\n";
echo "\n✅ Done! Delete this file now.\n";
echo "</pre>";
