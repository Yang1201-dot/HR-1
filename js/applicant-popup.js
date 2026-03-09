// Applicant details popup function that avoids modal conflicts
function am_openApplicantPopup() {
    // Create popup content
    const popupContent = `
        <div id="applicant-popup" style="
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
            min-width: 600px;
            max-width: 800px;
            width: 90vw;
            max-height: 80vh;
            overflow-y: auto;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; color: var(--text-primary, #1f2937);">Applicant Details</h3>
                <button onclick="am_closeApplicantPopup()" style="
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: var(--text-secondary, #64748b);
                    padding: 5px;
                ">&times;</button>
            </div>
            
            <div id="applicant-popup-content">
                <!-- Content will be loaded here -->
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                <button onclick="am_openAssessmentForApplicant(document.getElementById('applicant-popup').dataset.applicantId, document.getElementById('applicant-popup').dataset.applicantName)" style="
                    background: var(--brand-green, #2ca078);
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                ">Assess Applicant</button>
                <button onclick="am_closeApplicantPopup()" style="
                    background: var(--bg-tertiary, #f1f5f9);
                    color: var(--text-secondary, #64748b);
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                ">Close</button>
            </div>
        </div>
    `;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'applicant-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 999998;
    `;
    overlay.onclick = am_closeApplicantPopup;
    
    // Add popup and overlay to body
    document.body.appendChild(overlay);
    document.body.insertAdjacentHTML('beforeend', popupContent);
    
    console.log('✅ Applicant popup opened');
}

// Close applicant popup
function am_closeApplicantPopup() {
    const popup = document.getElementById('applicant-popup');
    const overlay = document.getElementById('applicant-overlay');
    
    if (popup) popup.remove();
    if (overlay) overlay.remove();
    
    console.log('✅ Applicant popup closed');
}

// Load applicant details into popup
function am_loadApplicantDetails(applicantId) {
    console.log('🔍 Loading applicant details for ID:', applicantId);
    
    // Find applicant data from AM array (assuming it's available globally)
    const applicant = window.AM ? window.AM.find(a => String(a.id) === String(applicantId)) : null;
    
    if (!applicant) {
        console.error('❌ Applicant not found:', applicantId);
        return;
    }
    
    console.log('📊 Found applicant:', applicant);
    
    // Find assessment data
    const assessment = window.ASSESS ? window.ASSESS.find(ass => String(ass.applicant_id) === String(applicantId) || parseInt(ass.applicant_id) === parseInt(applicantId)) : null;
    console.log('📊 Found assessment:', assessment);
    
    // Debug assessment lookup
    if (window.ASSESS) {
        console.log('🔍 Full ASSESS array:', window.ASSESS);
        window.ASSESS.forEach((ass, index) => {
            console.log(`Assessment ${index}:`, ass);
            console.log(`  - applicant_id: ${ass.applicant_id} (type: ${typeof ass.applicant_id})`);
            console.log(`  - tech: ${ass.tech}, comm: ${ass.comm}, prob: ${ass.prob}, fit: ${ass.fit}`);
            console.log(`  - matches: ${String(ass.applicant_id) === String(applicantId) || parseInt(ass.applicant_id) === parseInt(applicantId)}`);
        });
    }
    
    // Get files data with proper categorization
    const files = window.FILES ? (window.FILES[parseInt(applicantId)] || {}) : {};
    console.log('📊 Found files:', files);
    
    // File categories for proper display
    const fileCategories = [
        { key: 'resume', label: 'Resume', icon: '📄' },
        { key: 'birth', label: 'Birth Certificate', icon: '📋' },
        { key: 'diploma', label: 'Diploma/TOR', icon: '🎓' },
        { key: 'cover', label: 'Cover Letter', icon: '✉️' }
    ];
    
    // Build content HTML
    let content = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
            <div>
                <h4 style="margin: 0 0 16px 0; color: var(--text-primary);">Personal Information</h4>
                <div style="background: var(--background); border: 1px solid var(--border-color); border-radius: 10px; padding: 16px;">
                    <div style="margin-bottom: 12px;"><strong style="color: var(--text-secondary);">Name:</strong> <span style="color: var(--text-primary);">${(applicant.first_name || '') + ' ' + (applicant.last_name || '')}</span></div>
                    <div style="margin-bottom: 12px;"><strong style="color: var(--text-secondary);">Email:</strong> <span style="color: var(--text-primary);">${applicant.email || ''}</span></div>
                    <div style="margin-bottom: 12px;"><strong style="color: var(--text-secondary);">Phone:</strong> <span style="color: var(--text-primary);">${applicant.phone || ''}</span></div>
                    <div><strong style="color: var(--text-secondary);">Applied:</strong> <span style="color: var(--text-primary);">${(applicant.application_date || '').split(' ')[0]}</span></div>
                </div>
            </div>
            <div>
                <h4 style="margin: 0 0 16px 0; color: var(--text-primary);">Application Details</h4>
                <div style="background: var(--background); border: 1px solid var(--border-color); border-radius: 10px; padding: 16px;">
                    <div style="margin-bottom: 12px;"><strong style="color: var(--text-secondary);">Position:</strong> <span style="color: var(--text-primary);">${applicant.position || ''}</span></div>
                    <div style="margin-bottom: 12px;"><strong style="color: var(--text-secondary);">Department:</strong> <span style="color: var(--text-primary);">${applicant.department || ''}</span></div>
                    <div style="margin-bottom: 12px;">
                        <strong style="color: var(--text-secondary);">Status:</strong> 
                        <select id="applicant_status_${applicant.id}" style="margin-left: 8px; padding: 4px 8px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--background); color: var(--text-primary);">
                            <option value="new" ${(applicant.status || 'new').toLowerCase().replace(/ /g, '-') === 'new' ? 'selected' : ''}>New</option>
                            <option value="under-review" ${(applicant.status || 'new').toLowerCase().replace(/ /g, '-') === 'under-review' ? 'selected' : ''}>Under Review</option>
                            <option value="shortlisted" ${(applicant.status || 'new').toLowerCase().replace(/ /g, '-') === 'shortlisted' ? 'selected' : ''}>Shortlisted</option>
                            <option value="hired" ${(applicant.status || 'new').toLowerCase().replace(/ /g, '-') === 'hired' ? 'selected' : ''}>Hired</option>
                            <option value="rejected" ${(applicant.status || 'new').toLowerCase().replace(/ /g, '-') === 'rejected' ? 'selected' : ''}>Rejected</option>
                        </select>
                        <input type="button" value="Update Status" onclick="console.log('Direct click!'); var status=document.getElementById('applicant_status_${applicant.id}').value; console.log('Status:', status); fetch('../api/simple-api-new.php?action=update_status', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:'id=${applicant.id}&status='+status}).then(r=>r.json()).then(d=>{console.log('Response:', d); if(d.success){console.log('SUCCESS! Status updated!'); location.reload();}else{console.error('Failed:', d.error); alert('Failed to update status: ' + d.error);}}).catch(e=>console.error('Error:', e))" style="margin-left: 64px; margin-top: 8px; cursor: pointer; padding: 5px 12px; border: none; border-radius: 7px; font-size: 12px; font-weight: 600; background: rgba(44,160,120,.12); color: var(--brand-green); transition: all .2s;" onmouseover="this.style.background='var(--brand-green)'; this.style.color='#fff';" onmouseout="this.style.background='rgba(44,160,120,.12)'; this.style.color='var(--brand-green)';">
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Application message
    if (applicant.message) {
        content += `
            <div style="margin-bottom: 24px;">
                <h4 style="margin: 0 0 12px 0; color: var(--text-primary);">Application Message</h4>
                <div style="background: var(--background); border: 1px solid var(--border-color); border-radius: 10px; padding: 16px;">
                    <p style="margin: 0; color: var(--text-secondary); line-height: 1.6;">${applicant.message}</p>
                </div>
            </div>
        `;
    }
    
    // Files section
    content += `
        <div style="margin-bottom: 24px;">
            <h4 style="margin: 0 0 16px 0; color: var(--text-primary);">Submitted Documents</h4>
    `;
    
    if (Object.keys(files).length > 0) {
        // Group and display files by category
        fileCategories.forEach(category => {
            if (files[category.key]) {
                const file = files[category.key];
                content += `
                    <div style="margin-bottom: 20px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                            <span style="font-size: 16px;">${category.icon}</span>
                            <h5 style="margin: 0; color: var(--text-primary); font-size: 14px; font-weight: 600;">${category.label}</h5>
                        </div>
                        <div style="background: var(--background); border: 1px solid var(--border-color); border-radius: 10px; padding: 12px;">
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <div style="font-weight: 600; color: var(--text-primary);">${file.fileName || ''}</div>
                                    <div style="font-size: 11px; color: var(--text-secondary);">${file.fileSize || ''} &bull; ${file.uploadedAt || ''}</div>
                                </div>
                                <div style="display: flex; gap: 6px;">
                                    <button onclick="window.am_viewFile('${applicantId}', '${category.key}')" style="
                                        background: var(--brand-green, #2ca078);
                                        color: white;
                                        border: none;
                                        padding: 6px 12px;
                                        border-radius: 6px;
                                        cursor: pointer;
                                        font-size: 12px;
                                        font-weight: 600;
                                    ">View</button>
                                    <button onclick="window.am_downloadFile('${applicantId}', '${category.key}')" style="
                                        background: var(--bg-tertiary, #f1f5f9);
                                        color: var(--text-secondary, #64748b);
                                        border: none;
                                        padding: 6px 12px;
                                        border-radius: 6px;
                                        cursor: pointer;
                                        font-size: 12px;
                                        font-weight: 600;
                                    ">Download</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        });
    } else {
        content += '<p style="color: var(--text-secondary); font-style: italic;">No documents submitted yet.</p>';
    }
    
    content += '</div>';
    
    // Assessment section
    content += `
        <div style="margin-bottom: 24px;">
            <h4 style="margin: 0 0 16px 0; color: var(--text-primary);">Qualification Assessment</h4>
    `;
    
    if (assessment) {
        const avg = Math.round((parseInt(assessment.tech || 0) + parseInt(assessment.comm || 0) + parseInt(assessment.prob || 0) + parseInt(assessment.fit || 0)) / 4 * 10) / 10;
        
        content += `
            <div style="background: var(--surface); border: 2px solid var(--border-color); border-radius: 10px; padding: 16px;">
                <div style="margin-bottom: 12px;">
                    <div style="font-weight: 700; font-size: 16px; color: var(--text-primary);">Assessment Results</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">Assessed on ${new Date(assessment.created_at).toLocaleString()}</div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-bottom: 16px;">
                    <div style="text-align: center; padding: 8px; background: var(--background); border-radius: 6px;">
                        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Technical</div>
                        <div style="font-size: 18px; font-weight: 700; color: var(--text-primary);">${assessment.tech || 5}</div>
                    </div>
                    <div style="text-align: center; padding: 8px; background: var(--background); border-radius: 6px;">
                        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Communication</div>
                        <div style="font-size: 18px; font-weight: 700; color: var(--text-primary);">${assessment.comm || 5}</div>
                    </div>
                    <div style="text-align: center; padding: 8px; background: var(--background); border-radius: 6px;">
                        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Problem Solving</div>
                        <div style="font-size: 18px; font-weight: 700; color: var(--text-primary);">${assessment.prob || 5}</div>
                    </div>
                    <div style="text-align: center; padding: 8px; background: var(--background); border-radius: 6px;">
                        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Cultural Fit</div>
                        <div style="font-size: 18px; font-weight: 700; color: var(--text-primary);">${assessment.fit || 5}</div>
                    </div>
                    <div style="text-align: center; padding: 8px; background: var(--brand-green, #2ca078); border-radius: 6px;">
                        <div style="font-size: 12px; color: white; margin-bottom: 4px;">Average</div>
                        <div style="font-size: 18px; font-weight: 700; color: white;">${avg}</div>
                    </div>
                </div>
                ${assessment.notes ? `<div style="padding: 12px; background: var(--background); border-radius: 6px; font-size: 13px;"><strong style="color: var(--text-primary); display: block; margin-bottom: 8px;">Notes:</strong> ${assessment.notes}</div>` : ''}
            </div>
        `;
    } else {
        content += `
            <div style="background: var(--background); border: 1px solid var(--border-color); border-radius: 10px; padding: 16px; text-align: center;">
                <p style="color: var(--text-secondary); margin: 0 0 12px 0;">No assessment completed yet.</p>
                <button onclick="am_openAssessmentForApplicant('${applicantId}', '${(applicant.first_name || '') + ' ' + (applicant.last_name || '')}')" style="
                    background: var(--brand-green, #2ca078);
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                ">Start Assessment</button>
            </div>
        `;
    }
    
    content += '</div>';
    
    // Set content
    const contentDiv = document.getElementById('applicant-popup-content');
    if (contentDiv) {
        contentDiv.innerHTML = content;
    }
    
    // Set dataset for buttons
    const popup = document.getElementById('applicant-popup');
    if (popup) {
        popup.dataset.applicantId = applicantId;
        popup.dataset.applicantName = (applicant.first_name || '') + ' ' + (applicant.last_name || '');
    }
}

// Open applicant popup with data
function am_openApplicantDetailsPopup(applicantId, applicantName) {
    console.log('🎯 Opening applicant details for:', { applicantId, applicantName });
    
    // Open popup first
    am_openApplicantPopup();
    
    // Load data after popup is created
    setTimeout(() => {
        am_loadApplicantDetails(applicantId);
    }, 100);
}
