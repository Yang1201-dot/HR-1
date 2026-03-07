-- Simple script to drop the status column from interviews table
ALTER TABLE interviews DROP COLUMN IF EXISTS status;
