// HR1 Module Page Loading System - With Active State Tracking
(function setupHR1Navigation() {
  console.log('🚀 HR1 Navigation initializing...');
  
  // Get the content wrapper where HR1 pages will load
  const contentWrapper = document.querySelector('.content-wrapper');
  
  if (!contentWrapper) {
    console.error('❌ Content wrapper not found!');
    return;
  }
  
  console.log('✓ Content wrapper found');

  // Store original dashboard content
  const originalContent = contentWrapper.innerHTML;

  // Map data-page values to HTML file paths
  const pageRoutes = {
    'recruitment': 'recruitment.html',
    'app-mgmt': 'application-management.html',
    'onboard': 'onboarding.html',
    'evaluation': 'performance-evaluation.html',
    'social-rec': 'social-recognition.html'
  };

  // Function to update active states
  function setActiveMenuItem(pageName) {
    // Remove all active states from nav items and submenu items
    document.querySelectorAll('.nav-item, .submenu-item').forEach(link => {
      link.classList.remove('active');
    });
    
    // Set the clicked submenu item as active
    const activeLink = document.querySelector(`[data-page="${pageName}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
      
      // Also keep the parent "Human Resources" menu highlighted
      const hrParentButton = document.querySelector('.nav-item.has-submenu[data-module="hr"]');
      if (hrParentButton) {
        hrParentButton.classList.add('active');
      }
      
      // Make sure HR submenu stays open
      const hrSubmenu = document.getElementById('submenu-hr');
      if (hrSubmenu) {
        hrSubmenu.classList.add('active');
      }
      
      console.log('✓ Set active:', pageName);
    }
  }

  // Function to load a page
  function loadPage(pageName) {
    const pagePath = pageRoutes[pageName];
    
    if (!pagePath) {
      console.warn('⚠️ No route for:', pageName);
      return;
    }
    
    console.log('📄 Loading:', pageName, '→', pagePath);

    // Show loading indicator
    contentWrapper.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 400px;">
        <div style="text-align: center; color: var(--text-secondary);">
          <div style="font-size: 2rem; margin-bottom: 1rem;">⏳</div>
          <div>Loading ${pageName}...</div>
        </div>
      </div>
    `;

    // Fetch the HTML file
    fetch(pagePath)
      .then(response => {
        console.log('📥 Response:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.text();
      })
      .then(html => {
        console.log('✓ HTML received');
        
        // Parse the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const hrContent = doc.querySelector('.hr-content');
        
        if (!hrContent) {
          throw new Error('No .hr-content div found in HTML');
        }
        
        console.log('✓ .hr-content found');
        
        // Replace content
        contentWrapper.innerHTML = hrContent.innerHTML;
        
        // Update active state
        setActiveMenuItem(pageName);
        
        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
        
        console.log('✅ Page loaded successfully!');
      })
      .catch(error => {
        console.error('❌ Error:', error);
        contentWrapper.innerHTML = `
          <div style="padding: 3rem; text-align: center;">
            <div style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;">⚠️</div>
            <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">Error Loading Page</h3>
            <p style="color: var(--text-secondary); margin-bottom: 0.5rem;"><strong>Page:</strong> ${pageName}</p>
            <p style="color: var(--text-secondary); margin-bottom: 0.5rem;"><strong>Path:</strong> ${pagePath}</p>
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem;"><strong>Error:</strong> ${error.message}</p>
            <div style="background: var(--surface); border: 1px solid var(--border-color); border-radius: 8px; padding: 1.5rem; text-align: left; max-width: 500px; margin: 0 auto;">
              <p style="margin-bottom: 0.5rem; font-weight: 600;">Troubleshooting:</p>
              <ul style="margin-left: 1.5rem; line-height: 1.8; color: var(--text-secondary);">
                <li>Make sure HTML files are in modules/ folder</li>
                <li>Use a local server (python -m http.server 8000)</li>
                <li>Check browser console (F12) for details</li>
              </ul>
            </div>
            <button onclick="location.reload()" style="margin-top: 1.5rem; padding: 0.75rem 1.5rem; background: var(--brand-green); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Reload Page</button>
          </div>
        `;
      });
  }

  // Function to restore dashboard
  function restoreDashboard() {
    contentWrapper.innerHTML = originalContent;
    
    // Remove all active states
    document.querySelectorAll('.nav-item, .submenu-item').forEach(link => {
      link.classList.remove('active');
    });
    
    // Set Dashboard as active
    const dashboardLink = document.querySelector('.nav-item[data-page="dashboard"]');
    if (dashboardLink) {
      dashboardLink.classList.add('active');
    }
    
    // Reinitialize icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
    
    console.log('✅ Dashboard restored');
  }

  // Find all links with data-page attribute
  const pageLinks = document.querySelectorAll('[data-page]');
  console.log('🔎 Found', pageLinks.length, 'links with [data-page]');
  
  // Attach click handlers
  pageLinks.forEach(link => {
    const pageName = link.getAttribute('data-page');
    
    // Handle HR1 module pages
    if (pageRoutes.hasOwnProperty(pageName)) {
      console.log('  → Binding:', pageName);
      
      link.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('\n>>> CLICKED:', pageName);
        loadPage(pageName);
      });
    }
    
    // Handle Dashboard link
    if (pageName === 'dashboard') {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('\n>>> CLICKED: Dashboard');
        restoreDashboard();
      });
    }
  });

  console.log('✅ HR1 Navigation ready!');
  console.log('Available pages:', Object.keys(pageRoutes).join(', '));
})();