// HR1 Module Navigation - iframe + parent overlay for modals
(function setupHR1Navigation() {
  var contentWrapper = document.querySelector('.content-wrapper');
  if (!contentWrapper) { console.error('Content wrapper not found!'); return; }

  var originalContent = contentWrapper.innerHTML;
  var pageRoutes = {
    dashboard: 'dashboard.html',
    recruitment: 'recruitment.html',
    'app-mgmt': 'application-management.html',
    onboard: 'onboarding.html',
    evaluation: 'performance-evaluation.html',
    'social-rec': 'social-recognition.html'
  };

  // ── INJECT PARENT OVERLAY ────────────────────────────────────────
  // One full-screen overlay in the parent page (above sidebar/header/iframe)
  var overlay = document.createElement('div');
  overlay.id = 'hr1-overlay';
  overlay.style.cssText = 'display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.55);backdrop-filter:blur(3px);align-items:flex-start;justify-content:center;overflow-y:auto;padding:4vh 1rem 2rem;';
  document.body.appendChild(overlay);

  // Styles for the cloned modal inside the parent overlay
  // These mirror the recruitment.html modal styles so it looks identical
  var mStyle = document.createElement('style');
  mStyle.id = 'hr1-modal-css';
  mStyle.textContent = `
    @keyframes hr1In{from{opacity:0;transform:translateY(-18px)}to{opacity:1;transform:translateY(0)}}
    @keyframes hr1Toast{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}
    #hr1-overlay .modal-box{
      background:var(--surface,#fff);border:1px solid var(--border-color,#e5e7eb);
      border-radius:16px;padding:28px;width:100%;max-width:620px;margin:0 auto;
      position:relative;animation:hr1In .25s ease;
      box-shadow:0 24px 60px rgba(0,0,0,.18);
      font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
      color:var(--text-primary,#111827);
    }
    .dark-mode #hr1-overlay .modal-box{background:var(--surface,#1a1a1a);border-color:var(--border-color,#2d2d2d);}
    #hr1-overlay .modal-box h2{font-size:20px;font-weight:700;color:var(--text-primary,#111827);margin:0 0 20px;padding-bottom:14px;border-bottom:1px solid var(--border-color,#e5e7eb);padding-right:2.5rem;}
    #hr1-overlay .modal-close{position:absolute;top:20px;right:20px;background:none;border:none;font-size:22px;cursor:pointer;color:var(--text-secondary,#6b7280);line-height:1;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:8px;transition:all .2s;}
    #hr1-overlay .modal-close:hover{background:rgba(239,68,68,.1);color:#ef4444;}
    #hr1-overlay .form-group{margin-bottom:16px;}
    #hr1-overlay .form-group label{display:block;margin-bottom:6px;font-size:13px;font-weight:600;color:var(--text-primary,#111827);}
    #hr1-overlay .form-group input,
    #hr1-overlay .form-group select,
    #hr1-overlay .form-group textarea{
      width:100%;padding:10px 14px;border:1px solid var(--border-color,#e5e7eb);border-radius:10px;
      background:var(--background,#f8f9fa);color:var(--text-primary,#111827);font-size:14px;
      box-sizing:border-box;font-family:inherit;transition:border .2s;
    }
    #hr1-overlay .form-group input:focus,
    #hr1-overlay .form-group select:focus,
    #hr1-overlay .form-group textarea:focus{outline:none;border-color:#2ca078;}
    #hr1-overlay .form-group textarea{min-height:90px;resize:vertical;}
    #hr1-overlay .form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
    #hr1-overlay .req{color:#ef4444;}
    #hr1-overlay .btn-submit{width:100%;padding:12px;background:#2ca078;color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;margin-top:8px;font-family:inherit;transition:background .2s;}
    #hr1-overlay .btn-submit:hover{background:#4fb97a;}
    #hr1-overlay .btn-cancel-modal{width:100%;padding:10px;background:transparent;color:var(--text-secondary,#6b7280);border:1px solid var(--border-color,#e5e7eb);border-radius:10px;font-weight:600;cursor:pointer;margin-top:8px;font-family:inherit;transition:all .2s;}
    #hr1-overlay .btn-cancel-modal:hover{background:var(--surface-hover,#f5f5f5);}
    #hr1-overlay .det-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;}
    #hr1-overlay .det-item label{font-size:11px;color:var(--text-tertiary,#9ca3af);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:2px;}
    #hr1-overlay .det-item span{font-size:14px;font-weight:500;}
    #hr1-overlay .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;}
    #hr1-overlay .bd-active,.hr1-overlay .bd-hired{background:rgba(44,160,120,.12);color:#2ca078;}
    #hr1-overlay .bd-draft{background:rgba(107,114,128,.12);color:#6b7280;}
    #hr1-overlay .bd-new{background:rgba(59,130,246,.12);color:#3b82f6;}
    #hr1-overlay .bd-review{background:rgba(245,158,11,.12);color:#d97706;}
    #hr1-overlay .bd-shortlisted{background:rgba(139,92,246,.12);color:#8b5cf6;}
    #hr1-overlay .bd-rejected{background:rgba(239,68,68,.12);color:#ef4444;}
    #hr1-overlay .app-row{background:var(--background,#f8f9fa);border:1px solid var(--border-color,#e5e7eb);border-radius:10px;padding:12px 16px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;}
    #hr1-overlay .app-name{font-size:14px;font-weight:600;}
    #hr1-overlay .app-meta{font-size:12px;color:var(--text-secondary,#6b7280);}
    #hr1-overlay .app-ctrls{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}
    #hr1-overlay .status-sel{padding:4px 8px;border-radius:7px;font-size:12px;border:1px solid var(--border-color,#e5e7eb);background:var(--surface,#fff);color:var(--text-primary,#111827);cursor:pointer;}
    #hr1-overlay .btn-primary{padding:7px 14px;background:#2ca078;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;}
    .hr1-toast{position:fixed;bottom:2rem;right:2rem;padding:1rem 1.5rem;border-radius:10px;color:#fff;font-weight:600;z-index:9999999;max-width:360px;box-shadow:0 4px 20px rgba(0,0,0,.3);animation:hr1Toast .3s ease;font-family:-apple-system,sans-serif;font-size:14px;}
  `;
  document.head.appendChild(mStyle);

  // Close overlay on backdrop click
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeOverlay();
  });

  function openOverlay(iframeEl, modalId) {
    // Clone the modal from the iframe's DOM
    try {
      var iDoc = iframeEl.contentWindow.document;
      var modal = iDoc.getElementById(modalId);
      if (!modal) return;
      var box = modal.querySelector('.modal-box');
      if (!box) return;

      // Deep clone
      var clone = box.cloneNode(true);

      // Rewire buttons: close buttons → close overlay, action buttons → exec in iframe
      clone.querySelectorAll('.modal-close, .btn-cancel-modal').forEach(function(btn) {
        btn.onclick = null;
        btn.addEventListener('click', closeOverlay);
      });

      clone.querySelectorAll('.btn-submit').forEach(function(btn) {
        var origOnclick = btn.getAttribute('onclick');
        btn.removeAttribute('onclick');
        btn.addEventListener('click', function() {
          // Sync form values from parent clone back to iframe
          clone.querySelectorAll('input,select,textarea').forEach(function(el) {
            if (!el.id) return;
            var iEl = iDoc.getElementById(el.id);
            if (iEl) iEl.value = el.value;
          });
          // Execute original function in iframe
          if (origOnclick) {
            try { iframeEl.contentWindow.eval(origOnclick); } catch(err) { console.warn('exec err', err); }
          }
        });
      });

      overlay.innerHTML = '';
      overlay.appendChild(clone);
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';

      // If this is the interview modal, populate the applicant dropdown
      if (modalId === 'r_modal_interview') {
        var drop = clone.querySelector('#r_interview_applicant');
        if (drop) {
          drop.innerHTML = '<option value="">Loading applicants...</option>';
          drop.disabled = true;
          fetch('../api/simple-api-new.php?action=get_applications')
            .then(function(res) { return res.json(); })
            .then(function(data) {
              drop.innerHTML = '<option value="">Select an applicant...</option>';
              if (Array.isArray(data) && data.length > 0) {
                data.forEach(function(a) {
                  var name = ((a.first_name||'') + ' ' + (a.last_name||'')).trim();
                  var pos = a.position || '';
                  var st  = a.status   || '';
                  var opt = document.createElement('option');
                  opt.value = a.id;
                  opt.textContent = name + (pos?' - '+pos:'') + (st?' ('+st+')':'');
                  drop.appendChild(opt);
                });
              } else {
                drop.innerHTML = '<option value="">No applicants found</option>';
              }
              drop.disabled = false;
            })
            .catch(function() {
              drop.innerHTML = '<option value="">Error loading applicants</option>';
              drop.disabled = false;
            });
        }
      }

    } catch(err) {
      console.warn('overlay error:', err);
    }
  }

  function closeOverlay() {
    overlay.style.display = 'none';
    overlay.innerHTML = '';
    document.body.style.overflow = '';
    // Tell iframe to also close its inline modal (in case it opened one)
    var iframe = contentWrapper.querySelector('iframe.hr-iframe');
    if (iframe) {
      try { iframe.contentWindow.postMessage({ type: 'HR1_CLOSE_LOCAL' }, '*'); } catch(e) {}
    }
  }

  function showToast(msg, style) {
    var t = document.createElement('div');
    t.className = 'hr1-toast';
    t.style.background = style === 'error' ? '#ef4444' : '#2ca078';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function() { if (t.parentNode) t.remove(); }, 3500);
  }

  // ── LISTEN TO IFRAME ─────────────────────────────────────────────
  window.addEventListener('message', function(e) {
    if (!e.data || !e.data.type) return;
    var iframe = contentWrapper.querySelector('iframe.hr-iframe');

    if (e.data.type === 'HR1_OPEN_MODAL' && iframe && e.data.modalId) {
      openOverlay(iframe, e.data.modalId);
    }
    if (e.data.type === 'HR1_CLOSE_MODAL') {
      closeOverlay();
    }
    if (e.data.type === 'HR1_TOAST') {
      showToast(e.data.msg, e.data.style);
    }
    if (e.data.type === 'HR1_SHOW_MODAL' && e.data.modalHtml) {
      // Handle custom modal HTML from iframe
      var existingModal = document.getElementById(e.data.modalId);
      if (existingModal) {
        existingModal.remove();
      }
      document.body.insertAdjacentHTML('beforeend', e.data.modalHtml);
    }
  });

  // ── THEME SYNC ───────────────────────────────────────────────────
  function syncTheme() {
    var isDark = document.body.classList.contains('dark-mode');
    var iframe = contentWrapper.querySelector('iframe.hr-iframe');
    if (iframe) { try { iframe.contentWindow.postMessage({ type: 'THEME', dark: isDark }, '*'); } catch(e) {} }
  }
  var themeBtn = document.getElementById('themeToggle');
  if (themeBtn) { themeBtn.addEventListener('click', function() { setTimeout(syncTheme, 60); }); }

  // ── ACTIVE MENU ──────────────────────────────────────────────────
  function setActive(pg) {
    document.querySelectorAll('.nav-item,.submenu-item').forEach(function(l) { l.classList.remove('active'); });
    var link = document.querySelector('[data-page="' + pg + '"]');
    if (link) {
      link.classList.add('active');
      var p = document.querySelector('.nav-item.has-submenu[data-module="hr"]');
      if (p) p.classList.add('active');
      var s = document.getElementById('submenu-hr');
      if (s) s.classList.add('active');
    }
  }

  // ── LOAD PAGE ────────────────────────────────────────────────────
  function loadPage(pg, pushState = true) {
    closeOverlay();
    var path = pageRoutes[pg];
    if (!path) return;

    // Update browser URL
    if (pushState) {
      var newUrl = window.location.pathname.replace(/\/[^\/]*$/, '/' + path);
      history.pushState({page: pg}, '', newUrl);
    }

    // Remove content-wrapper padding so iframe is edge-to-edge (no black border)
    contentWrapper.style.padding = '0';

    var iframe = document.createElement('iframe');
    iframe.className = 'hr-iframe';
    iframe.src = path + '?v=' + Date.now();
    iframe.scrolling = 'no';
    iframe.style.cssText = 'width:100%;border:none;display:block;min-height:600px;';

    iframe.onload = function() {
      syncTheme();
      autoSize();
      try {
        // Keep resizing as content changes (tabs, new items, etc.)
        var obs = new iframe.contentWindow.MutationObserver(autoSize);
        obs.observe(iframe.contentWindow.document.body, { childList:true, subtree:true, attributes:true, characterData:true });
      } catch(e) {}
    };

    function autoSize() {
      try {
        var h = iframe.contentWindow.document.documentElement.scrollHeight;
        iframe.style.height = Math.max(h + 4, 600) + 'px';
      } catch(e) { iframe.style.height = '800px'; }
    }

    contentWrapper.innerHTML = '';
    contentWrapper.appendChild(iframe);
    setActive(pg);
  }

  // ── RESTORE DASHBOARD ────────────────────────────────────────────
  function restoreDashboard() {
    closeOverlay();
    contentWrapper.style.padding = '';
    contentWrapper.innerHTML = originalContent;
    document.querySelectorAll('.nav-item,.submenu-item').forEach(function(l) { l.classList.remove('active'); });
    var d = document.querySelector('.nav-item[data-page="dashboard"]');
    if (d) d.classList.add('active');
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    // Update URL to dashboard
    history.pushState({page: 'dashboard'}, '', window.location.pathname.replace(/\/[^\/]*$/, '/dashboard.html'));
  }

  // ── URL-BASED ROUTING ─────────────────────────────────────────────
  function routeFromUrl() {
    var path = window.location.pathname;
    var fileName = path.split('/').pop();
    var urlParams = new URLSearchParams(window.location.search);
    var moduleParam = urlParams.get('module');
    
    // Check if we have a module parameter (from standalone redirect)
    if (moduleParam) {
      // Convert module parameter to page key
      var pageKey = null;
      if (moduleParam === 'recruitment') pageKey = 'recruitment';
      else if (moduleParam === 'application-management') pageKey = 'app-mgmt';
      else if (moduleParam === 'onboarding') pageKey = 'onboard';
      else if (moduleParam === 'performance-evaluation') pageKey = 'evaluation';
      else if (moduleParam === 'social-recognition') pageKey = 'social-rec';
      else if (moduleParam === 'hr-manager-transfer-dashboard') pageKey = 'transfer-mgmt';
      
      if (pageKey) {
        loadPage(pageKey, false); // Don't push state since we're already at this URL
        // Clean up the URL
        history.replaceState({page: pageKey}, '', window.location.pathname.replace(/\/[^\/]*$/, '/' + pageRoutes[pageKey]));
        return;
      }
    }
    
    // Find the page key from the filename (original logic)
    var pageKey = null;
    for (var key in pageRoutes) {
      if (pageRoutes[key] === fileName) {
        pageKey = key;
        break;
      }
    }
    
    if (pageKey) {
      loadPage(pageKey, false); // Don't push state since we're already at this URL
    } else if (fileName === 'dashboard.html') {
      restoreDashboard();
    }
  }

  // ── HANDLE BROWSER BACK/FORWARD ───────────────────────────────────
  window.addEventListener('popstate', function(e) {
    if (e.state && e.state.page) {
      if (e.state.page === 'dashboard') {
        restoreDashboard();
      } else {
        loadPage(e.state.page, false); // Don't push state on popstate
      }
    } else {
      routeFromUrl();
    }
  });

  // ── BIND NAV ─────────────────────────────────────────────────────
  document.querySelectorAll('[data-page]').forEach(function(link) {
    var pg = link.getAttribute('data-page');
    if (pageRoutes.hasOwnProperty(pg)) {
      link.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); loadPage(pg); });
    }
    if (pg === 'dashboard') {
      link.addEventListener('click', function(e) { e.preventDefault(); restoreDashboard(); });
    }
  });

  // ── INITIALIZE ROUTING ON PAGE LOAD ─────────────────────────────────
  // Check URL on initial load and route accordingly
  // FIXED: Only route if we're not already on a plain dashboard
  setTimeout(function() {
    var path = window.location.pathname;
    var fileName = path.split('/').pop();
    var urlParams = new URLSearchParams(window.location.search);
    var hasModuleParam = urlParams.has('module');
    
    // Only route if:
    // 1. We have a module parameter (came from standalone page)
    // 2. OR the filename is NOT dashboard.html (we're on a different page)
    if (hasModuleParam || (fileName !== 'dashboard.html' && fileName !== '')) {
      routeFromUrl();
    }
    // If we're on dashboard.html with no params, do nothing - we're already showing the dashboard
  }, 100);

  console.log('HR1 Navigation ready!');
})();