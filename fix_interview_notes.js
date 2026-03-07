// Fix for interview notes - remove automatic "Status: Scheduled" insertion
// Replace these functions in recruitment.html

// 1. In r_saveInterview function, replace the status insertion logic with:
/*
    var finalNotes = notes; // Use notes as-is without adding status

    var apiPayload = {
      id: interviewId,
      applicant_name: applicantName,
      applicant_id: applicantId,
      interview_date: date,
      interview_time: time,
      interview_type: type,
      notes: finalNotes
    };
*/

// 2. In r_saveInterviewStatus function, remove the notes manipulation:
/*
    // Remove this entire section:
    // Extract existing notes and update status
    var existingNotes = interview.notes || '';
    
    // Remove existing status from notes
    existingNotes = existingNotes.replace(/Status:\s*.+?$/gm, '').trim();
    existingNotes = existingNotes.replace(/Status:\s*.+?\n/gm, '').trim();
    existingNotes = existingNotes.replace(/Status Notes:\s*.+?$/gm, '').trim();
    existingNotes = existingNotes.replace(/Status Notes:\s*.+?\n/gm, '').trim();
    existingNotes = existingNotes.replace(/\n\s*\n\s*\n/gm, '\n\n').trim();
    
    // Add new status to notes
    var updatedNotes = existingNotes + (existingNotes ? '\n\n' : '') + 'Status: ' + newStatus;
*/

// 3. In r_editInterview function, remove status cleaning from notes:
/*
    // Replace this line:
    var cleanNotes = (interview.notes || '').replace(/Status:\s*.+?(\n|$)/gm, '').trim();
    
    // With:
    var cleanNotes = interview.notes || '';
*/

// 4. In r_renderInterviews function, remove status cleaning from display notes:
/*
    // Remove these lines:
    var displayNotes = interviewNotes.replace(/Status:\s*.+?$/gm, '').trim();
    displayNotes = displayNotes.replace(/Status:\s*.+?\n/gm, '').trim();
    displayNotes = displayNotes.replace(/Status Notes:\s*.+?$/gm, '').trim();
    displayNotes = displayNotes.replace(/Status Notes:\s*.+?\n/gm, '').trim();
    displayNotes = displayNotes.replace(/\n\s*\n\s*\n/gm, '\n\n').trim();
    
    // Replace with:
    var displayNotes = interviewNotes || '';
*/

// 5. In r_changeInterviewStatus function, use only interview_status field:
/*
    // Replace the status extraction with:
    var currentStatus = interview.interview_status || 'Scheduled';
*/
