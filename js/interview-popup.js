// Simple popup function that avoids modal conflicts
function r_openInterviewPopup() {
    // Create popup content
    const popupContent = `
        <div id="interview-popup" style="
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
                <h3 style="margin: 0; color: var(--text-primary, #1f2937);">Schedule Interview</h3>
                <button onclick="r_closeInterviewPopup()" style="
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: var(--text-secondary, #64748b);
                    padding: 5px;
                ">&times;</button>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary, #1f2937);">Applicant <span style="color: #ef4444;">*</span></label>
                <select id="popup_applicant" style="
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 6px;
                    background: var(--background, #f8fafc);
                    color: var(--text-primary, #1f2937);
                    font-size: 14px;
                ">
                    <option value="">Loading applicants...</option>
                </select>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary, #1f2937);">Position <span style="color: var(--text-secondary, #64748b);">(Auto-filled)</span></label>
                <input type="text" id="popup_position" readonly style="
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 6px;
                    background: var(--background, #f8fafc);
                    color: var(--text-primary, #1f2937);
                    font-size: 14px;
                    cursor: not-allowed;
                ">
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary, #1f2937);">Date <span style="color: #ef4444;">*</span></label>
                <input type="date" id="popup_date" style="
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
                <input type="time" id="popup_time" style="
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
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary, #1f2937);">Type</label>
                <select id="popup_type" style="
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 6px;
                    background: var(--background, #f8fafc);
                    color: var(--text-primary, #1f2937);
                    font-size: 14px;
                ">
                    <option value="Phone Screen">Phone Screen</option>
                    <option value="Video Call">Video Call</option>
                    <option value="In-Person">In-Person</option>
                </select>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: var(--text-primary, #1f2937);">Notes</label>
                <textarea id="popup_notes" rows="3" style="
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
            
            <div style="display: flex; gap: 10px;">
                <button onclick="r_saveInterviewPopup()" style="
                    flex: 1;
                    padding: 10px 20px;
                    background: var(--brand-green, #10b981);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 14px;
                ">Schedule Interview</button>
                <button onclick="r_closeInterviewPopup()" style="
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
    overlay.id = 'interview-overlay';
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
    
    // Load applicants
    r_loadApplicantsForPopup();
    
    console.log('✅ Interview popup opened');
}

function r_closeInterviewPopup() {
    const popup = document.getElementById('interview-popup');
    const overlay = document.getElementById('interview-overlay');
    
    if (popup) popup.remove();
    if (overlay) overlay.remove();
    
    console.log('✅ Interview popup closed');
}

async function r_loadApplicantsForPopup() {
    console.log('🔍 Starting to load applicants...');
    try {
        console.log('📡 Making API call to get_applications...');
        const response = await fetch('../api/simple-api-new.php?action=get_applications');
        console.log('📡 Response received:', response);
        const data = await response.json();
        console.log('📊 Data loaded:', data);
        console.log('📊 Number of applicants:', data.length);
        
        const select = document.getElementById('popup_applicant');
        console.log('🎯 Dropdown element:', select);
        select.innerHTML = '<option value="">Select Applicant</option>';
        
        // Initialize applicant data storage
        window.applicantData = {};
        
        data.forEach(applicant => {
            console.log('👤 Processing applicant:', applicant);
            console.log('🔍 Status check:', applicant.status, 'matches shortlisted:', applicant.status === 'Shortlisted');
            if (applicant.status.trim().toLowerCase() === 'new' || applicant.status.trim().toLowerCase() === 'under review' || applicant.status.trim().toLowerCase() === 'shortlisted') {
                console.log('✅ Condition passed - creating option element');
                const option = document.createElement('option');
                option.value = applicant.id;
                option.textContent = `${applicant.first_name} ${applicant.last_name}`;
                console.log('🔍 Option created:', option);
                select.appendChild(option);
                console.log('✅ Added applicant to dropdown:', option.textContent);
                console.log('🔍 Dropdown options after append:', select.options.length);
                
                // Store applicant data for auto-fill
                window.applicantData[applicant.id] = {
                    position: applicant.position || '',
                    department: applicant.department || '',
                    email: applicant.email || '',
                    phone: applicant.phone || ''
                };
            } else {
                console.log('⚠️ Skipped applicant (status):', applicant.status);
            }
        });
        
        console.log('🎯 Final dropdown options count:', select.options.length);
        console.log('🎯 Dropdown HTML content:', select.innerHTML);
        console.log('🎯 Dropdown visibility check:', getComputedStyle(select).display);
        console.log('🎯 Dropdown position:', getComputedStyle(select).position);
        console.log('🎯 Dropdown z-index:', getComputedStyle(select).zIndex);
    } catch (error) {
        console.error('❌ Error loading applicants:', error);
        document.getElementById('popup_applicant').innerHTML = '<option value="">Error loading applicants</option>';
    }
    
    // Add event listener to update position field when applicant is selected
    document.getElementById('popup_applicant').addEventListener('change', function() {
        const applicantId = this.value;
        console.log('🎯 Applicant selected:', applicantId);
        console.log('🎯 Applicant data available:', window.applicantData[applicantId]);
        
        if (applicantId && window.applicantData && window.applicantData[applicantId]) {
            const position = window.applicantData[applicantId].position;
            const positionField = document.getElementById('popup_position');
            console.log('🎯 Position to fill:', position);
            console.log('🎯 Position field:', positionField);
            
            if (positionField) {
                positionField.value = position || '';
                console.log('✅ Position field updated:', position);
            } else {
                console.error('❌ Position field not found');
            }
        } else {
            console.log('⚠️ No applicant selected or data not available');
        }
    });
}

async function r_saveInterviewPopup() {
    const applicantEl = document.getElementById('popup_applicant');
    const dateEl = document.getElementById('popup_date');
    const timeEl = document.getElementById('popup_time');
    const typeEl = document.getElementById('popup_type');
    const notesEl = document.getElementById('popup_notes');
    const positionEl = document.getElementById('popup_position');
    
    // Check if all elements exist
    if (!applicantEl || !dateEl || !timeEl || !typeEl || !notesEl || !positionEl) {
        console.error('❌ Missing form elements:', {
            applicant: !!applicantEl,
            date: !!dateEl,
            time: !!timeEl,
            type: !!typeEl,
            notes: !!notesEl,
            position: !!positionEl
        });
        alert('Error: Form elements not found. Please try again.');
        return;
    }
    
    const applicantId = applicantEl.value;
    const interviewDate = dateEl.value;
    const interviewTime = timeEl.value;
    const interviewType = typeEl.value;
    const interviewNotes = notesEl.value;
    const position = positionEl.value;
    
    if (!applicantId || !interviewDate || !interviewTime) {
        alert('Please fill in all required fields.');
        return;
    }
    
    try {
        const response = await fetch('../api/simple-api-new.php?action=schedule_interview', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                applicant_id: applicantId,
                interview_date: interviewDate,
                interview_time: interviewTime,
                interview_type: interviewType,
                interview_notes: interviewNotes,
                position: position
            })
        });

        const result = await response.json();
        
        if (result.success) {
            alert('Interview scheduled successfully!');
            r_closeInterviewPopup();
            // Refresh interviews tab with delay to ensure data is saved
            setTimeout(function() {
                // Force refresh interviews list
                if (typeof r_loadInterviews === 'function') {
                    console.log('🔄 Refreshing interviews list...');
                    r_loadInterviews().then(() => {
                        console.log('✅ Interviews list refreshed');
                        // Switch to interviews tab
                        r_tab('interviews');
                    }).catch(error => {
                        console.error('❌ Error refreshing interviews:', error);
                        // Fallback to tab switch
                        r_tab('interviews');
                    });
                } else {
                    // Fallback: just switch to interviews tab
                    console.log('⚠️ r_loadInterviews not found, switching to interviews tab');
                    r_tab('interviews');
                }
            }, 500); // Small delay to ensure database save is complete
        } else {
            alert('Error scheduling interview: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error scheduling interview:', error);
        alert('Error scheduling interview. Please try again.');
    }
}

// Status change popup functions
async function r_openStatusChangePopup(interviewId, currentStatus) {
    console.log('🔄 Opening status change popup for interview:', interviewId);
    
    // Create status change popup
    const popupHtml = `
        <div id="status_change_popup" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
        ">
            <div style="
                background: var(--background, #ffffff);
                border-radius: 12px;
                padding: 24px;
                width: 90%;
                max-width: 400px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            ">
                <h3 style="margin: 0 0 20px 0; color: var(--text-primary, #1f2937); font-size: 18px; font-weight: 600;">Change Interview Status</h3>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary, #1f2937);">Status</label>
                    <select id="status_change_select" style="
                        width: 100%;
                        padding: 10px 12px;
                        border: 1px solid var(--border-color, #e2e8f0);
                        border-radius: 6px;
                        background: var(--background, #f8fafc);
                        color: var(--text-primary, #1f2937);
                        font-size: 14px;
                    ">
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Rescheduled">Rescheduled</option>
                        <option value="No Show">No Show</option>
                        <option value="Hired">Hired</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button onclick="r_saveStatusChange(${interviewId})" style="
                        flex: 1;
                        padding: 10px 20px;
                        background: var(--brand-green, #10b981);
                        color: white;
                        border: none;
                        border-radius: 6px;
                        font-weight: 600;
                        cursor: pointer;
                        font-size: 14px;
                    ">Update Status</button>
                    <button onclick="r_closeStatusChangePopup()" style="
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
        </div>
    `;
    
    // Add popup to body
    document.body.insertAdjacentHTML('beforeend', popupHtml);
    
    // Set current status
    document.getElementById('status_change_select').value = currentStatus;
    
    console.log('✅ Status change popup opened');
}

function r_closeStatusChangePopup() {
    const popup = document.getElementById('status_change_popup');
    if (popup) {
        popup.remove();
        console.log('✅ Status change popup closed');
    }
}

async function r_saveStatusChange(interviewId) {
    const newStatus = document.getElementById('status_change_select').value;
    console.log('🔄 Updating interview status:', interviewId, 'to:', newStatus);
    
    try {
        const response = await fetch('../api/simple-api-new.php?action=update_interview_status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                interview_id: interviewId,
                status: newStatus
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Interview status updated successfully');
            r_closeStatusChangePopup();
            // Refresh interviews list
            if (typeof r_loadInterviews === 'function') {
                await r_loadInterviews();
            }
        } else {
            console.error('❌ Error updating status:', result.error);
            alert('Error updating status: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('❌ Error updating status:', error);
        alert('Error updating status. Please try again.');
    }
}

// Make functions globally available
window.r_openStatusChangePopup = r_openStatusChangePopup;
window.r_closeStatusChangePopup = r_closeStatusChangePopup;
window.r_saveStatusChange = r_saveStatusChange;
