-- Clean up interviews table to use only interview_status column
-- Run this script to remove the redundant status column

-- First, copy any data from status column to interview_status column (if interview_status is empty)
UPDATE interviews 
SET interview_status = status 
WHERE interview_status IS NULL OR interview_status = '' OR interview_status = 'Scheduled';

-- Drop the redundant status column
ALTER TABLE interviews DROP COLUMN status;

-- Verify the table structure
DESCRIBE interviews;
