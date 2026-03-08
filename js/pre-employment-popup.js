// Pre-Employment Processing Popup - Similar to interview-popup.js
function r_openPreEmploymentPopup(applicantId) {
    console.log('🔧 Opening pre-employment popup for applicant:', applicantId);
    
    // Load applicant data first
    r_loadApplicantForPreEmploymentPopup(applicantId);
}

async function r_loadApplicantForPreEmploymentPopup(applicantId) {
    console.log('🔍 Loading applicant data for ID:', applicantId);
    try {
        const response = await fetch('../api/simple-api-new.php?action=get_applications');
        const applicants = await response.json();
        const applicant = applicants.find(a => a.id == applicantId);
        
        if (applicant) {
            console.log('✅ Applicant data loaded:', applicant);
            r_createPreEmploymentPopup(applicant);
        } else {
            console.error('❌ Applicant not found');
            alert('Applicant not found');
        }
    } catch (error) {
        console.error('❌ Error loading applicant:', error);
        alert('Error loading applicant data');
    }
}

function r_createPreEmploymentPopup(applicant) {
    console.log('🎯 Creating pre-employment popup');
    
    // Create popup content
    const popupContent = `
        <div id="pre-employment-popup" style="
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
                <h3 style="margin: 0; color: var(--text-primary, #1f2937);">Pre-Employment Processing</h3>
                <button onclick="r_closePreEmploymentPopup()" style="
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: var(--text-secondary, #64748b);
                    padding: 5px;
                ">&times;</button>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary, #1f2937);">Applicant Name</label>
                <input type="text" value="${applicant.first_name || ''} ${applicant.last_name || ''}" readonly style="
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 6px;
                    background: var(--background, #f8fafc);
                    color: var(--text-secondary, #64748b);
                    font-size: 14px;
                    cursor: not-allowed;
                ">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary, #1f2937);">Position Applied</label>
                <input type="text" value="${applicant.position || applicant.applied_position || ''}" readonly style="
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 6px;
                    background: var(--background, #f8fafc);
                    color: var(--text-secondary, #64748b);
                    font-size: 14px;
                    cursor: not-allowed;
                ">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary, #1f2937);">Email</label>
                <input type="email" value="${applicant.email || ''}" readonly style="
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 6px;
                    background: var(--background, #f8fafc);
                    color: var(--text-secondary, #64748b);
                    font-size: 14px;
                    cursor: not-allowed;
                ">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary, #1f2937);">Phone</label>
                <input type="tel" value="${applicant.phone || ''}" readonly style="
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 6px;
                    background: var(--background, #f8fafc);
                    color: var(--text-secondary, #64748b);
                    font-size: 14px;
                    cursor: not-allowed;
                ">
            </div>
            
            <div style="margin-bottom: 20px;">
                <h4 style="margin: 0 0 10px 0; color: var(--text-primary, #1f2937);">Background Check</h4>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary, #1f2937);">Criminal Record</label>
                        <select id="pre_criminal_check" style="
                            width: 100%;
                            padding: 8px 12px;
                            border: 1px solid var(--border-color, #e2e8f0);
                            border-radius: 6px;
                            background: var(--background, #f8fafc);
                            color: var(--text-primary, #1f2937);
                            font-size: 14px;
                        ">
                            <option value="">Select...</option>
                            <option value="clear">Clear</option>
                            <option value="pending">Pending</option>
                            <option value="passed">Passed</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary, #1f2937);">Drug Test</label>
                        <select id="pre_drug_test" style="
                            width: 100%;
                            padding: 8px 12px;
                            border: 1px solid var(--border-color, #e2e8f0);
                            border-radius: 6px;
                            background: var(--background, #f8fafc);
                            color: var(--text-primary, #1f2937);
                            font-size: 14px;
                        ">
                            <option value="">Select...</option>
                            <option value="clear">Clear</option>
                            <option value="pending">Pending</option>
                            <option value="passed">Passed</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h4 style="margin: 0 0 10px 0; color: var(--text-primary, #1f2937);">Reference Check</h4>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary, #1f2937);">Previous Employer</label>
                        <input type="text" id="pre_previous_employer" placeholder="Previous employer name" style="
                            width: 100%;
                            padding: 8px 12px;
                            border: 1px solid var(--border-color, #e2e8f0);
                            border-radius: 6px;
                            background: var(--background, #f8fafc);
                            color: var(--text-primary, #1f2937);
                            font-size: 14px;
                        ">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary, #1f2937);">Contact Person</label>
                        <input type="text" id="pre_contact_person" placeholder="Contact person name" style="
                            width: 100%;
                            padding: 8px 12px;
                            border: 1px solid var(--border-color, #e2e8f0);
                            border-radius: 6px;
                            background: var(--background, #f8fafc);
                            color: var(--text-primary, #1f2937);
                            font-size: 14px;
                        ">
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h4 style="margin: 0 0 10px 0; color: var(--text-primary, #1f2937);">Documents</h4>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary, #1f2937);">Resume</label>
                        <input type="file" id="pre_resume" accept=".pdf,.doc,.docx" style="
                            width: 100%;
                            padding: 8px 12px;
                            border: 1px solid var(--border-color, #e2e8f0);
                            border-radius: 6px;
                            background: var(--background, #f8fafc);
                            color: var(--text-primary, #1f2937);
                            font-size: 14px;
                        ">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary, #1f2937);">ID</label>
                        <input type="file" id="pre_id" accept=".pdf,.jpg,.png" style="
                            width: 100%;
                            padding: 8px 12px;
                            border: 1px solid var(--border-color, #e2e8f0);
                            border-radius: 6px;
                            background: var(--background, #f8fafc);
                            color: var(--text-primary, #1f2937);
                            font-size: 14px;
                        ">
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h4 style="margin: 0 0 10px 0; color: var(--text-primary, #1f2937);">Processing Status</h4>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary, #1f2937);">Overall Status</label>
                        <select id="pre_overall_status" style="
                            width: 100%;
                            padding: 8px 12px;
                            border: 1px solid var(--border-color, #e2e8f0);
                            border-radius: 6px;
                            background: var(--background, #f8fafc);
                            color: var(--text-primary, #1f2937);
                            font-size: 14px;
                        ">
                            <option value="pending">Pending</option>
                            <option value="cleared">Cleared</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary, #1f2937);">Notes</label>
                        <textarea id="pre_notes" rows="3" placeholder="Additional notes about pre-employment processing..." style="
                            width: 100%;
                            padding: 8px 12px;
                            border: 1px solid var(--border-color, #e2e8f0);
                            border-radius: 6px;
                            background: var(--background, #f8fafc);
                            color: var(--text-primary, #1f2937);
                            font-size: 14px;
                            resize: vertical;
                            font-family: inherit;
                        "></textarea>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button onclick="r_savePreEmploymentPopup(${applicant.id})" style="
                    flex: 1;
                    padding: 10px 20px;
                    background: var(--brand-green, #10b981);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 14px;
                ">Save Pre-Employment Data</button>
                <button onclick="r_closePreEmploymentPopup()" style="
                    flex: 1;
                    padding: 10px 20px;
                    background: transparent;
                    color: var(--text-secondary, #64748b);
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 14px;
                ">Cancel</button>
            </div>
        </div>
    `;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'pre-employment-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.5);
        z-index: 999998;
    `;
    
    // Add to page
    document.body.appendChild(overlay);
    document.body.insertAdjacentHTML('beforeend', popupContent);
    
    console.log('✅ Pre-employment popup opened');
}

function r_closePreEmploymentPopup() {
    const popup = document.getElementById('pre-employment-popup');
    const overlay = document.getElementById('pre-employment-overlay');
    
    if (popup) popup.remove();
    if (overlay) overlay.remove();
    
    console.log('✅ Pre-employment popup closed');
}

async function r_savePreEmploymentPopup(applicantId) {
    console.log('💾 Saving pre-employment data for applicant ID:', applicantId);
    
    const criminalCheck = document.getElementById('pre_criminal_check').value;
    const drugTest = document.getElementById('pre_drug_test').value;
    const previousEmployer = document.getElementById('pre_previous_employer').value;
    const contactPerson = document.getElementById('pre_contact_person').value;
    const overallStatus = document.getElementById('pre_overall_status').value;
    const notes = document.getElementById('pre_notes').value;
    
    if (!overallStatus) {
        alert('Please select an overall processing status');
        return;
    }
    
    try {
        const apiPayload = {
            applicant_id: applicantId,
            criminal_check: criminalCheck,
            drug_test: drugTest,
            previous_employer: previousEmployer,
            contact_person: contactPerson,
            overall_status: overallStatus,
            notes: notes
        };
        
        console.log('📤 Sending pre-employment data:', apiPayload);
        
        const response = await fetch('../api/simple-api-new.php?action=save_pre_employment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(apiPayload)
        });
        
        const result = await response.json();
        console.log('📡 Response:', result);
        
        if (result.success) {
            alert('Pre-employment data saved successfully!');
            r_closePreEmploymentPopup();
            // Refresh applications list
            if (typeof r_loadApplications === 'function') {
                await r_loadApplications();
                if (typeof r_render === 'function') {
                    r_render();
                }
            }
        } else {
            alert('Error saving pre-employment data: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('❌ Error saving pre-employment data:', error);
        alert('Error saving pre-employment data: ' + error.message);
    }
}
