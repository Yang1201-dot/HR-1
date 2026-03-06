// Interview Status Update Function
// This file provides a bulletproof way to update interview status
// It doesn't rely on window object timing issues

function updateInterviewStatusInline() {
  try {
    var interviewId = document.getElementById('r_status_interview_id').value;
    var newStatus = document.getElementById('r_interview_status').value;
    
    if (!interviewId || !newStatus) {
      alert('Please select a status');
      return;
    }
    
    // Show loading state
    var btn = event.target;
    var originalText = btn.textContent;
    btn.textContent = 'Updating...';
    btn.disabled = true;
    
    // Find interview from global INTERVIEWS array
    var interview = null;
    if (typeof window.INTERVIEWS !== 'undefined' && window.INTERVIEWS) {
      interview = window.INTERVIEWS.find(function(i) { 
        return String(i.id) === String(interviewId); 
      });
    }
    
    if (!interview) {
      alert('Interview not found');
      btn.textContent = originalText;
      btn.disabled = false;
      return;
    }
    
    // Extract and clean existing notes
    var existingNotes = interview.notes || '';
    existingNotes = existingNotes.replace(/Status:\s*.+?$/gm, '').trim();
    existingNotes = existingNotes.replace(/Status:\s*.+?\n/gm, '').trim();
    existingNotes = existingNotes.replace(/Status Notes:\s*.+?$/gm, '').trim();
    existingNotes = existingNotes.replace(/Status Notes:\s*.+?\n/gm, '').trim();
    existingNotes = existingNotes.replace(/\n\s*\n\s*\n/gm, '\n\n').trim();
    
    // Add new status to notes
    var updatedNotes = existingNotes + (existingNotes ? '\n\n' : '') + 'Status: ' + newStatus;
    
    // Update interview via API
    fetch('../api/simple-api-new.php?action=save_interview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        id: interviewId,
        applicant_name: interview.applicant_name || '',
        interview_date: interview.interview_date || '',
        interview_time: interview.interview_time || '',
        interview_type: interview.interview_type || '',
        notes: updatedNotes
      })
    })
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      // Restore button state
      btn.textContent = originalText;
      btn.disabled = false;
      
      if (data.success) {
        // Close modal using multiple methods
        var modal = document.getElementById('r_modal_status');
        if (modal) {
          modal.classList.remove('active');
        }
        
        alert('Interview status updated successfully!');
        
        // Reload data and refresh display
        setTimeout(function() {
          // Try multiple reload methods
          if (typeof window.r_loadInterviews === 'function') {
            window.r_loadInterviews().then(function() {
              if (typeof window.r_renderInterviews === 'function') {
                window.r_renderInterviews();
              }
              if (typeof window.r_updateStats === 'function') {
                window.r_updateStats();
              }
            });
          } else {
            // Fallback: force page reload
            window.location.reload();
          }
        }, 200);
      } else {
        alert('Error updating interview status: ' + (data.error || 'Unknown error'));
      }
    })
    .catch(function(e) {
      btn.textContent = originalText;
      btn.disabled = false;
      alert('Error updating interview status');
    });
  } catch(e) {
    console.error('Error in updateInterviewStatusInline:', e);
    alert('Error updating interview status');
  }
}

// Make function globally available
window.updateInterviewStatusInline = updateInterviewStatusInline;
