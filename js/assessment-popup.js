// Assessment popup function that avoids modal conflicts
function am_openAssessmentPopup() {
    // Create popup content
    const popupContent = `
        <div id="assessment-popup" style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--surface, #ffffff);
            border: 2px solid var(--border-color, #e2e8f0);
            border-radius: 12px;
            padding: 20px;
            z-index: 999999;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            min-width: 400px;
            max-width: 500px;
            width: 90vw;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: var(--text-primary, #1f2937);">Assess Applicant</h3>
                <button onclick="am_closeAssessmentPopup()" style="
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: var(--text-secondary, #64748b);
                    padding: 5px;
                ">&times;</button>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary, #1f2937);">Applicant</label>
                <input type="text" id="assessment_applicant_name" readonly style="
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 6px;
                    background: var(--background, #f8fafc);
                    color: var(--text-primary, #1f2937);
                    font-size: 14px;
                ">
                <input type="hidden" id="assessment_applicant_id">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary, #1f2937);">Technical Skills</label>
                <input type="number" id="assessment_tech" min="1" max="10" value="5" style="
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 6px;
                    background: var(--background, #f8fafc);
                    color: var(--text-primary, #1f2937);
                    font-size: 14px;
                ">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary, #1f2937);">Communication</label>
                <input type="number" id="assessment_comm" min="1" max="10" value="5" style="
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 6px;
                    background: var(--background, #f8fafc);
                    color: var(--text-primary, #1f2937);
                    font-size: 14px;
                ">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary, #1f2937);">Problem Solving</label>
                <input type="number" id="assessment_prob" min="1" max="10" value="5" style="
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 6px;
                    background: var(--background, #f8fafc);
                    color: var(--text-primary, #1f2937);
                    font-size: 14px;
                ">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary, #1f2937);">Cultural Fit</label>
                <input type="number" id="assessment_fit" min="1" max="10" value="5" style="
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 6px;
                    background: var(--background, #f8fafc);
                    color: var(--text-primary, #1f2937);
                    font-size: 14px;
                ">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary, #1f2937);">Assessment Notes</label>
                <textarea id="assessment_notes" rows="4" style="
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 6px;
                    background: var(--background, #f8fafc);
                    color: var(--text-primary, #1f2937);
                    font-size: 14px;
                    resize: vertical;
                " placeholder="Enter detailed assessment notes..."></textarea>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button onclick="am_closeAssessmentPopup()" style="
                    background: var(--bg-tertiary, #f1f5f9);
                    color: var(--text-secondary, #64748b);
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                ">Cancel</button>
                <button onclick="am_saveAssessmentPopup()" style="
                    background: var(--brand-green, #2ca078);
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                ">Save Assessment</button>
            </div>
        </div>
    `;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'assessment-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 999998;
    `;
    overlay.onclick = am_closeAssessmentPopup;
    
    // Add popup and overlay to body
    document.body.appendChild(overlay);
    document.body.insertAdjacentHTML('beforeend', popupContent);
    
    console.log('✅ Assessment popup opened');
}

// Close assessment popup
function am_closeAssessmentPopup() {
    const popup = document.getElementById('assessment-popup');
    const overlay = document.getElementById('assessment-overlay');
    
    if (popup) popup.remove();
    if (overlay) overlay.remove();
    
    console.log('✅ Assessment popup closed');
}

// Save assessment from popup
function am_saveAssessmentPopup() {
    const applicantId = document.getElementById('assessment_applicant_id').value;
    const applicantName = document.getElementById('assessment_applicant_name').value;
    
    const assessment = {
        tech: parseInt(document.getElementById('assessment_tech').value) || 5,
        comm: parseInt(document.getElementById('assessment_comm').value) || 5,
        prob: parseInt(document.getElementById('assessment_prob').value) || 5,
        fit: parseInt(document.getElementById('assessment_fit').value) || 5,
        notes: document.getElementById('assessment_notes').value
    };
    
    console.log('🔍 Starting to save assessment:', { applicantId, assessment });
    
    fetch('../api/simple-api-new.php?action=save_assessment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            applicant_id: applicantId,
            ...assessment
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('📊 Assessment save response:', data);
        
        if (data.success) {
            am_closeAssessmentPopup();
            alert('Assessment saved successfully for ' + applicantName);
            
            // Refresh the application list
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } else {
            alert('Error saving assessment: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('💥 Error saving assessment:', error);
        alert('Error saving assessment: ' + error.message);
    });
}

// Open assessment popup with applicant data
function am_openAssessmentForApplicant(applicantId, applicantName) {
    console.log('🎯 Opening assessment for applicant:', { applicantId, applicantName });
    
    // Open popup first
    am_openAssessmentPopup();
    
    // Set applicant data
    setTimeout(() => {
        const nameField = document.getElementById('assessment_applicant_name');
        const idField = document.getElementById('assessment_applicant_id');
        
        if (nameField) nameField.value = applicantName;
        if (idField) idField.value = applicantId;
        
        // Load existing assessment if any
        am_loadExistingAssessment(applicantId);
    }, 100);
}

// Load existing assessment data
function am_loadExistingAssessment(applicantId) {
    console.log('🔍 Loading existing assessment for applicant:', applicantId);
    
    fetch(`../api/simple-api-new.php?action=get_assessment&applicant_id=${applicantId}`)
        .then(response => response.json())
        .then(data => {
            console.log('📊 Assessment data loaded:', data);
            
            if (data.success && data.assessment) {
                const assessment = data.assessment;
                
                // Populate form with existing assessment
                const techField = document.getElementById('assessment_tech');
                const commField = document.getElementById('assessment_comm');
                const probField = document.getElementById('assessment_prob');
                const fitField = document.getElementById('assessment_fit');
                const notesField = document.getElementById('assessment_notes');
                
                if (techField) techField.value = assessment.tech || 5;
                if (commField) commField.value = assessment.comm || 5;
                if (probField) probField.value = assessment.prob || 5;
                if (fitField) fitField.value = assessment.fit || 5;
                if (notesField) notesField.value = assessment.notes || '';
                
                console.log('✅ Assessment form populated with existing data');
            } else {
                console.log('ℹ️ No existing assessment found, using defaults');
            }
        })
        .catch(error => {
            console.error('💥 Error loading assessment:', error);
        });
}
