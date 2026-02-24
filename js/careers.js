document.addEventListener('DOMContentLoaded', () => {
  // ── Theme ──────────────────────────────────────────────────────────────────
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

  // ── Apply buttons (set by dynamic job loader in index.html) ───────────────
  const applyBtns = document.querySelectorAll('.apply-btn');
  const modal     = document.getElementById('applyModal');
  const modalClose= document.getElementById('modalClose');
  const cancelBtn = document.getElementById('cancelBtn');
  const modalTitle= document.getElementById('modalTitle');
  const inputRole = document.getElementById('inputRole');
  const applyForm = document.getElementById('applyForm');
  const formResult= document.getElementById('formResult');
  const startApplyBtn = document.getElementById('startApplyBtn');

  applyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.getAttribute('data-role') || 'Position';
      if (modalTitle) modalTitle.textContent = `Apply for ${role}`;
      if (inputRole)  inputRole.value = role;
      if (modal)      modal.setAttribute('aria-hidden', 'false');
      if (formResult) formResult.textContent = '';
    });
  });

  if (startApplyBtn) {
    startApplyBtn.addEventListener('click', () => {
      const jobs = document.getElementById('jobs');
      if (jobs) jobs.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // ── Custom file pickers ───────────────────────────────────────────────────
  document.querySelectorAll('.file-picker').forEach(picker => {
    const input    = picker.querySelector('.real-file');
    const btn      = picker.querySelector('.file-btn');
    const nameSpan = picker.querySelector('.file-name');
    const clearBtn = picker.querySelector('.file-clear');
    if (!input || !btn || !nameSpan) return;

    input.style.position = 'absolute';
    input.style.left = '-9999px';

    btn.addEventListener('click', () => input.click());

    input.addEventListener('change', () => {
      const f = input.files && input.files[0];
      if (f) {
        nameSpan.textContent = f.name;
        if (clearBtn) clearBtn.style.display = 'inline-block';
      } else {
        nameSpan.textContent = 'No file chosen';
        if (clearBtn) clearBtn.style.display = 'none';
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        nameSpan.textContent = 'No file chosen';
        clearBtn.style.display = 'none';
      });
    }
  });

  // ── FAQ accordion ─────────────────────────────────────────────────────────
  document.querySelectorAll('.faq-item .faq-question').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.faq-item').classList.toggle('open'));
  });

  // ── Lucide icons ──────────────────────────────────────────────────────────
  try {
    const lucide = window.lucide;
    if (lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
  } catch(err) {}

  // ── Modal & form ──────────────────────────────────────────────────────────
  if (!modal || !applyForm) return;

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
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

  // ── Form submit ───────────────────────────────────────────────────────────
  applyForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (phoneInput && /[A-Za-z]/.test(phoneInput.value)) {
      if (phoneWarning) phoneWarning.textContent = 'Please remove letters from phone.';
      return;
    }

    formResult.textContent = 'Saving your application...';

    const first  = applyForm.querySelector('input[name="first_name"]')?.value.trim()  || '';
    const middle = applyForm.querySelector('input[name="middle_name"]')?.value.trim() || '';
    const last   = applyForm.querySelector('input[name="last_name"]')?.value.trim()   || '';
    const fullName = [first, middle, last].filter(Boolean).join(' ');
    const role     = (inputRole ? inputRole.value : '') || '';

    // ── Save application to localStorage ─────────────────────────────────
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

    // Increment applicant count on the matching job posting
    try {
      let jobs = JSON.parse(localStorage.getItem('careers_job_postings') || '[]');
      jobs = jobs.map(j => {
        if (j.title === role) j.apps = (j.apps || 0) + 1;
        return j;
      });
      localStorage.setItem('careers_job_postings', JSON.stringify(jobs));
    } catch(err) {}

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
      // All files processed — save to storage
      try {
        localStorage.setItem('careers_files', JSON.stringify(filesMeta));
      } catch(storageErr) {
        console.warn('Files too large for localStorage — only metadata saved.', storageErr);
        // Save metadata only (no dataUrl) as fallback
        Object.keys(filesMeta[appId]).forEach(k => {
          delete filesMeta[appId][k].dataUrl;
        });
        try { localStorage.setItem('careers_files', JSON.stringify(filesMeta)); } catch(e2) {}
      }
      // Show success
      formResult.textContent = 'Application submitted successfully! Thank you, ' + first + '.';
      applyForm.reset();
      // Reset file picker labels
      document.querySelectorAll('.file-picker .file-name').forEach(s => { s.textContent = 'No file chosen'; });
      document.querySelectorAll('.file-picker .file-clear').forEach(b => { b.style.display = 'none'; });
      setTimeout(() => closeModal(), 1800);
    }

    fileMappings.forEach(m => {
      const fileInput = applyForm.querySelector('input[name="' + m.field + '"]');
      if (fileInput && fileInput.files && fileInput.files[0]) {
        const f      = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = ev => {
          filesMeta[appId][m.key] = {
            fileName:      f.name,
            fileSize:      Math.round(f.size / 1024) + ' KB',
            mimeType:      f.type,
            uploadedAt:    new Date().toLocaleDateString(),
            applicantName: fullName,
            dataUrl:       ev.target.result
          };
          onFileDone();
        };
        reader.onerror = () => onFileDone();
        reader.readAsDataURL(f);
      } else {
        onFileDone();
      }
    });
  });
});