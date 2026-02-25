document.addEventListener('DOMContentLoaded', () => {
  // ── Theme ──────────────────────────────────────────────────
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

  // ── Check applied jobs and update UI ─────────────────────────────────
  function updateJobButtons() {
    let appliedJobs = [];
    try { 
      appliedJobs = JSON.parse(localStorage.getItem('careers_applications') || '[]'); 
    } catch(err) {}
    
    const appliedJobTitles = appliedJobs.map(app => app.position.toLowerCase());
    
    document.querySelectorAll('.job').forEach(jobElement => {
      const applyBtn = jobElement.querySelector('.apply-btn');
      const jobTitle = jobElement.querySelector('h3').textContent.toLowerCase();
      
      if (applyBtn) {
        if (appliedJobTitles.includes(jobTitle)) {
          // Job already applied - change to Applied state
          applyBtn.textContent = 'Applied';
          applyBtn.classList.add('applied-btn');
          applyBtn.disabled = true;
          applyBtn.removeAttribute('data-role');
          
          // Check if Edit/Delete buttons already exist
          let buttonContainer = jobElement.querySelector('.job-actions');
          if (!buttonContainer) {
            // Add Edit and Delete buttons only if they don't exist
            buttonContainer = document.createElement('div');
            buttonContainer.className = 'job-actions';
            buttonContainer.innerHTML = `
              <button class="edit-btn" data-job="${jobTitle}">Edit</button>
              <button class="delete-btn" data-job="${jobTitle}">Delete</button>
            `;
            applyBtn.parentNode.appendChild(buttonContainer);
            
            // Add event listeners for Edit and Delete buttons
            buttonContainer.querySelector('.edit-btn').addEventListener('click', () => editApplication(jobTitle));
            buttonContainer.querySelector('.delete-btn').addEventListener('click', () => deleteApplication(jobTitle));
          }
        } else {
          // Job not applied - keep Apply Now button
          applyBtn.textContent = 'Apply Now';
          applyBtn.classList.remove('applied-btn');
          applyBtn.disabled = false;
          
          // Remove Edit/Delete buttons if they exist
          const buttonContainer = jobElement.querySelector('.job-actions');
          if (buttonContainer) {
            buttonContainer.remove();
          }
        }
      }
    });
  }

  function editApplication(jobTitle) {
    // Find most recent application for this job
    let applications = [];
    try { 
      applications = JSON.parse(localStorage.getItem('careers_applications') || '[]'); 
    } catch(err) {}
    
    // Find most recent application for this job
    const jobApplications = applications.filter(app => app.position.toLowerCase() === jobTitle);
    const application = jobApplications[jobApplications.length - 1];
    
    if (application) {
      // Open modal with existing application data
      const modal = document.getElementById('applyModal');
      const modalTitle = document.getElementById('modalTitle');
      const inputRole = document.getElementById('inputRole');
      const formResult = document.getElementById('formResult');
      const submitBtn = document.querySelector('#applyForm .btn-primary');
      
      if (modalTitle) modalTitle.textContent = 'Edit Application for ' + application.position;
      if (inputRole) inputRole.value = application.position;
      if (modal) modal.setAttribute('aria-hidden', 'false');
      if (formResult) formResult.textContent = '';
      if (submitBtn) submitBtn.textContent = 'Update Application';
      
      // Remove required attribute from file inputs when editing
      applyForm.querySelectorAll('input[type="file"]').forEach(input => {
        input.removeAttribute('required');
      });
      
      // Fill form with existing data
      const form = document.getElementById('applyForm');
      if (form) {
        form.querySelector('input[name="first_name"]').value = application.fname || '';
        form.querySelector('input[name="middle_name"]').value = application.mname || '';
        form.querySelector('input[name="last_name"]').value = application.lname || '';
        form.querySelector('input[name="email"]').value = application.email || '';
        form.querySelector('input[name="phone"]').value = application.phone || '';
        form.querySelector('textarea[name="message"]').value = application.message || '';
      }
      
      // Load previously uploaded files
      loadApplicationFiles(application.id);
    }
  }

  function loadApplicationFiles(applicationId) {
    let filesMeta = {};
    try { 
      filesMeta = JSON.parse(localStorage.getItem('careers_files') || '{}'); 
    } catch(err) {}
    
    const appFiles = filesMeta[applicationId] || {};
    
    // Update file pickers with existing files
    const fileMappings = [
      { field: 'resume', key: 'resume' },
      { field: 'birth_certificate', key: 'birth' },
      { field: 'diploma', key: 'diploma' },
      { field: 'cover_letter', key: 'cover' }
    ];
    
    fileMappings.forEach(m => {
      const fileData = appFiles[m.key];
      if (fileData) {
        const picker = document.querySelector(`input[name="${m.field}"]`)?.closest('.file-picker');
        if (picker) {
          const nameSpan = picker.querySelector('.file-name');
          const clearBtn = picker.querySelector('.file-clear');
          
          if (nameSpan) {
            nameSpan.textContent = fileData.fileName;
            nameSpan.style.color = 'var(--text-primary)';
          }
          
          if (clearBtn) {
            clearBtn.style.display = 'inline-block';
          }
        }
      }
    });
  }

  function deleteApplication(jobTitle) {
    // Check current theme
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    // Create custom confirmation modal with theme matching
    const modalHtml = `
      <div id="deleteConfirmModal" class="delete-confirm-modal" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
      ">
        <div class="delete-confirm-content" style="
          background: ${isDarkMode ? '#2d3748' : 'white'};
          color: ${isDarkMode ? '#e2e8f0' : '#333'};
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          max-width: 400px;
          width: 90%;
          text-align: center;
          border: 1px solid ${isDarkMode ? '#4a5568' : '#e2e8f0'};
        ">
          <h3 style="margin: 0 0 20px 0; color: ${isDarkMode ? '#f7fafc' : '#333'};">Confirm Delete</h3>
          <p style="margin: 0 0 30px 0; color: ${isDarkMode ? '#cbd5e0' : '#666'}; line-height: 1.5;">Are you sure you want to delete this application?</p>
          <div style="text-align: right;">
            <button id="deleteNoBtn" style="
              background: ${isDarkMode ? '#4a5568' : '#6c757d'};
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 4px;
              margin-right: 10px;
              cursor: pointer;
              font-size: 14px;
              transition: background-color 0.2s;
            " onmouseover="this.style.background='${isDarkMode ? '#718096' : '#5a6268'}'" onmouseout="this.style.background='${isDarkMode ? '#4a5568' : '#6c757d'}'">No</button>
            <button id="deleteYesBtn" style="
              background: ${isDarkMode ? '#e53e3e' : '#dc3545'};
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
              transition: background-color 0.2s;
            " onmouseover="this.style.background='${isDarkMode ? '#c53030' : '#c82333'}'" onmouseout="this.style.background='${isDarkMode ? '#e53e3e' : '#dc3545'}'">Yes</button>
          </div>
        </div>
      </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Get modal elements
    const modal = document.getElementById('deleteConfirmModal');
    const yesBtn = document.getElementById('deleteYesBtn');
    const noBtn = document.getElementById('deleteNoBtn');
    
    // Handle No button
    noBtn.addEventListener('click', () => {
      modal.remove();
    });
    
    // Handle Yes button
    yesBtn.addEventListener('click', () => {
      modal.remove();
      performDelete(jobTitle);
    });
    
    // Handle clicking outside modal
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  function performDelete(jobTitle) {
    let applications = [];
    try { 
      applications = JSON.parse(localStorage.getItem('careers_applications') || '[]'); 
    } catch(err) {}
    
    // Find application to delete to get its ID
    const applicationToDelete = applications.find(app => app.position.toLowerCase() === jobTitle);
    
    if (applicationToDelete) {
      // Remove application
      applications = applications.filter(app => app.position.toLowerCase() !== jobTitle);
      localStorage.setItem('careers_applications', JSON.stringify(applications));
      
      // Remove associated files from localStorage
      let filesMeta = {};
      try { 
        filesMeta = JSON.parse(localStorage.getItem('careers_files') || '{}'); 
      } catch(err) {}
      
      if (filesMeta[applicationToDelete.id]) {
        delete filesMeta[applicationToDelete.id];
        localStorage.setItem('careers_files', JSON.stringify(filesMeta));
        console.log('Deleted application files for:', applicationToDelete.id);
      }
      
      // Update job counts
      try {
        let jobs = JSON.parse(localStorage.getItem('careers_job_postings') || '[]');
        jobs = jobs.map(j => {
          if (j.title.toLowerCase() === jobTitle) {
            j.apps = Math.max(0, (j.apps || 0) - 1);
          }
          return j;
        });
        localStorage.setItem('careers_job_postings', JSON.stringify(jobs));
      } catch(err) {}
    }
    
    // Refresh the page to update UI
    location.reload();
  }

  // Initial update of job buttons
  updateJobButtons();

  // ── Apply buttons (set by dynamic job loader in index.html) ───────────────
  const applyBtns = document.querySelectorAll('.apply-btn');
  const modal     = document.getElementById('applyModal');
  const modalClose = document.getElementById('modalClose');
  const cancelBtn  = document.getElementById('cancelBtn');
  const modalTitle = document.getElementById('modalTitle');
  const inputRole = document.getElementById('inputRole');
  const applyForm = document.getElementById('applyForm');
  const formResult = document.getElementById('formResult');
  const startApplyBtn = document.getElementById('startApplyBtn');

  applyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.getAttribute('data-role') || 'Position';
      if (modalTitle) modalTitle.textContent = `Apply for ${role}`;
      if (inputRole) inputRole.value = role;
      if (modal) modal.setAttribute('aria-hidden', 'false');
      if (formResult) formResult.textContent = '';
    });
  });

  if (startApplyBtn) {
    startApplyBtn.addEventListener('click', () => {
      const jobs = document.getElementById('jobs');
      if (jobs) jobs.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // ── Custom file pickers ───────────────────────────────────────────
  function initializeFilePickers() {
    document.querySelectorAll('.file-picker').forEach(picker => {
      // Skip if already initialized
      if (picker.dataset.initialized === 'true') return;
      picker.dataset.initialized = 'true';

      const input    = picker.querySelector('.real-file');
      const btn      = picker.querySelector('.file-btn');
      const nameSpan = picker.querySelector('.file-name');
      const clearBtn = picker.querySelector('.file-clear');
      if (!input || !btn || !nameSpan) return;

      input.style.position = 'absolute';
      input.style.left = '-9999px';

      // Remove any existing event listeners by cloning the button
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      newBtn.addEventListener('click', () => input.click());

      // Clone clear button and get reference to the new one
      let newClearBtn = null;
      if (clearBtn) {
        newClearBtn = clearBtn.cloneNode(true);
        clearBtn.parentNode.replaceChild(newClearBtn, clearBtn);
      }

      input.addEventListener('change', () => {
        const f = input.files && input.files[0];
        if (f) {
          nameSpan.textContent = f.name;
          if (newClearBtn) newClearBtn.style.display = 'inline-block';
        } else {
          nameSpan.textContent = 'No file chosen';
          if (newClearBtn) newClearBtn.style.display = 'none';
        }
      });

      if (newClearBtn) {
        
        newClearBtn.addEventListener('click', () => {
          input.value = '';
          nameSpan.textContent = 'No file chosen';
          newClearBtn.style.display = 'none';
          
          // If we're editing an application, also clear the stored file data
          const modalTitle = document.getElementById('modalTitle');
          const isEditing = modalTitle && modalTitle.textContent.includes('Edit Application');
          if (isEditing) {
            const inputRole = document.getElementById('inputRole');
            const role = inputRole ? inputRole.value : '';
            
            // Find the current application and clear its file data
            let applications = [];
            try { 
              applications = JSON.parse(localStorage.getItem('careers_applications') || '[]'); 
            } catch(err) {}
            
            const jobApplications = applications.filter(app => app.position.toLowerCase() === role.toLowerCase());
            const application = jobApplications[jobApplications.length - 1];
            
            if (application) {
              let filesMeta = {};
              try { 
                filesMeta = JSON.parse(localStorage.getItem('careers_files') || '{}'); 
              } catch(err) {}
              
              // Clear the specific file for this application
              if (filesMeta[application.id]) {
                const fieldName = input.getAttribute('name');
                const fileKey = fieldName === 'resume' ? 'resume' : 
                               fieldName === 'birth_certificate' ? 'birth' : 
                               fieldName === 'diploma' ? 'diploma' : 'cover';
                delete filesMeta[application.id][fileKey];
                localStorage.setItem('careers_files', JSON.stringify(filesMeta));
              }
            }
          }
        });
      }
    });
  }

  // Initialize file pickers once
  initializeFilePickers();

  // ── FAQ accordion ─────────────────────────────────────────────────
  document.querySelectorAll('.faq-item .faq-question').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.faq-item').classList.toggle('open'));
  });

  // ── Lucide icons ──────────────────────────────────────────────────
  try {
    const lucide = window.lucide;
    if (lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
  } catch(err) {}

  // ── Modal & form ──────────────────────────────────────────────────
  if (!modal || !applyForm) return;

  function closeModal() {
    const modal = document.getElementById('applyModal');
    if (modal) {
      modal.setAttribute('aria-hidden', 'true');
      // Reset form when closing
      const form = document.getElementById('applyForm');
      const modalTitle = document.getElementById('modalTitle');
      const submitBtn = document.querySelector('#applyForm .btn-primary');
      
      if (form) {
        form.reset();
        // Reset file picker displays
        document.querySelectorAll('.file-picker .file-name').forEach(s => { s.textContent = 'No file chosen'; });
        document.querySelectorAll('.file-picker .file-clear').forEach(b => { b.style.display = 'none'; });
        
        // Restore required attributes for file inputs
        const resumeInput = form.querySelector('input[name="resume"]');
        const birthInput = form.querySelector('input[name="birth_certificate"]');
        const diplomaInput = form.querySelector('input[name="diploma"]');
        const firstNameInput = form.querySelector('input[name="first_name"]');
        const lastNameInput = form.querySelector('input[name="last_name"]');
        const emailInput = form.querySelector('input[name="email"]');
        const phoneInput = form.querySelector('input[name="phone"]');
        
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
      
      // Hide edit warning when modal is closed
      const editWarningEl = document.getElementById('editWarning');
      if (editWarningEl) editWarningEl.style.display = 'none';
    }
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (cancelBtn)  cancelBtn.addEventListener('click', closeModal);

  // Phone validation
  const phoneInput   = applyForm.querySelector('input[name="phone"]');
  const phoneWarning = applyForm.querySelector('.phone-warning');
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      const raw    = phoneInput.value;
      const digits = raw.replace(/\D/g, '').slice(0, 11);
      if (phoneInput.value !== digits) phoneInput.value = digits;
      if (phoneWarning) phoneWarning.textContent = /[A-Za-z]/.test(raw) ? 'Only numbers allowed.' : '';
    });
  }

  // ── Form submit ───────────────────────────────────────────────────
  applyForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (phoneInput && /[A-Za-z]/.test(phoneInput.value)) {
      if (phoneWarning) phoneWarning.textContent = 'Please remove letters from phone.';
      return;
    }

    // Check if we're editing an existing application
    const modalTitle = document.getElementById('modalTitle');
    const isEditing = modalTitle && modalTitle.textContent.includes('Edit Application');
    
    // For new applications: validate all required files are present with proper size and type
    if (!isEditing) {
      const requiredFiles = [
        { field: 'resume', name: 'Resume/CV' },
        { field: 'birth_certificate', name: 'Birth Certificate' },
        { field: 'diploma', name: 'Diploma/TOR' }
      ];

      const missingFiles = [];
      const invalidFiles = [];
      
      requiredFiles.forEach(file => {
        const fileInput = applyForm.querySelector(`input[name="${file.field}"]`);
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
          missingFiles.push(file.name);
        } else if (fileInput.files && fileInput.files[0]) {
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
        }
      });

      if (missingFiles.length > 0) {
        formResult.textContent = `⚠️ Please upload all required files: ${missingFiles.join(', ')}. These documents are required to process your application.`;
        formResult.style.color = '#ff6b6b';
        return;
      }
      
      if (invalidFiles.length > 0) {
        formResult.textContent = `⚠️ Please fix these file issues: ${invalidFiles.join(', ')}. Maximum file size is 2MB. Allowed types: PDF, Word, Excel, JPEG, PNG.`;
        formResult.style.color = '#ff6b6b';
        return;
      }
    }
    
    // For editing applications: validate files and show appropriate warnings
    if (isEditing) {
      const fileInputs = [
        { field: 'resume', name: 'Resume/CV', required: true },
        { field: 'birth_certificate', name: 'Birth Certificate', required: true },
        { field: 'diploma', name: 'Diploma/TOR', required: true },
        { field: 'cover_letter', name: 'Cover Letter', required: false }
      ];
      
      const uploadedFiles = [];
      const missingRequiredFiles = [];
      const invalidFiles = [];
      const modifiedFiles = []; // Track which files were actually modified
      
      fileInputs.forEach(fileInfo => {
        const fileInput = applyForm.querySelector(`input[name="${fileInfo.field}"]`);
        const picker = fileInput?.closest('.file-picker');
        const nameSpan = picker?.querySelector('.file-name');
        const clearBtn = picker?.querySelector('.file-clear');
        
        // Check if this file was modified (new file uploaded or existing file cleared)
        const hasExistingFile = nameSpan && nameSpan.textContent !== 'No file chosen' && clearBtn && clearBtn.style.display !== 'none';
        const hasNewFile = fileInput && fileInput.files && fileInput.files.length > 0;
        const wasCleared = hasExistingFile && !hasNewFile && clearBtn && clearBtn.style.display === 'none';
        
        if (hasNewFile || wasCleared) {
          modifiedFiles.push(fileInfo.name);
        }
        
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
          // File is empty - check if it's required
          if (fileInfo.required) {
            missingRequiredFiles.push(fileInfo.name);
          }
        } else if (fileInput.files && fileInput.files[0]) {
          const f = fileInput.files[0];
          uploadedFiles.push(f.name);
          
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
        }
      });
      
      // Only show warnings if files were actually modified
      if (modifiedFiles.length === 0) {
        // No files were modified, show warning and prevent submission
        const editWarningEl = document.getElementById('editWarning');
        if (editWarningEl) {
          editWarningEl.textContent = '⚠️ Please fill requirements to submit';
          editWarningEl.style.display = 'block';
        }
        
        // Clear form result to avoid confusion
        formResult.textContent = '';
        formResult.style.color = '';
        
        return; // Completely stop form submission - just show warning
      } else if (missingRequiredFiles.length > 0 && uploadedFiles.length > 0) {
        // User uploaded some files but left other required files empty
        const editWarningEl = document.getElementById('editWarning');
        if (editWarningEl) editWarningEl.style.display = 'none'; // Hide the "fill requirements" warning
        
        formResult.textContent = `⚠️ Please upload the missing files requirements: ${missingRequiredFiles.join(', ')}. You have uploaded some files but still need to complete all required documents.`;
        formResult.style.color = '#ff6b6b';
        return;
      } else if (missingRequiredFiles.length > 0 && invalidFiles.length > 0) {
        const editWarningEl = document.getElementById('editWarning');
        if (editWarningEl) editWarningEl.style.display = 'none'; // Hide the "fill requirements" warning
        
        formResult.textContent = `⚠️ Please upload missing required files: ${missingRequiredFiles.join(', ')}. Also fix these issues: ${invalidFiles.join(', ')}. Maximum file size is 2MB. Allowed types: PDF, Word, Excel, JPEG, PNG.`;
        formResult.style.color = '#ff6b6b';
        return;
      } else if (missingRequiredFiles.length > 0) {
        const editWarningEl = document.getElementById('editWarning');
        if (editWarningEl) editWarningEl.style.display = 'none'; // Hide the "fill requirements" warning
        
        formResult.textContent = `⚠️ Please upload all required files: ${missingRequiredFiles.join(', ')} to complete your application. These documents are required to process your submission.`;
        formResult.style.color = '#ff6b6b';
        return;
      } else if (invalidFiles.length > 0) {
        const editWarningEl = document.getElementById('editWarning');
        if (editWarningEl) editWarningEl.style.display = 'none'; // Hide the "fill requirements" warning
        
        formResult.textContent = `⚠️ Please fix these file issues: ${invalidFiles.join(', ')}. Maximum file size is 2MB. Allowed types: PDF, Word, Excel, JPEG, PNG.`;
        formResult.style.color = '#ff6b6b';
        return;
      } else {
        // All validations passed - hide warning and proceed
        const editWarningEl = document.getElementById('editWarning');
        if (editWarningEl) editWarningEl.style.display = 'none';
      }
    }

    formResult.textContent = 'Application submitted...';
    formResult.style.color = '';

    const first  = applyForm.querySelector('input[name="first_name"]')?.value.trim()  || '';
    const middle = applyForm.querySelector('input[name="middle_name"]')?.value.trim() || '';
    const last   = applyForm.querySelector('input[name="last_name"]')?.value.trim()   || '';
    const fullName = [first, middle, last].filter(Boolean).join(' ');
    const role     = (inputRole ? inputRole.value : '') || '';

    if (isEditing) {
      // Find and update existing application
      let applications = [];
      try { 
        applications = JSON.parse(localStorage.getItem('careers_applications') || '[]'); 
      } catch(err) {}
      
      // Find most recent application for this job to update
      const existingAppIndex = applications.findIndex(app => app.position.toLowerCase() === role.toLowerCase());
      
      if (existingAppIndex !== -1) {
        // Update existing application with new data
        applications[existingAppIndex] = {
          ...applications[existingAppIndex],
          fname: first,
          lname: last,
          email: applyForm.querySelector('input[name="email"]')?.value.trim()   || '',
          phone: applyForm.querySelector('input[name="phone"]')?.value.trim()   || '',
          position: role,
          dept: '',
          status: 'Updated', // Mark as updated
          message: applyForm.querySelector('textarea[name="message"]')?.value.trim() || '',
          appliedAt: new Date().toLocaleDateString()
        };
        
        localStorage.setItem('careers_applications', JSON.stringify(applications));
        
        // Process files in background without blocking
        processFilesInBackground(role, applications[existingAppIndex].id);
        
        // Show success immediately
        formResult.textContent = 'Application updated successfully!';
        applyForm.reset();
        document.querySelectorAll('.file-picker .file-name').forEach(s => { s.textContent = 'No file chosen'; });
        document.querySelectorAll('.file-picker .file-clear').forEach(b => { b.style.display = 'none'; });
        updateJobButtons();
        setTimeout(() => closeModal(), 1000);
        
        return; // Exit early - don't create new application
      }
    }

    // If not editing, create new application (original logic)
    const appId = Date.now();
    const app = {
      id:        appId,
      fname:     first,
      lname:     last,
      email:     applyForm.querySelector('input[name="email"]')?.value.trim()   || '',
      phone:     applyForm.querySelector('input[name="phone"]')?.value.trim()   || '',
      position:  role,
      dept:      '',
      status:    'New',
      message:   applyForm.querySelector('textarea[name="message"]')?.value.trim() || '',
      appliedAt: new Date().toLocaleDateString()
    };

    // Save application record
    let apps = [];
    try { apps = JSON.parse(localStorage.getItem('careers_applications') || '[]'); } catch(err) {}
    apps.push(app);
    localStorage.setItem('careers_applications', JSON.stringify(apps));

    // Increment applicant count on matching job posting
    try {
      let jobs = JSON.parse(localStorage.getItem('careers_job_postings') || '[]');
      jobs = jobs.map(j => {
        if (j.title === role) j.apps = (j.apps || 0) + 1;
        return j;
      });
      localStorage.setItem('careers_job_postings', JSON.stringify(jobs));
    } catch(err) {}

    // Process files in background without blocking
    processFilesInBackground(role, appId);
    
    // Show success immediately
    formResult.textContent = 'Application submitted successfully! Thank you, ' + first + '.';
    applyForm.reset();
    document.querySelectorAll('.file-picker .file-name').forEach(s => { s.textContent = 'No file chosen'; });
    document.querySelectorAll('.file-picker .file-clear').forEach(b => { b.style.display = 'none'; });
    updateJobButtons();
    setTimeout(() => closeModal(), 1000);
  });

  function processFilesInBackground(role, appId) {
    // Process files asynchronously without blocking UI
    const fileMappings = [
      { field: 'resume',            key: 'resume'  },
      { field: 'birth_certificate', key: 'birth'   },
      { field: 'diploma',           key: 'diploma' },
      { field: 'cover_letter',      key: 'cover'   }
    ];

    let filesMeta = {};
    try { filesMeta = JSON.parse(localStorage.getItem('careers_files') || '{}'); } catch(err) {}
    
    // Preserve existing files when editing, create new object only if it doesn't exist
    if (!filesMeta[appId]) {
      filesMeta[appId] = {};
    }

    fileMappings.forEach(m => {
      const fileInput = applyForm.querySelector('input[name="' + m.field + '"]');
      if (fileInput && fileInput.files && fileInput.files[0]) {
        const f = fileInput.files[0];
        
        // Check file size - show warning for files larger than 2MB
        if (f.size > 2 * 1024 * 1024) {
          const fileSizeMB = (f.size / (1024 * 1024)).toFixed(2);
          const warningMsg = `⚠️ ${f.name} is too large (${fileSizeMB} MB). Maximum file size is 2MB. Please choose a smaller file.`;
          
          // Show warning in form result
          if (formResult) {
            formResult.textContent = warningMsg;
            formResult.style.color = '#ff6b6b';
          }
          
          // Clear this file input
          fileInput.value = '';
          const picker = fileInput.closest('.file-picker');
          if (picker) {
            const nameSpan = picker.querySelector('.file-name');
            const clearBtn = picker.querySelector('.file-clear');
            if (nameSpan) nameSpan.textContent = 'No file chosen';
            if (clearBtn) clearBtn.style.display = 'none';
          }
          
          console.warn(`File ${f.name} is too large (${Math.round(f.size / 1024)} KB). Skipping.`);
          return;
        }
        
        // Check file type - only allow common document types
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
          const warningMsg = `⚠️ ${f.name} has an unsupported file type (${f.type || 'unknown'}). Please upload PDF, Word, Excel, or image files.`;
          
          // Show warning in form result
          if (formResult) {
            formResult.textContent = warningMsg;
            formResult.style.color = '#ff6b6b';
          }
          
          // Clear this file input
          fileInput.value = '';
          const picker = fileInput.closest('.file-picker');
          if (picker) {
            const nameSpan = picker.querySelector('.file-name');
            const clearBtn = picker.querySelector('.file-clear');
            if (nameSpan) nameSpan.textContent = 'No file chosen';
            if (clearBtn) clearBtn.style.display = 'none';
          }
          
          console.warn(`File ${f.name} has unsupported type (${f.type}). Skipping.`);
          return;
        }
        
        const reader = new FileReader();
        reader.onload = ev => {
          try {
            filesMeta[appId][m.key] = {
              fileName:      f.name,
              fileSize:      Math.round(f.size / 1024) + ' KB',
              mimeType:      f.type,
              uploadedAt:    new Date().toLocaleDateString(),
              applicantName: (applyForm.querySelector('input[name="first_name"]')?.value.trim() || '') + ' ' + (applyForm.querySelector('input[name="last_name"]')?.value.trim() || ''),
              dataUrl:       ev.target.result
            };
            // Save files to storage
            localStorage.setItem('careers_files', JSON.stringify(filesMeta));
          } catch(err) {
            console.error('Error saving file:', err);
          }
        };
        
        reader.onerror = () => {
          console.warn(`File reading error for ${f.name}`);
        };
        
        try {
          reader.readAsDataURL(f);
        } catch(err) {
          console.error('Error reading file:', err);
        }
      }
    });
  }

  function processAndSaveFiles(role, appId) {
    // ── Read all uploaded files as base64 and save ────────────────────────
    const fileMappings = [
      { field: 'resume',            key: 'resume'  },
      { field: 'birth_certificate', key: 'birth'   },
      { field: 'diploma',           key: 'diploma' },
      { field: 'cover_letter',      key: 'cover'   }
    ];

    let filesMeta = {};
    try { filesMeta = JSON.parse(localStorage.getItem('careers_files') || '{}'); } catch(err) {}
    filesMeta[appId] = {};

    let pending   = fileMappings.length;
    let completed = 0;

    function onFileDone() {
      completed++;
      if (completed < pending) return;
      
      // Show success immediately
      const modalTitle = document.getElementById('modalTitle');
      const isEditing = modalTitle && modalTitle.textContent.includes('Edit Application');
      formResult.textContent = isEditing ? 'Application updated successfully!' : 'Application submitted successfully! Thank you, ' + first + '.';
      applyForm.reset();
      
      // Reset file picker labels
      document.querySelectorAll('.file-picker .file-name').forEach(s => { s.textContent = 'No file chosen'; });
      document.querySelectorAll('.file-picker .file-clear').forEach(b => { b.style.display = 'none'; });
      
      // Update job buttons to show Applied state
      updateJobButtons();
      
      // Close modal quickly
      setTimeout(() => closeModal(), 1500);
    }

    // Process files with simplified approach
    fileMappings.forEach(m => {
      const fileInput = applyForm.querySelector('input[name="' + m.field + '"]');
      if (fileInput && fileInput.files && fileInput.files[0]) {
        const f = fileInput.files[0];
        
        // Check file size - reject files larger than 2MB for better performance
        if (f.size > 2 * 1024 * 1024) {
          console.warn(`File ${f.name} is too large (${Math.round(f.size / 1024)} KB). Skipping.`);
          onFileDone();
          return;
        }
        
        const reader = new FileReader();
        
        reader.onload = ev => {
          try {
            filesMeta[appId][m.key] = {
              fileName:      f.name,
              fileSize:      Math.round(f.size / 1024) + ' KB',
              mimeType:      f.type,
              uploadedAt:    new Date().toLocaleDateString(),
              applicantName: fullName,
              dataUrl:       ev.target.result
            };
            // Save files after all are processed
            localStorage.setItem('careers_files', JSON.stringify(filesMeta));
          } catch(err) {
            console.error('Error processing file:', err);
          }
          onFileDone();
        };
        
        reader.onerror = () => {
          console.warn(`File reading error for ${f.name}`);
          onFileDone();
        };
        
        try {
          reader.readAsDataURL(f);
        } catch(err) {
          console.error('Error reading file:', err);
          onFileDone();
        }
      } else {
        // No file selected, continue
        onFileDone();
      }
    });
  }
});
