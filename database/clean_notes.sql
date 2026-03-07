-- Clean all "Status:" text from existing notes in interviews table
-- This will remove any automatic status insertions that were added

UPDATE interviews 
SET notes = TRIM(
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

-- Verify the changes
SELECT id, notes FROM interviews WHERE notes LIKE '%Status:%' LIMIT 5;

-- Also ensure interview_status has correct values for existing records
UPDATE interviews 
SET interview_status = CASE 
    WHEN notes LIKE '%Status: Passed%' THEN 'Passed'
    WHEN notes LIKE '%Status: Failed%' THEN 'Failed' 
    WHEN notes LIKE '%Status: On-going%' THEN 'On-going'
    WHEN notes LIKE '%Status: Scheduled%' THEN 'Scheduled'
    ELSE interview_status
END
WHERE interview_status IS NULL OR interview_status = '';
