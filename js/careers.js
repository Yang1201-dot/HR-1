// Careers Page JavaScript - Simple job application system
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
    const container = document.getElementById('jobsList');
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
      <div class="job-card" data-job-id="${job.id}">
        <div class="job-header">
          <h3>${esc(job.title)}</h3>
          <div class="job-meta">
            <span class="job-dept">${esc(job.dept || job.department || 'General')}</span>
            <span class="job-type">${esc(job.emptype || job.employment_type || 'Full-time')}</span>
          </div>
        </div>
        <div class="job-body">
          <p>${esc(job.description || 'No description available.')}</p>
          <div class="job-details">
            ${job.location ? `<span class="job-detail">📍 ${esc(job.location)}</span>` : ''}
            ${job.salary_range ? `<span class="job-detail">💰 ${esc(job.salary_range)}</span>` : ''}
          </div>
        </div>
        <div class="job-footer">
          <button class="btn-primary apply-btn" data-role="${esc(job.title)}">
            Apply Now
          </button>
        </div>
      </div>
    `).join('');
    
    // Attach event listeners to newly created apply buttons
    attachApplyButtonListeners();
  }

  // ── Modal Functions ───────────────────────────────────────────
  function openApplyModal(jobTitle) {
    const modal = document.getElementById('applyModal');
    const form = document.getElementById('applyForm');
    const roleInput = document.getElementById('inputRole');
    
    if (!modal || !form) return;
    
    // Set the job title
    if (roleInput) roleInput.value = jobTitle;
    
    // Show modal
    modal.setAttribute('aria-hidden', 'false');
    
    // Focus first input
    const firstInput = form.querySelector('input[name="first_name"]');
    if (firstInput) firstInput.focus();
  }

  function closeModal() {
    const modal = document.getElementById('applyModal');
    if (modal) {
      modal.setAttribute('aria-hidden', 'true');
      
      // Reset form when closing
      const modalForm = document.getElementById('applyForm');
      const modalTitle = document.getElementById('modalTitle');
      const submitBtn = document.querySelector('#applyForm .btn-primary');
      
      if (modalForm) {
        modalForm.reset();
        // Reset file picker displays
        document.querySelectorAll('.file-picker .file-name').forEach(s => { s.textContent = 'No file chosen'; });
        document.querySelectorAll('.file-picker .file-clear').forEach(b => { b.style.display = 'none'; });
        
        // Restore required attributes for file inputs
        const resumeInput = modalForm.querySelector('input[name="resume"]');
        const birthInput = modalForm.querySelector('input[name="birth_certificate"]');
        const diplomaInput = modalForm.querySelector('input[name="diploma"]');
        const firstNameInput = modalForm.querySelector('input[name="first_name"]');
        const lastNameInput = modalForm.querySelector('input[name="last_name"]');
        const emailInput = modalForm.querySelector('input[name="email"]');
        const phoneInput = modalForm.querySelector('input[name="phone"]');
        
        if (resumeInput) resumeInput.setAttribute('required', '');
        if (birthInput) birthInput.setAttribute('required', '');
        if (diplomaInput) diplomaInput.setAttribute('required', '');
        if (firstNameInput) firstNameInput.setAttribute('required', '');
        if (lastNameInput) lastNameInput.setAttribute('required', '');
        if (emailInput) emailInput.setAttribute('required', '');
        if (phoneInput) phoneInput.setAttribute('required', '');
      }
      
      // Reset modal title and submit button text
      if (modalTitle) modalTitle.textContent = 'Apply for Role';
      if (submitBtn) submitBtn.textContent = 'Submit Application';
      
      // Clear form result
      const formResult = document.getElementById('formResult');
      if (formResult) formResult.textContent = '';
    }
  }

  // ── Form Submit ───────────────────────────────────────────
  let isSubmitting = false;
  
  const applyForm = document.getElementById('applyForm');
  const formResult = document.getElementById('formResult');
  
  if (applyForm) {
    console.log('Apply form found, adding submit listener');
    applyForm.addEventListener('submit', (e) => {
      console.log('Form submit event triggered!');
      e.preventDefault();
      
      // Prevent duplicate submissions
      if (isSubmitting) {
        console.log('Already submitting - ignoring duplicate submission');
        return;
      }
      
      isSubmitting = true;
      
      // Check text fields
      const requiredTextFields = ['first_name', 'last_name', 'email', 'phone'];
      const missingTextFields = [];
      
      requiredTextFields.forEach(fieldName => {
        const field = applyForm.querySelector(`input[name="${fieldName}"]`);
        console.log(`Field ${fieldName}:`, field ? field.value : 'not found');
        if (field && (!field.value.trim() || field.value.trim() === '')) {
          const fieldLabel = fieldName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
          missingTextFields.push(fieldLabel);
        }
      });

      if (missingTextFields.length > 0) {
        formResult.textContent = `⚠️ Please fill in required fields: ${missingTextFields.join(', ')}. These fields are required to process your application.`;
        formResult.style.color = '#ff6b6b';
        console.log('Validation failed - missing fields');
        isSubmitting = false;
        return;
      }
      
      // Check required files
      const requiredFiles = [
        { field: 'resume', name: 'Resume/CV' },
        { field: 'birth_certificate', name: 'Birth Certificate' },
        { field: 'diploma', name: 'Diploma/TOR' }
      ];

      const missingFiles = [];
      const invalidFiles = [];
      
      requiredFiles.forEach(fileInfo => {
        const fileInput = applyForm.querySelector(`input[name="${fileInfo.field}"]`);
        console.log(`Looking for file input with name: ${fileInfo.field}, found:`, fileInput);
        if (fileInput && fileInput.files && fileInput.files[0]) {
          const f = fileInput.files[0];
          
          // Check file size
          if (f.size > 2 * 1024 * 1024) {
            const fileSizeMB = (f.size / (1024 * 1024)).toFixed(2);
            invalidFiles.push(`${f.name} is too large (${fileSizeMB} MB)`);
          }
          
          // Check file type
          const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/png',
            'image/jpg'
          ];
          
          if (!allowedTypes.includes(f.type) && f.type !== '') {
            invalidFiles.push(`${f.name} has unsupported file type`);
          }
        } else {
          missingFiles.push(fileInfo.name);
        }
      });

      if (missingFiles.length > 0) {
        formResult.textContent = `⚠️ Please upload all required files: ${missingFiles.join(', ')}. These documents are required to process your application.`;
        formResult.style.color = '#ff6b6b';
        console.log('Validation failed - missing files');
        isSubmitting = false;
        return;
      }
      
      if (invalidFiles.length > 0) {
        formResult.textContent = `⚠️ Please fix these file issues: ${invalidFiles.join(', ')}. Maximum file size is 2MB. Allowed types: PDF, Word, Excel, JPEG, PNG.`;
        formResult.style.color = '#ff6b6b';
        console.log('Validation failed - invalid files');
        isSubmitting = false;
        return;
      }
      
      console.log('Validation passed - proceeding with submission');
      
      // Submit the form
      submitApplication();
      
    });
  } else {
    console.error('Apply form not found!');
  }

  // ── Submit Application Function ───────────────────────────────────
  function submitApplication() {
    console.log('submitApplication function called');
    const form = document.getElementById('applyForm');
    const formData = new FormData(form);
    
    // Get selected job from hidden input
    const jobInput = document.getElementById('inputRole');
    const selectedJob = JOBS.find(job => job.title === jobInput.value);
    
    if (!selectedJob) {
      alert('Please select a job position before applying.');
      isSubmitting = false;
      return;
    }
    
    // Add job posting ID to form data
    formData.append('job_posting_id', selectedJob.id);
    formData.append('position', selectedJob.title);
    formData.append('department', selectedJob.department);
    formData.append('location', selectedJob.location);
    formData.append('employment_type', selectedJob.employment_type);
    formData.append('salary', selectedJob.salary_range);
    formData.append('description', selectedJob.description);

    fetch('../api/simple-save-application.php', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Full response data:', data);
      console.log('Response ID:', data.id);
      console.log('Response type:', typeof data);
      
      // Check if response contains an error
      if (data.error) {
        console.error('Application submission error:', data.error);
        const formResult = document.getElementById('formResult');
        if (formResult) {
          // Show specific error message based on error type
          let errorMessage = '❌ Error submitting application. Please try again.';
          if (data.error.includes('Duplicate entry') && data.error.includes('email')) {
            errorMessage = '❌ This email address has already been used for an application. Please use a different email address.';
          } else if (data.error.includes('SQLSTATE')) {
            errorMessage = '❌ Database error occurred. Please try again or contact support.';
          }
          formResult.innerHTML = `<div class="error-message">${errorMessage}</div>`;
          formResult.style.color = '#dc3545';
        }
        isSubmitting = false;
      } else {
        // Success
        console.log('Application saved to database with ID:', data.id);
        const formResult = document.getElementById('formResult');
        if (formResult) {
          formResult.innerHTML = '<div class="success-message">✅ Application submitted successfully! We will review your application and contact you soon.</div>';
          formResult.style.color = '#28a745';
        }
        
        // Close modal after a short delay
        setTimeout(() => {
          closeModal();
          isSubmitting = false;
        }, 2000);
      }
    })
    .catch(error => {
      console.error('Error submitting application:', error);
      const formResult = document.getElementById('formResult');
      if (formResult) {
        formResult.innerHTML = '<div class="error-message">❌ Error submitting application. Please try again.</div>';
        formResult.style.color = '#dc3545';
      }
      isSubmitting = false;
    });
  }

  // ── File Picker Functions ─────────────────────────────────────
  function initializeFilePickers() {
    document.querySelectorAll('.file-picker').forEach(picker => {
      const input = picker.querySelector('input[type="file"], .real-file');
      const display = picker.querySelector('.file-name');
      const clearBtn = picker.querySelector('.file-clear');
      
      if (!input || !display) return;
      
      // Add click events to both button and display to trigger file input
      display.addEventListener('click', () => {
        if (input) input.click();
      });
      
      input.addEventListener('change', () => {
        const file = input.files && input.files[0];
        if (file) {
          display.textContent = file.name;
          if (clearBtn) clearBtn.style.display = 'inline-block';
        } else {
          display.textContent = 'No file chosen';
          if (clearBtn) clearBtn.style.display = 'none';
        }
      });

      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          input.value = '';
          display.textContent = 'No file chosen';
          clearBtn.style.display = 'none';
        });
      }
    });
  }

  // ── Modal Event Listeners ───────────────────────────────────
  const modalClose = document.getElementById('modalClose');
  const cancelBtn = document.getElementById('cancelBtn');
  
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // ── Phone Validation ─────────────────────────────────────
  const phoneInput = applyForm ? applyForm.querySelector('input[name="phone"]') : null;
  const phoneWarning = applyForm ? applyForm.querySelector('.phone-warning') : null;
  
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      const raw = phoneInput.value;
      const digits = raw.replace(/\D/g, '').slice(0, 11);
      if (phoneInput.value !== digits) phoneInput.value = digits;
      if (phoneWarning) phoneWarning.textContent = /[A-Za-z]/.test(raw) ? 'Only numbers allowed.' : '';
    });
  }

  // ── FAQ Accordion ───────────────────────────────────────────
  document.querySelectorAll('.faq-item .faq-question').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.faq-item').classList.toggle('open'));
  });

  // ── Lucide Icons ───────────────────────────────────────────
  try {
    const lucide = window.lucide;
    if (lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
  } catch(err) {}

  // ── Initialize Everything ─────────────────────────────────────
  // Load jobs from API
  loadJobsFromAPI();
  
  // Initialize file pickers
  initializeFilePickers();
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
}
