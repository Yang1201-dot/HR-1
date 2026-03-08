// Edit Interview Popup - Similar to interview-popup.js
function r_openEditInterviewPopup(interviewId) {
    console.log('🔧 Opening edit interview popup for ID:', interviewId);
    
    // Load interview data first
    r_loadInterviewForEditPopup(interviewId);
}

async function r_loadInterviewForEditPopup(interviewId) {
    console.log('🔍 Loading interview data for ID:', interviewId);
    try {
        const response = await fetch('../api/simple-api-new.php?action=get_interviews');
        const interviews = await response.json();
        const interview = interviews.find(i => i.id == interviewId);
        
        if (interview) {
            console.log('✅ Interview data loaded:', interview);
            r_createEditInterviewPopup(interview);
        } else {
            console.error('❌ Interview not found');
            alert('Interview not found');
        }
    } catch (error) {
        console.error('❌ Error loading interview:', error);
        alert('Error loading interview data');
    }
}

function r_createEditInterviewPopup(interview) {
    console.log('🎯 Creating edit interview popup');
    
    // Store interview data globally for save function
    window.currentEditInterview = interview;
    
    // Create popup content
    const popupContent = `
        <div id="edit-interview-popup" style="
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
                <h3 style="margin: 0; color: var(--text-primary, #1f2937);">Edit Interview</h3>
                <button onclick="r_closeEditInterviewPopup()" style="
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: var(--text-secondary, #64748b);
                    padding: 5px;
                ">&times;</button>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary, #1f2937);">Interview ID</label>
                <input type="text" value="${interview.id}" readonly style="
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
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary, #1f2937);">Applicant Name</label>
                <input type="text" value="${interview.applicant_name || ''}" readonly style="
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
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary, #1f2937);">Date <span style="color: #ef4444;">*</span></label>
                <input type="date" id="edit_popup_date" value="${interview.interview_date || ''}" style="
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
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary, #1f2937);">Time <span style="color: #ef4444;">*</span></label>
                <input type="time" id="edit_popup_time" value="${interview.interview_time || ''}" style="
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
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary, #1f2937);">Type</label>
                <select id="edit_popup_type" style="
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 6px;
                    background: var(--background, #f8fafc);
                    color: var(--text-primary, #1f2937);
                    font-size: 14px;
                ">
                    <option value="Phone Screen" ${interview.interview_type === 'Phone Screen' ? 'selected' : ''}>Phone Screen</option>
                    <option value="Video Interview" ${interview.interview_type === 'Video Interview' ? 'selected' : ''}>Video Interview</option>
                    <option value="In-Person Interview" ${interview.interview_type === 'In-Person Interview' ? 'selected' : ''}>In-Person Interview</option>
                    <option value="Technical Assessment" ${interview.interview_type === 'Technical Assessment' ? 'selected' : ''}>Technical Assessment</option>
                </select>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary, #1f2937);">Position</label>
                <input type="text" id="edit_popup_position" value="${interview.position || ''}" style="
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 6px;
                    background: var(--background, #f8fafc);
                    color: var(--text-primary, #1f2937);
                    font-size: 14px;
                ">
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary, #1f2937);">Notes</label>
                <textarea id="edit_popup_notes" rows="3" style="
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 6px;
                    background: var(--background, #f8fafc);
                    color: var(--text-primary, #1f2937);
                    font-size: 14px;
                    resize: vertical;
                    font-family: inherit;
                ">${interview.interview_notes || ''}</textarea>
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button onclick="r_saveEditInterviewPopup(${interview.id})" style="
                    flex: 1;
                    padding: 10px 20px;
                    background: var(--brand-green, #10b981);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 14px;
                ">Save Changes</button>
                <button onclick="r_closeEditInterviewPopup()" style="
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
    overlay.id = 'edit-interview-overlay';
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
    
    console.log('✅ Edit interview popup opened');
}

function r_closeEditInterviewPopup() {
    const popup = document.getElementById('edit-interview-popup');
    const overlay = document.getElementById('edit-interview-overlay');
    
    if (popup) popup.remove();
    if (overlay) overlay.remove();
    
    console.log('✅ Edit interview popup closed');
}

async function r_saveEditInterviewPopup(interviewId) {
    console.log('💾 Saving interview changes for ID:', interviewId);
    
    const date = document.getElementById('edit_popup_date').value;
    const time = document.getElementById('edit_popup_time').value;
    const type = document.getElementById('edit_popup_type').value;
    const position = document.getElementById('edit_popup_position').value;
    const notes = document.getElementById('edit_popup_notes').value;
    
    if (!date || !time) {
        alert('Please fill in all required fields (Date and Time)');
        return;
    }
    
    try {
        // Get applicant name from stored interview data
        const applicantName = window.currentEditInterview?.applicant_name || '';
        
        const apiPayload = {
            id: interviewId,
            applicant_name: applicantName,
            interview_date: date,
            interview_time: time,
            interview_type: type,
            position: position,
            notes: notes
        };
        
        console.log('📤 Sending update:', apiPayload);
        
        const response = await fetch('../api/simple-api-new.php?action=save_interview', {
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
            alert('Interview updated successfully!');
            r_closeEditInterviewPopup();
            // Refresh interviews list
            if (typeof r_loadInterviews === 'function') {
                await r_loadInterviews();
                if (typeof r_renderInterviews === 'function') {
                    r_renderInterviews();
                }
            }
        } else {
            alert('Error updating interview: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('❌ Error saving interview:', error);
        alert('Error saving interview: ' + error.message);
    }
}
