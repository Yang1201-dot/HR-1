// Careers Page JavaScript - Clean job loading and rendering only
document.addEventListener('DOMContentLoaded', () => {
  // ── Theme ──────────────────────────────────────────
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
  } else {
    body.classList.remove('dark-mode');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      body.classList.toggle('dark-mode');
      const isDark = body.classList.contains('dark-mode');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }

  // ── Global Variables ─────────────────────────────────────
  let JOBS = [];

  // ── Load jobs from API ────────────────────────────────────
  async function loadJobsFromAPI() {
    try {
      console.log('Loading jobs from API...');
      const response = await fetch('../api/simple-api-new.php?action=get_job_postings');
      const data = await response.json();
      console.log('Jobs API Response:', data);
      console.log('Data success:', data.success);
      console.log('Data jobs:', data.jobs);
      console.log('Data jobs type:', typeof data.jobs);
      console.log('Data jobs length:', data.jobs ? data.jobs.length : 'undefined');
      
      // Handle both response formats - direct array or wrapped in success object
      if (Array.isArray(data)) {
        // Direct array response
        JOBS = data;
        console.log('Loaded JOBS (direct array):', JOBS);
        renderJobs();
      } else if (data.success && data.jobs) {
        // Wrapped in success object
        JOBS = data.jobs;
        console.log('Loaded JOBS (success object):', JOBS);
        renderJobs();
      } else {
        console.error('Failed to load jobs:', data);
        renderJobs(); // Render empty state
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      renderJobs(); // Render empty state
    }
  }

  // ── Render Jobs ─────────────────────────────────────────────
  function renderJobs() {
    const container = document.getElementById('jobList');
    if (!container) return;
    
    if (!JOBS || JOBS.length === 0) {
      container.innerHTML = `
        <div class="no-jobs-msg">
          <div class="no-jobs-icon">💼</div>
          <h3>No Open Positions</h3>
          <p>Check back soon for new opportunities or follow our company page for updates.</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = JOBS.map(job => `
      <div class="job-card">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">
          <div>
            <h3 style="font-size:17px;margin-bottom:3px;">${esc(job.title)}</h3>
            <p style="font-size:13px;color:var(--text-secondary);">${esc(job.dept || job.department || 'General')} &bull; ${esc(job.location || 'Remote')}</p>
          </div>
          <span class="badge bd-active">Active</span>
        </div>
        <p style="font-size:13px;color:var(--text-secondary);line-height:1.7;margin-bottom:10px;">${esc(job.description || 'No description available.')}</p>
        <div class="meta-row">
          <span>${job.emptype || job.employment_type || 'Full-time'}</span>
          <button class="btn-primary apply-btn" data-role="${esc(job.title)}">Apply Now</button>
        </div>
      </div>
    `).join('');
    
    // Attach event listeners to newly created apply buttons
    attachApplyButtonListeners();
  }

  // ── Apply Button Event Listeners ─────────────────────────────
  function attachApplyButtonListeners() {
    const applyBtns = document.querySelectorAll('.apply-btn');
    if (applyBtns) {
      console.log('Found apply buttons:', applyBtns.length);
      applyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const role = btn.getAttribute('data-role') || 'Position';
          console.log('Apply button clicked, role:', role);
          
          // Find the job data from JOBS array
          const job = JOBS.find(j => j.title === role);
          
          // Use the modal module to open the modal
          if (window.CareersModal) {
            window.CareersModal.open(role, job);
          } else {
            console.error('CareersModal module not loaded');
          }
        });
      });
    } else {
      console.log('No apply buttons found');
    }
  }

  // ── FAQ Accordion ─────────────────────────────────────────--
  document.querySelectorAll('.faq-item .faq-question').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.faq-item').classList.toggle('open'));
  });

  // ── Lucide Icons ─────────────────────────────────────────--
  try {
    const lucide = window.lucide;
    if (lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
  } catch(err) {}

  // ── Initialize Everything ─────────────────────────────────----
  // Load jobs from API
  loadJobsFromAPI();
});

// ── Utility Functions ─────────────────────────────────────────
function esc(str) {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
