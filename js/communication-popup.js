// Communication Popup Functions - Following interview popup pattern

// Open communication popup
function r_openCommunicationPopup(candidateId, candidateName, offerId) {
    console.log('🎯 Opening communication popup for:', {candidateId, candidateName, offerId});
    
    // Close any existing popup
    r_closeCommunicationPopup();
    
    // Create popup container
    const popup = document.createElement('div');
    popup.id = 'communication-popup';
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--surface, #ffffff);
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
    `;
    
    popup.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: var(--text-primary, #1f2937);">Send Communication</h3>
            <button onclick="r_closeCommunicationPopup()" style="
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: var(--text-secondary, #64748b);
                padding: 5px;
            ">&times;</button>
        </div>
        
        <div id="communication-popup-content">
            <!-- Content will be loaded here -->
        </div>
        
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
            <button onclick="r_closeCommunicationPopup()" style="
                background: var(--surface, #f8fafc);
                color: var(--text-primary, #1f2937);
                border: 1px solid var(--border-color, #e2e8f0);
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s ease;
            " onmouseover="this.style.background='var(--bg-secondary, #e2e8f0)'; this.style.color='var(--text-primary, #1f2937)';" onmouseout="this.style.background='var(--surface, #f8fafc)'; this.style.color='var(--text-primary, #1f2937)';">Cancel</button>
            <button onclick="r_sendCommunication()" style="
                background: var(--brand-green, #2ca078);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s ease;
            " onmouseover="this.style.background='var(--brand-green-hover, #23a068)';" onmouseout="this.style.background='var(--brand-green, #2ca078)';">Send Communication</button>
        </div>
    `;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'communication-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9999;
    `;
    overlay.onclick = r_closeCommunicationPopup;
    
    // Add to page
    document.body.appendChild(overlay);
    document.body.appendChild(popup);
    
    console.log('✅ Communication popup opened');
    
    // Load content after popup is created
    setTimeout(() => {
        r_loadCommunicationContent(candidateId, candidateName, offerId);
    }, 100);
}

// Close communication popup
function r_closeCommunicationPopup() {
    const popup = document.getElementById('communication-popup');
    const overlay = document.getElementById('communication-overlay');
    
    if (popup) popup.remove();
    if (overlay) overlay.remove();
    
    console.log('✅ Communication popup closed');
}

// Load communication content
function r_loadCommunicationContent(candidateId, candidateName, offerId) {
    console.log('🔍 Loading communication content for:', {candidateId, candidateName, offerId});
    console.log('📋 Available applicants:', window.AM);
    console.log('📋 Available offers:', window.OFFERS);
    
    const recipientValue = candidateName || '';
    const isFromOfferCard = candidateName !== '';
    
    // Get email with debugging
    const emailValue = isFromOfferCard ? r_findCandidateEmail(candidateName, offerId) : '';
    console.log('📧 Email value:', emailValue);
    
    const content = `
        <div style="margin-bottom: 20px;">
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary, #1f2937);">Recipient ${!isFromOfferCard ? '<span style="color: red;">*</span>' : ''}</label>
                <input type="text" id="comm_recipient" value="${recipientValue}" ${isFromOfferCard ? 'readonly' : ''} placeholder="${isFromOfferCard ? 'Recipient pre-filled' : 'Enter recipient name...'}" style="
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 6px;
                    background: ${isFromOfferCard ? 'var(--surface, #f8fafc)' : 'var(--surface, #f8fafc)'};
                    color: var(--text-primary, #1f2937);
                ">
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary, #1f2937);">Email ${!isFromOfferCard ? '<span style="color: red;">*</span>' : ''}</label>
                <input type="email" id="comm_email" value="${isFromOfferCard ? r_findCandidateEmail(candidateName, offerId) : ''}" ${isFromOfferCard ? 'readonly' : ''} placeholder="${isFromOfferCard ? 'Email auto-filled' : 'Enter email address...'}" style="
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 6px;
                    background: ${isFromOfferCard ? 'var(--surface, #f8fafc)' : 'var(--surface, #f8fafc)'};
                    color: var(--text-primary, #1f2937);
                ">
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary, #1f2937);">Subject</label>
                <input type="text" id="comm_subject" placeholder="Enter subject..." style="
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 6px;
                    background: var(--surface, #f8fafc);
                    color: var(--text-primary, #1f2937);
                ">
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary, #1f2937);">Message</label>
                <textarea id="comm_message" placeholder="Enter your message..." rows="6" style="
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 6px;
                    background: var(--surface, #f8fafc);
                    color: var(--text-primary, #1f2937);
                    resize: vertical;
                "></textarea>
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary, #1f2937);">Attachments</label>
                <div style="padding: 12px; border: 2px dashed var(--border-color, #e2e8f0); border-radius: 6px; text-align: center; color: var(--text-secondary, #64748b);">
                    <div style="margin-bottom: 8px;">📎 ${isFromOfferCard ? 'Offer letter PDF will be automatically attached' : 'No attachments will be included'}</div>
                    <div style="font-size: 12px;">${isFromOfferCard ? 'Click "Send Communication" to deliver with PDF attachment' : 'Use "Send To" button from offer cards to include PDF attachments'}</div>
                </div>
            </div>
        </div>
    `;
    
    // Set content
    const contentDiv = document.getElementById('communication-popup-content');
    if (contentDiv) {
        contentDiv.innerHTML = content;
    }
    
    // Store data for sending
    const popup = document.getElementById('communication-popup');
    if (popup) {
        popup.dataset.candidateId = candidateId;
        popup.dataset.candidateName = candidateName;
        popup.dataset.offerId = offerId;
        popup.dataset.isFromOfferCard = isFromOfferCard;
    }
}

// Send communication
function r_sendCommunication() {
    const popup = document.getElementById('communication-popup');
    if (!popup) return;
    
    const candidateId = popup.dataset.candidateId;
    let candidateName = popup.dataset.candidateName;
    const offerId = popup.dataset.offerId;
    const isFromOfferCard = popup.dataset.isFromOfferCard === 'true';
    
    const subject = document.getElementById('comm_subject')?.value || '';
    const message = document.getElementById('comm_message')?.value || '';
    
    // Get recipient value (might be empty if from Send Communications button)
    const recipientInput = document.getElementById('comm_recipient');
    const recipient = recipientInput?.value || '';
    
    // Get email value
    const emailInput = document.getElementById('comm_email');
    const email = emailInput?.value || '';
    
    // Validate recipient if not from offer card
    if (!isFromOfferCard && !recipient.trim()) {
        alert('Please enter a recipient name');
        return;
    }
    
    // Validate email if not from offer card
    if (!isFromOfferCard && !email.trim()) {
        alert('Please enter an email address');
        return;
    }
    
    // Basic email validation
    if (email && !email.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Use recipient as candidateName if not from offer card
    if (!isFromOfferCard) {
        candidateName = recipient;
    }
    
    // Allow sending even with empty subject/message (optional fields)
    console.log('📤 Sending communication:', {candidateId, candidateName, offerId, subject, message, email, isFromOfferCard});
    
    // Find the offer to get PDF content (only if from offer card)
    let pdfAttachment = null;
    if (isFromOfferCard && offerId) {
        const offer = window.OFFERS ? window.OFFERS.find(o => String(o.id) === String(offerId)) : null;
        if (offer && offer.pdfGenerated) {
            pdfAttachment = {
                name: `Offer_Letter_${candidateName.replace(/\s+/g, '_')}.pdf`,
                content: r_generateOfferPDFContent(offer.terms)
            };
        }
    }
    
    // Here you would implement actual sending logic
    // For now, just show success and close
    const attachmentInfo = pdfAttachment ? 'Yes (' + pdfAttachment.name + ')' : 'No';
    alert('Communication sent successfully!\n\nRecipient: ' + candidateName + '\nEmail: ' + email + '\nSubject: ' + (subject || '(no subject)') + '\nMessage: ' + (message || '(no message)') + '\nPDF Attachment: ' + attachmentInfo);
    r_closeCommunicationPopup();
    
    // Add to communications table (simulate)
    const communication = {
        id: Date.now(),
        recipient: candidateName,
        email: email,
        subject: subject || 'No Subject',
        message: message || 'No Message',
        sentAt: new Date().toLocaleString(),
        hasAttachment: !!pdfAttachment,
        attachmentName: pdfAttachment?.name || null,
        offerId: offerId
    };
    
    // Add to global communications array
    if (!window.COMM) window.COMM = [];
    window.COMM.unshift(communication);
    
    // Refresh communications display
    if (typeof r_renderCommunications === 'function') {
        r_renderCommunications();
    }
}

// Find candidate email from applicants array
function r_findCandidateEmail(candidateName, offerId) {
    console.log('🔍 Looking for email for candidate:', candidateName, 'offerId:', offerId);
    
    // Try to find email from global applicants array
    if (window.AM && Array.isArray(window.AM)) {
        console.log('📋 Applicants array found with', window.AM.length, 'applicants');
        
        const applicant = window.AM.find(function(app) {
            const fullName = (app.fname + ' ' + app.lname).trim();
            console.log('🔍 Checking applicant:', fullName, 'against:', candidateName);
            return fullName === candidateName || app.fname === candidateName || app.lname === candidateName;
        });
        
        console.log('👤 Found applicant:', applicant);
        
        if (applicant && applicant.email) {
            console.log('✅ Found email:', applicant.email);
            return applicant.email;
        } else if (applicant) {
            console.log('❌ Applicant found but no email field');
        }
    } else {
        console.log('❌ Applicants array not found or not array');
    }
    
    // Try to find from offer data if available
    if (window.OFFERS && offerId) {
        const offer = window.OFFERS.find(function(o) { return String(o.id) === String(offerId); });
        console.log('💼 Found offer:', offer);
        if (offer && offer.candidateEmail) {
            console.log('✅ Found email from offer:', offer.candidateEmail);
            return offer.candidateEmail;
        }
    }
    
    // Return placeholder if no email found
    console.log('❌ No email found, using placeholder');
    return 'no-email@example.com';
}

// Generate PDF content for offer
function r_generateOfferPDFContent(offerData) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Employment Offer - ${offerData.candidateName}</title>
            <style>
                body { font-family: 'Times New Roman', serif; margin: 20px; }
                .offer-document { 
                    background: white; 
                    border: none; 
                    padding: 0; 
                    max-width: 800px; 
                    margin: 0 auto; 
                }
                .offer-header { text-align: center; margin-bottom: 40px; }
                .offer-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                .offer-date { font-size: 14px; color: #666; }
                .offer-content { line-height: 1.6; }
                .offer-section { margin-bottom: 30px; }
                .offer-field { margin-bottom: 15px; }
                .offer-label { font-weight: bold; display: inline-block; width: 150px; }
                .offer-signature { margin-top: 60px; text-align: right; }
                @media print { body { margin: 0; }
            </style>
        </head>
        <body>
            <div class="offer-document">
                <div class="offer-header">
                    <div class="offer-title">EMPLOYMENT OFFER LETTER</div>
                    <div class="offer-date">Date: ${new Date().toLocaleDateString()}</div>
                </div>
                
                <div class="offer-content">
                    <div class="offer-section">
                        <p>Dear ${offerData.candidateName},</p>
                        <p>We are pleased to offer you the position of <strong>${offerData.position}</strong> at our company. This offer is contingent upon your acceptance of the terms and conditions outlined below.</p>
                    </div>
                    
                    <div class="offer-section">
                        <h3>Employment Details:</h3>
                        <div class="offer-field"><span class="offer-label">Position:</span> ${offerData.position}</div>
                        <div class="offer-field"><span class="offer-label">Department:</span> ${offerData.department}</div>
                        <div class="offer-field"><span class="offer-label">Start Date:</span> ${offerData.startDate}</div>
                        <div class="offer-field"><span class="offer-label">Salary:</span> ${offerData.salary}</div>
                        <div class="offer-field"><span class="offer-label">Employment Type:</span> ${offerData.employmentType}</div>
                        <div class="offer-field"><span class="offer-label">Schedule:</span> ${offerData.schedule}</div>
                        <div class="offer-field"><span class="offer-label">Location:</span> ${offerData.location}</div>
                        <div class="offer-field"><span class="offer-label">Reporting To:</span> ${offerData.reporting}</div>
                        ${offerData.benefits ? `<h3>Benefits:</h3><p>${offerData.benefits}</p>` : ''}
                        ${offerData.probation ? `<h3>Probation Period:</h3><p>${offerData.probation}</p>` : ''}
                        ${offerData.conditions ? `<h3>Conditions:</h3><p>${offerData.conditions}</p>` : ''}
                        ${offerData.validity ? `<h3>Offer Validity:</h3><p>${offerData.validity}</p>` : ''}
                    </div>
                    
                    <div class="offer-section">
                        <p>Please review this offer carefully and indicate your acceptance by signing below. We look forward to having you join our team.</p>
                    </div>
                    
                    <div class="offer-signature">
                        <p>Sincerely,</p>
                        <p>HR Department</p>
                        <p>Company Name</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
}
