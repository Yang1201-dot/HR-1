-- Check current table structure
DESCRIBE interviews;

-- Show current row size
SELECT 
  table_name,
  round(((data_length + index_length) / 1024 / 1024), 2) as "Size (MB)"
FROM information_schema.TABLES 
WHERE table_schema = "hr_management" 
  AND table_name = "interviews";

-- Alternative: Instead of dropping the column, just set it to NULL for all existing records
UPDATE interviews SET status = NULL WHERE status IS NOT NULL;
