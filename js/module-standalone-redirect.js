// Module Standalone Detection and Redirect
(function() {
  'use strict';
  
  // Check if this module is loaded within an iframe (dashboard context)
  function isInIframe() {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true; // If cross-origin error, assume it's in iframe
    }
  }
  
  // Get the current module name from filename
  function getModuleName() {
    var path = window.location.pathname;
    var filename = path.split('/').pop();
    return filename.replace('.html', '');
  }
  
  // Redirect to dashboard with module parameter
  function redirectToDashboard(moduleName) {
    var dashboardUrl = window.location.pathname.replace(/\/[^\/]*$/, '/dashboard.html');
    var separator = dashboardUrl.includes('?') ? '&' : '?';
    var targetUrl = dashboardUrl + separator + 'module=' + encodeURIComponent(moduleName);
    window.location.replace(targetUrl);
  }
  
  // Main detection logic
  if (!isInIframe()) {
    // This module is loaded standalone, redirect to dashboard
    var moduleName = getModuleName();
    console.log('Module loaded standalone, redirecting to dashboard with module:', moduleName);
    
    // Show a brief loading message
    document.body.innerHTML = `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #f8f9fa;
        color: #2ca078;
        font-size: 18px;
        font-weight: 600;
      ">
        <div style="text-align: center;">
          <div style="
            width: 40px;
            height: 40px;
            border: 4px solid #e5e7eb;
            border-top: 4px solid #2ca078;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          "></div>
          Loading HR Dashboard...
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    
    // Redirect after a brief delay
    setTimeout(function() {
      redirectToDashboard(moduleName);
    }, 500);
  } else {
    // Module is loaded in iframe, all good
    console.log('Module loaded in dashboard context');
  }
})();
