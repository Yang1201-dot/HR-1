-- Simple script to clean Status text from notes
UPDATE interviews SET notes = REPLACE(notes, 'Status: Scheduled', '') WHERE notes LIKE '%Status: Scheduled%';
UPDATE interviews SET notes = REPLACE(notes, 'Status: Passed', '') WHERE notes LIKE '%Status: Passed%';
UPDATE interviews SET notes = REPLACE(notes, 'Status: Failed', '') WHERE notes LIKE '%Status: Failed%';
UPDATE interviews SET notes = REPLACE(notes, 'Status: On-going', '') WHERE notes LIKE '%Status: On-going%';

-- Clean up any remaining newlines
UPDATE interviews SET notes = TRIM(notes) WHERE notes IS NOT NULL;

-- Verify changes
SELECT id, notes FROM interviews WHERE notes IS NOT NULL AND notes != '' LIMIT 5;
