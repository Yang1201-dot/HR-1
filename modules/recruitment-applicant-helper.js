// Helper function to populate applicant dropdown with names and positions
function r_populateApplicantDropdown() {
  var dropdown = document.getElementById('r_interview_applicant');
  if (!dropdown) return;
  
  // Load applications to populate dropdown
  fetch('../api/simple-api-new.php?action=get_applications')
    .then(response => response.json())
    .then(data => {
      if (!data.error && data.length > 0) {
        // Clear existing options except the first one
        dropdown.innerHTML = '<option value="">Select an applicant...</option>';
        
        // Add applicants to dropdown with their positions
        data.forEach(function(applicant) {
          var fullName = (applicant.first_name || '') + ' ' + (applicant.last_name || '');
          var position = applicant.position || 'No position specified';
          var optionText = fullName + ' - ' + position;
          
          // Debug log to check what's happening
          console.log('Applicant:', applicant);
          console.log('Full name:', fullName);
          console.log('Position:', position);
          
          var option = document.createElement('option');
          option.value = applicant.id; // Use applicant ID as value
          option.textContent = optionText;
          option.dataset.position = position;
          option.dataset.applicantId = applicant.id; // Store applicant ID
          option.dataset.applicantName = fullName; // Store applicant name
          
          dropdown.appendChild(option);
        });
        
        console.log('Applicant dropdown populated with', data.length, 'applicants');
      } else {
        console.log('No applications found');
        dropdown.innerHTML = '<option value="">No applicants available</option>';
      }
    })
    .catch(error => {
      console.error('Error loading applications:', error);
      dropdown.innerHTML = '<option value="">Error loading applicants</option>';
    });
}

// Helper function to auto-populate job position when applicant is selected
function r_populateJobPosition() {
  var dropdown = document.getElementById('r_interview_applicant');
  var positionField = document.getElementById('r_interview_position');
  
  if (!dropdown || !positionField) return;
  
  var selectedOption = dropdown.options[dropdown.selectedIndex];
  if (selectedOption && selectedOption.dataset.position) {
    positionField.value = selectedOption.dataset.position;
    console.log('Auto-populated job position:', selectedOption.dataset.position);
  } else {
    positionField.value = '';
  }
}

// Add event listener to applicant dropdown
document.addEventListener('DOMContentLoaded', function() {
  var applicantDropdown = document.getElementById('r_interview_applicant');
  if (applicantDropdown) {
    // Populate dropdown when page loads
    r_populateApplicantDropdown();
    
    // Update job position when selection changes
    applicantDropdown.addEventListener('change', function() {
      r_populateJobPosition();
    });
  }
});

// Also populate dropdown when interview modal is opened
function r_openInterview() { 
  document.getElementById('r_interview_modal_title').textContent = 'Schedule Interview';
  r_populateApplicantDropdown(); // Refresh dropdown each time modal opens
  r_open('r_modal_interview'); 
}
