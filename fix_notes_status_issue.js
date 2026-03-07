// COMPLETE FIXES FOR NOTES AND STATUS ISSUES
// Replace these functions in recruitment.html

// 1. FIX r_saveInterview FUNCTION (around line 3100)
// Replace the entire status insertion block with this:

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

// 2. FIX r_saveInterviewStatus FUNCTION (around line 3389)
// Remove all status manipulation in notes:

/*
    // Update interview status directly via new API
    const response = await fetch('../api/simple-api-new.php?action=update_interview_status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        id: interviewId,
        status: newStatus
      })
    });
*/

// 3. FIX r_editInterview FUNCTION (around line 3287)
// Remove status cleaning from notes:

/*
    // Fill other fields
    var cleanNotes = interview.notes || '';
    var pos = document.getElementById('r_interview_position');
    if (pos) pos.value = currentPosition || interview.position || '';
    var dt  = document.getElementById('r_interview_date');
    if (dt)  dt.value  = interview.interview_date  || '';
    var tm  = document.getElementById('r_interview_time');
    if (tm)  tm.value  = interview.interview_time  || '';
    var nt  = document.getElementById('r_interview_notes');
    if (nt)  nt.value  = cleanNotes;
*/

// 4. FIX r_renderInterviews FUNCTION (around line 2124)
// Remove status cleaning from display notes:

/*
    var interviewNotes = interview.notes || '';
    var displayNotes = interviewNotes || '';
    
    // Only show notes section if there are actual user notes
    var showNotes = displayNotes && displayNotes.trim().length > 0;
*/

// 5. CLEAN DATABASE NOTES COLUMN
// Run this SQL to remove all "Status:" text from existing notes:

/*
UPDATE interviews 
SET notes = REPLACE(
    REPLACE(
        REPLACE(
            REPLACE(notes, '\nStatus: Scheduled', ''),
            '\n\nStatus: Scheduled', ''
        ),
        '\nStatus: ', ''
    ),
    '\n\nStatus: ', ''
)
WHERE notes LIKE '%Status:%';
*/

// 6. VERIFY NO MORE STATUS INSERTIONS
// Check these functions don't add status:
// - r_saveInterview: should only save raw notes
// - r_saveInterviewStatus: should only update interview_status field
// - r_editInterview: should not clean status from notes
// - r_renderInterviews: should display raw notes
