-- Set all status values to NULL to avoid conflicts
-- This is safer than dropping the column due to row size limitations
UPDATE interviews SET status = NULL WHERE status IS NOT NULL;

-- Verify the changes
SELECT id, status, interview_status FROM interviews LIMIT 5;
