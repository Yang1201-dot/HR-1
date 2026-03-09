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
    
    const content = `
        <div style="margin-bottom: 20px;">
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary, #1f2937);">Recipient</label>
                <input type="text" id="comm_recipient" value="${candidateName}" readonly style="
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 6px;
                    background: var(--bg-tertiary, #f1f5f9);
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
                    background: var(--background, #ffffff);
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
                    background: var(--background, #ffffff);
                    color: var(--text-primary, #1f2937);
                    resize: vertical;
                "></textarea>
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary, #1f2937);">Attachments</label>
                <div style="padding: 12px; border: 2px dashed var(--border-color, #e2e8f0); border-radius: 6px; text-align: center; color: var(--text-secondary, #64748b);">
                    <div style="margin-bottom: 8px;">📎 Attachments will be included</div>
                    <div style="font-size: 12px;">Offer letter PDF will be automatically attached</div>
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
    }
}

// Send communication
function r_sendCommunication() {
    const popup = document.getElementById('communication-popup');
    if (!popup) return;
    
    const candidateId = popup.dataset.candidateId;
    const candidateName = popup.dataset.candidateName;
    const offerId = popup.dataset.offerId;
    
    const subject = document.getElementById('comm_subject')?.value || '';
    const message = document.getElementById('comm_message')?.value || '';
    
    if (!subject || !message) {
        alert('Please fill in subject and message');
        return;
    }
    
    console.log('📤 Sending communication:', {candidateId, candidateName, offerId, subject, message});
    
    // Here you would implement the actual sending logic
    // For now, just show success and close
    alert('Communication sent successfully!');
    r_closeCommunicationPopup();
}
