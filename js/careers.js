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
  var JOBS = [];

  // ── Load job postings from localStorage (written by Recruitment module) ──
  (function loadCareersJobs() {
    console.log('Loading jobs from storage...');
    try {
      var jobs = [];
      var stored = localStorage.getItem('careers_job_postings');
      if (stored) jobs = JSON.parse(stored);
      console.log('Loaded jobs:', jobs);
      JOBS = jobs;
      
      // Populate job dropdown
      var jobSelect = document.getElementById('jobTitle');
      if (jobSelect) {
        jobSelect.innerHTML = '<option value="">Select a position</option>' + 
          jobs.map(job => '<option value="' + esc(job.title) + '">' + esc(job.title) + '</option>').join('');
      }
    } catch(e) {
      console.error('Error loading jobs:', e);
      JOBS = [];
    }
  })();

  // ── Remove duplicate "Choose File" buttons ─────────────────────────────
  // REMOVED: This was removing all buttons including working ones
  // (function removeDuplicateFileButtons() {
  //   console.log('Removing duplicate "Choose File" buttons...');
  //   
  //   // Find all elements with text containing "Choose File"
  //   const allElements = document.querySelectorAll('*');
  //   const elementsToRemove = [];
  //   
  //   allElements.forEach(element => {
  //     if (element.textContent && element.textContent.includes('Choose File')) {
  //       console.log('Found potential duplicate:', element.textContent, element.tagName, element.className);
  //       
  //       // Check if it's not the main working button
  //       const parent = element.closest('.file-picker');
  //       if (parent) {
  //         // Check if it's not the main file input (has type="file")
  //         const fileInput = parent.querySelector('input[type="file"]');
  //         if (fileInput) {
  //           // This is a duplicate button, remove it
  //           console.log('Removing duplicate button:', element.textContent);
  //           elementsToRemove.push(element);
  //         } else {
  //           console.log('Keeping non-duplicate element:', element.textContent, element.tagName, element.className);
  //         }
  //       }
  //     }
  //   });
  //   
  //   // Remove all duplicate buttons
  //   elementsToRemove.forEach(element => {
  //     element.remove();
  //   });
  //   
  //   console.log(`Removed ${elementsToRemove.length} duplicate "Choose File" buttons`);
  //   console.log('Remaining elements with "Choose File" text:', 
  //     Array.from(document.querySelectorAll('*')).filter(el => 
  //       el.textContent && el.textContent.includes('Choose File')
  //     ).map(el => el.textContent)
  //   );
  // })();

  // ── Initialize File Pickers ─────────────────────────────────
  // Make green "Choose File" buttons trigger the hidden file input
  function initFilePickers() {
    document.querySelectorAll('.file-picker').forEach(picker => {
      const fileInput = picker.querySelector('input[type="file"].real-file');
      const fileBtn = picker.querySelector('.file-btn');
      const fileName = picker.querySelector('.file-name');
      const clearBtn = picker.querySelector('.file-clear');
      
      if (!fileInput || !fileBtn || !fileName) return;
      
      // Click green button → open file dialog
      fileBtn.addEventListener('click', () => {
        fileInput.click();
      });
      
      // File selected → update display
      fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) {
          fileName.textContent = file.name;
          fileName.style.color = 'var(--brand-green)';
          if (clearBtn) clearBtn.style.display = 'inline-block';
        } else {
          fileName.textContent = 'No file chosen';
          fileName.style.color = 'var(--text-secondary)';
          if (clearBtn) clearBtn.style.display = 'none';
        }
      });
      
      // Clear button → remove file
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          fileInput.value = '';
          fileName.textContent = 'No file chosen';
          fileName.style.color = 'var(--text-secondary)';
          clearBtn.style.display = 'none';
          delete fileInput.dataset.existingFile;
        });
      }
    });
  }
  
  // Initialize on page load
  initFilePickers();

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
            jobElement.appendChild(buttonContainer);
          }
        } else {
          // Job not applied - normal state
          applyBtn.textContent = 'Apply';
          applyBtn.classList.remove('applied-btn');
          applyBtn.disabled = false;
          applyBtn.setAttribute('data-role', 'apply');
        }
      }
    });
  }

  // ── Edit Application ───────────────────────────────────────────────
  function editApplication(jobTitle) {
    console.log('Editing application for job:', jobTitle);
    
    // Find most recent application for this job
    let applications = [];
    try { 
      applications = JSON.parse(localStorage.getItem('careers_applications') || '[]'); 
    } catch(err) {}
    
    // Find most recent application for this job
    const jobApplications = applications.filter(app => app.position.toLowerCase() === jobTitle);
    const application = jobApplications[jobApplications.length - 1];
    
    console.log('Job title:', jobTitle);
    console.log('Job applications found:', jobApplications);
    console.log('Selected application:', application);
    console.log('Application structure:', JSON.stringify(application, null, 2));
    
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
      const form = document.getElementById('applyForm');
      if (form) {
        form.querySelectorAll('input[type="file"]').forEach(input => {
          input.removeAttribute('required');
        });
      }
      
      // Fill form with existing data
      const applicationForm = document.getElementById('applyForm');
      if (applicationForm) {
        applicationForm.querySelector('input[name="first_name"]').value = application.fname || '';
        applicationForm.querySelector('input[name="last_name"]').value = application.lname || '';
        applicationForm.querySelector('input[name="email"]').value = application.email || '';
        applicationForm.querySelector('input[name="phone"]').value = application.phone || '';
      }
    }
  }

  // ── Delete Application ─────────────────────────────────────────────
  function deleteApplication(jobTitle) {
    console.log('Deleting application for job:', jobTitle);
    
    if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }
    
    // Remove application from localStorage
    let applications = [];
    try { 
      applications = JSON.parse(localStorage.getItem('careers_applications') || '[]'); 
    } catch(err) {}
    
    applications = applications.filter(app => app.position.toLowerCase() !== jobTitle);
    localStorage.setItem('careers_applications', JSON.stringify(applications));
    
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
    
    // Remove from DOM
    const jobElements = document.querySelectorAll('.job');
    jobElements.forEach(jobElement => {
      const title = jobElement.querySelector('h3').textContent.toLowerCase();
      if (title === jobTitle) {
        jobElement.remove();
      }
    });
    
    // Create custom confirmation modal
    const modalHtml = `
      <div id="deleteConfirmModal" class="delete-confirm-modal" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      ">
        <div style="
          background: white;
          padding: 2rem;
          border-radius: 8px;
          max-width: 400px;
          text-align: center;
        ">
          <h3>Delete Application</h3>
          <p>Are you sure you want to delete this application?</p>
          <div style="margin-top: 1rem; display: flex; gap: 1rem; justify-content: center;">
            <button id="deleteYesBtn" style="
              background: #dc3545;
              color: white;
              border: none;
              padding: 0.5rem 1rem;
              border-radius: 4px;
              cursor: pointer;
            ">Yes, Delete</button>
            <button id="deleteNoBtn" style="
              background: #6c757d;
              color: white;
              border: none;
              padding: 0.5rem 1rem;
              border-radius: 4px;
              cursor: pointer;
            ">Cancel</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Get modal elements
    const modal = document.getElementById('deleteConfirmModal');
    const yesBtn = document.getElementById('deleteYesBtn');
    const noBtn = document.getElementById('deleteNoBtn');
    
    // Add event listeners
    const closeModal = () => {
      if (modal) modal.remove();
    };
    
    if (yesBtn) yesBtn.addEventListener('click', () => {
      // Delete confirmed - proceed with deletion
      deleteApplicationConfirmed(jobTitle);
      closeModal();
    });
    
    if (noBtn) noBtn.addEventListener('click', closeModal);
    
    // Handle clicking outside modal
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  function deleteApplicationConfirmed(jobTitle) {
    // Remove application from localStorage
    let applications = [];
    try { 
      applications = JSON.parse(localStorage.getItem('careers_applications') || '[]'); 
    } catch(err) {}
    
    applications = applications.filter(app => app.position.toLowerCase() !== jobTitle);
    localStorage.setItem('careers_applications', JSON.stringify(applications));
    
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
    
    // Remove associated files
    let filesMeta = {};
    try {
      filesMeta = JSON.parse(localStorage.getItem('careers_files') || '{}');
    } catch(err) {}
    
    if (filesMeta[application.id]) {
      delete filesMeta[application.id];
      localStorage.setItem('careers_files', JSON.stringify(filesMeta));
      console.log('Deleted application files for:', application.id);
    }
  }

  // ── Apply buttons (set by dynamic job loader in index.html) ───────────────
  const applyBtns = document.querySelectorAll('.apply-btn');
  const modal     = document.getElementById('applyModal');
  const modalClose = document.getElementById('modalClose');
  const cancelBtn  = document.getElementById('cancelBtn');
  const modalTitle = document.getElementById('modalTitle');
  const inputRole = document.getElementById('inputRole');
  const applyForm = document.getElementById('applyForm');
  const formResult = document.getElementById('formResult');

  if (applyBtns) {
    applyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.getAttribute('data-role') || 'Position';
        if (modalTitle) modalTitle.textContent = `Apply for ${role}`;
        if (inputRole) inputRole.value = role;
        if (modal) modal.setAttribute('aria-hidden', 'false');
        if (formResult) formResult.textContent = '';
      });
    });
  }

  // ── File picker utilities ─────────────────────────────────────────────
  function initializeFilePickers() {
    document.querySelectorAll('.file-picker').forEach(picker => {
      const input = picker.querySelector('input[type="file"]');
      const clearBtn = picker.querySelector('.file-clear');
      const nameSpan = picker.querySelector('.file-name');
      
      if (!input || !clearBtn || !nameSpan) return;
      
      // Clone clear button and get reference to the new one
      let newClearBtn = null;
      if (clearBtn) {
        newClearBtn = clearBtn.cloneNode(true);
        clearBtn.parentNode.replaceChild(newClearBtn, clearBtn);
      }

      // Add click event to name span to trigger file input
      nameSpan.addEventListener('click', () => {
        if (input) input.click();
      });

      input.addEventListener('change', () => {
        const f = input.files && input.files[0];
        if (f) {
          nameSpan.textContent = f.name;
          if (newClearBtn) newClearBtn.style.display = 'inline-block';
        } else {
          nameSpan.textContent = 'No file chosen';
          if (newClearBtn) newClearBtn.style.display = 'none';
        }
        
        // Manually trigger file name display update
        setTimeout(() => {
          nameSpan.click();
        }, 100);
      });

      if (newClearBtn) {
        newClearBtn.addEventListener('click', () => {
          input.value = '';
          nameSpan.textContent = 'No file chosen';
          newClearBtn.style.display = 'none';
          
          // Don't immediately delete from localStorage during edit
          // Files will be properly updated after successful submission
        });
      }
    });
  }

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
      
      // Hide edit warning when modal is closed
      const editWarningEl = document.getElementById('editWarning');
      if (editWarningEl) editWarningEl.style.display = 'none';
    }
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

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
  if (applyForm) {
    console.log('Apply form found, adding submit listener');
    applyForm.addEventListener('submit', (e) => {
      console.log('Form submit event triggered!');
      e.preventDefault();
      
      // Check text fields for both new and edit applications
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
      
      console.log('Missing text fields:', missingTextFields);
      
      if (missingTextFields.length > 0) {
        formResult.textContent = `⚠️ Please fill in the required fields: ${missingTextFields.join(', ')}. These fields are required to process your application.`;
        formResult.style.color = '#ff6b6b';
        console.log('Validation failed - missing fields');
        return;
      }
      
      // Check required files for new applications
      const modalTitle = document.getElementById('modalTitle');
      const isEditing = modalTitle && modalTitle.textContent.includes('Edit Application');
      
      if (!isEditing) {
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
          return;
        }
        
        if (invalidFiles.length > 0) {
          formResult.textContent = `⚠️ Please fix these file issues: ${invalidFiles.join(', ')}. Maximum file size is 2MB. Allowed types: PDF, Word, Excel, JPEG, PNG.`;
          formResult.style.color = '#ff6b6b';
          console.log('Validation failed - invalid files');
          return;
        }
      }
      
      console.log('Validation passed - proceeding with submission');
      
      // If we get here, validation passed - submit the form
      submitApplication();
      
    });
  } else {
    console.error('Apply form not found!');
  }

  // ── Submit Application Function ───────────────────────────────────────
  function submitApplication() {
    console.log('submitApplication function called');
    const form = document.getElementById('applyForm');
    const formData = new FormData(form);
    
    // Get selected job from hidden input (set when Apply Now button was clicked)
    const jobInput = document.getElementById('inputRole');
    const selectedJob = JOBS.find(job => job.title === jobInput.value);
    
    if (!selectedJob) {
      alert('Please select a job position before applying.');
      return;
    }
    
    console.log('Selected job:', selectedJob);
    
    // Add job posting ID to form data
    formData.append('job_posting_id', selectedJob.id);
    formData.append('position', selectedJob.title);
    formData.append('department', selectedJob.dept);
    formData.append('location', selectedJob.location);
    formData.append('employment_type', selectedJob.emptype);
    formData.append('salary', selectedJob.salary);
    formData.append('description', selectedJob.desc);

    fetch('../api/simple-save-application.php', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      console.log('Application saved to database with ID:', data.id);
      // Close modal
      closeModal();
    })
    .catch(error => {
      console.error('Error submitting application:', error);
      const formResult = document.getElementById('formResult');
      if (formResult) {
        formResult.innerHTML = '<div class="error-message">Error submitting application. Please try again.</div>';
        formResult.style.color = '#dc3545';
      }
    });
  }

});