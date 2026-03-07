<?php
$file = __DIR__ . '/recruitment.html';
$c = file_get_contents($file);
$original = $c;

// Fix r_open - remove the early return so modal opens locally in iframe
$c = str_replace(
    "function r_open(id) {\r\n\r\n  try { if (window.parent !== window) { window.parent.postMessage({type:'HR1_OPEN_MODAL',modalId:id},'*'); return; } } catch(e) {}\r\n\r\n  var m = document.getElementById(id); if (m) m.classList.add('active');\r\n\r\n}",
    "function r_open(id) {\r\n  try { if (window.parent !== window) { window.parent.postMessage({type:'HR1_OPEN_MODAL',modalId:id},'*'); } } catch(e) {}\r\n  var m = document.getElementById(id); if (m) m.classList.add('active');\r\n}",
    $c
);

// Fix r_close - remove the early return so modal closes locally in iframe
$c = str_replace(
    "function r_close(id) {\r\n\r\n  try { if (window.parent !== window) { window.parent.postMessage({type:'HR1_CLOSE_MODAL'},'*'); return; } } catch(e) {}\r\n\r\n  var m = document.getElementById(id); if (m) m.classList.remove('active');\r\n\r\n}\r\n\r\nwindow.r_close = r_close;",
    "function r_close(id) {\r\n  try { if (window.parent !== window) { window.parent.postMessage({type:'HR1_CLOSE_MODAL'},'*'); } } catch(e) {}\r\n  var m = document.getElementById(id); if (m) m.classList.remove('active');\r\n}\r\nwindow.r_close = r_close;",
    $c
);

if ($c !== $original) {
    file_put_contents($file, $c);
    echo '<h2 style="color:green;font-family:sans-serif">SUCCESS! r_open and r_close fixed.</h2>';
    echo '<p style="font-family:sans-serif">Delete this file, then hard refresh: Ctrl+Shift+R</p>';
} else {
    echo '<h2 style="color:orange;font-family:sans-serif">No changes made - already patched or different format.</h2>';
    echo '<pre style="font-size:11px">';
    $pos = strpos($c, 'function r_open');
    echo htmlspecialchars(substr($c, $pos, 200));
    echo '</pre>';
}
?>
