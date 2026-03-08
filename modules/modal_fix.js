// Force modal to be visible with inline styles
function r_openForced(id) {
  var modal = document.getElementById(id);
  if (modal) {
    modal.style.cssText = "display: flex !important; position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 999999 !important; background: rgba(0,0,0,0.8) !important; align-items: center !important; justify-content: center !important;";
    console.log("Modal forced visible with inline styles");
  }
}

// Replace the original r_open call in recruitment.html
// Find: r_open('r_modal_interview');
// Replace with: r_openForced('r_modal_interview');
