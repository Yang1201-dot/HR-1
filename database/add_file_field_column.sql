-- Add file_field column to applicant_files table
ALTER TABLE applicant_files ADD COLUMN file_field VARCHAR(50) AFTER file_path;

-- Update existing records to have default values (optional)
UPDATE applicant_files SET file_field = 'resume' WHERE file_field IS NULL;
