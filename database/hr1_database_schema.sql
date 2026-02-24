-- ======================================
-- HR1 MODULE - MYSQL DATABASE SCHEMA
-- ======================================

CREATE DATABASE IF NOT EXISTS microfinance_hr1;
USE microfinance_hr1;

-- =====================================
-- 1. JOB POSTINGS TABLE
-- =====================================
CREATE TABLE job_postings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_title VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    position_level ENUM('Entry Level', 'Junior', 'Mid Level', 'Senior', 'Manager', 'Executive') NOT NULL,
    job_description TEXT,
    requirements TEXT,
    responsibilities TEXT,
    salary_range VARCHAR(100),
    employment_type ENUM('Full-time', 'Part-time', 'Contract', 'Temporary') DEFAULT 'Full-time',
    location VARCHAR(255),
    number_of_openings INT DEFAULT 1,
    status ENUM('Draft', 'Active', 'Closed', 'On Hold') DEFAULT 'Draft',
    posted_date DATE,
    closing_date DATE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_department (department),
    INDEX idx_posted_date (posted_date)
);

-- =====================================
-- 2. APPLICANTS TABLE
-- =====================================
CREATE TABLE applicants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other', 'Prefer not to say'),
    nationality VARCHAR(100),
    education_level VARCHAR(100),
    years_of_experience INT,
    current_company VARCHAR(255),
    current_position VARCHAR(255),
    linkedin_profile VARCHAR(255),
    portfolio_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_name (last_name, first_name)
);

-- =====================================
-- 3. APPLICATIONS TABLE
-- =====================================
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_posting_id INT NOT NULL,
    applicant_id INT NOT NULL,
    application_date DATE NOT NULL,
    status ENUM(
        'New', 
        'Under Review', 
        'Shortlisted', 
        'Interview Scheduled',
        'Interview Completed',
        'Offer Extended',
        'Offer Accepted',
        'Offer Rejected',
        'Rejected',
        'Withdrawn'
    ) DEFAULT 'New',
    cover_letter TEXT,
    resume_filename VARCHAR(255),
    resume_path VARCHAR(500),
    portfolio_filename VARCHAR(255),
    portfolio_path VARCHAR(500),
    screening_score DECIMAL(5,2),
    screening_notes TEXT,
    screened_by INT,
    screened_at TIMESTAMP NULL,
    source ENUM('Website', 'LinkedIn', 'Job Board', 'Referral', 'Walk-in', 'Other') DEFAULT 'Website',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_posting_id) REFERENCES job_postings(id) ON DELETE CASCADE,
    FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_application_date (application_date),
    INDEX idx_job_posting (job_posting_id)
);

-- =====================================
-- 4. INTERVIEWS TABLE
-- =====================================
CREATE TABLE interviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    interview_type ENUM('Phone Screening', 'Technical', 'HR Interview', 'Panel Interview', 'Final Interview') NOT NULL,
    interview_date DATE NOT NULL,
    interview_time TIME NOT NULL,
    duration_minutes INT DEFAULT 60,
    location VARCHAR(255),
    meeting_link VARCHAR(500),
    interviewer_ids TEXT, -- Comma-separated IDs
    interviewer_names TEXT, -- Comma-separated names
    status ENUM('Scheduled', 'Completed', 'Cancelled', 'Rescheduled', 'No Show') DEFAULT 'Scheduled',
    result ENUM('Pass', 'Fail', 'Pending') DEFAULT 'Pending',
    overall_rating DECIMAL(3,2),
    technical_rating DECIMAL(3,2),
    communication_rating DECIMAL(3,2),
    cultural_fit_rating DECIMAL(3,2),
    feedback TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    INDEX idx_interview_date (interview_date),
    INDEX idx_status (status)
);

-- =====================================
-- 5. COMMUNICATION/NOTIFICATIONS TABLE
-- =====================================
CREATE TABLE applicant_communications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    communication_type ENUM('Email', 'SMS', 'Call', 'System Notification') DEFAULT 'Email',
    subject VARCHAR(255),
    message TEXT NOT NULL,
    sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Sent', 'Failed', 'Scheduled') DEFAULT 'Pending',
    scheduled_for TIMESTAMP NULL,
    template_used VARCHAR(100),
    sent_by INT,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_sent_date (sent_date)
);

-- =====================================
-- 6. ASSESSMENTS TABLE
-- =====================================
CREATE TABLE assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    assessment_type ENUM('Technical Test', 'Aptitude Test', 'Personality Test', 'Skills Assessment', 'Case Study') NOT NULL,
    assessment_name VARCHAR(255) NOT NULL,
    assigned_date DATE NOT NULL,
    due_date DATE,
    completion_date DATE,
    status ENUM('Pending', 'In Progress', 'Completed', 'Expired') DEFAULT 'Pending',
    score DECIMAL(5,2),
    max_score DECIMAL(5,2),
    passing_score DECIMAL(5,2),
    result ENUM('Pass', 'Fail', 'Pending') DEFAULT 'Pending',
    assessment_link VARCHAR(500),
    notes TEXT,
    evaluated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_due_date (due_date)
);

-- =====================================
-- 7. OFFER LETTERS TABLE
-- =====================================
CREATE TABLE offer_letters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    offer_date DATE NOT NULL,
    position VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    salary DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'PHP',
    employment_type ENUM('Full-time', 'Part-time', 'Contract', 'Temporary') DEFAULT 'Full-time',
    start_date DATE NOT NULL,
    benefits TEXT,
    terms_and_conditions TEXT,
    validity_days INT DEFAULT 7,
    expiry_date DATE,
    status ENUM('Draft', 'Sent', 'Accepted', 'Rejected', 'Expired', 'Withdrawn') DEFAULT 'Draft',
    accepted_date DATE,
    response_notes TEXT,
    offer_letter_path VARCHAR(500),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_offer_date (offer_date)
);

-- =====================================
-- 8. EMPLOYEES TABLE (Master Employee Data)
-- =====================================
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    applicant_id INT, -- Link to original applicant
    application_id INT, -- Link to original application
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    mobile VARCHAR(50),
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other'),
    marital_status ENUM('Single', 'Married', 'Divorced', 'Widowed'),
    nationality VARCHAR(100),
    
    -- Address Information
    current_address TEXT,
    permanent_address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Philippines',
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(255),
    emergency_contact_relationship VARCHAR(100),
    emergency_contact_phone VARCHAR(50),
    
    -- Employment Information
    department VARCHAR(100) NOT NULL,
    position VARCHAR(255) NOT NULL,
    position_level ENUM('Entry Level', 'Junior', 'Mid Level', 'Senior', 'Manager', 'Executive'),
    employment_type ENUM('Full-time', 'Part-time', 'Contract', 'Temporary') DEFAULT 'Full-time',
    employment_status ENUM('Active', 'On Leave', 'Suspended', 'Resigned', 'Terminated') DEFAULT 'Active',
    hire_date DATE NOT NULL,
    probation_end_date DATE,
    confirmation_date DATE,
    resignation_date DATE,
    termination_date DATE,
    
    -- Reporting Structure
    reports_to INT, -- Manager's employee ID
    supervisor_name VARCHAR(255),
    
    -- Compensation
    basic_salary DECIMAL(12,2),
    salary_grade VARCHAR(50),
    currency VARCHAR(10) DEFAULT 'PHP',
    
    -- Government IDs
    sss_number VARCHAR(50),
    tin_number VARCHAR(50),
    philhealth_number VARCHAR(50),
    pagibig_number VARCHAR(50),
    
    -- Bank Information
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(100),
    bank_account_name VARCHAR(255),
    
    -- Status Flags
    onboarding_status ENUM('Not Started', 'In Progress', 'Completed') DEFAULT 'Not Started',
    onboarding_completion_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- System Fields
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE SET NULL,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL,
    INDEX idx_employee_code (employee_code),
    INDEX idx_email (email),
    INDEX idx_department (department),
    INDEX idx_status (employment_status),
    INDEX idx_hire_date (hire_date)
);

-- =====================================
-- 9. ONBOARDING TABLE
-- =====================================
CREATE TABLE onboarding (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    onboarding_date DATE NOT NULL,
    expected_start_date DATE NOT NULL,
    actual_start_date DATE,
    onboarding_status ENUM('Pending', 'In Progress', 'Completed', 'On Hold') DEFAULT 'Pending',
    completion_percentage INT DEFAULT 0,
    
    -- Document Verification
    documents_verified BOOLEAN DEFAULT FALSE,
    documents_verification_date DATE,
    verified_by INT,
    
    -- Required Documents Checklist
    valid_id_submitted BOOLEAN DEFAULT FALSE,
    birth_certificate_submitted BOOLEAN DEFAULT FALSE,
    nbi_clearance_submitted BOOLEAN DEFAULT FALSE,
    medical_certificate_submitted BOOLEAN DEFAULT FALSE,
    diploma_submitted BOOLEAN DEFAULT FALSE,
    transcript_submitted BOOLEAN DEFAULT FALSE,
    previous_employment_cert BOOLEAN DEFAULT FALSE,
    
    -- Government IDs Verification
    sss_verified BOOLEAN DEFAULT FALSE,
    tin_verified BOOLEAN DEFAULT FALSE,
    philhealth_verified BOOLEAN DEFAULT FALSE,
    pagibig_verified BOOLEAN DEFAULT FALSE,
    
    -- Orientation & Training
    orientation_scheduled BOOLEAN DEFAULT FALSE,
    orientation_date DATE,
    orientation_completed BOOLEAN DEFAULT FALSE,
    orientation_completed_date DATE,
    
    company_policies_reviewed BOOLEAN DEFAULT FALSE,
    safety_training_completed BOOLEAN DEFAULT FALSE,
    it_setup_completed BOOLEAN DEFAULT FALSE,
    workstation_assigned BOOLEAN DEFAULT FALSE,
    
    -- Equipment Assignment
    laptop_assigned BOOLEAN DEFAULT FALSE,
    laptop_serial_number VARCHAR(100),
    phone_assigned BOOLEAN DEFAULT FALSE,
    phone_number VARCHAR(50),
    id_card_issued BOOLEAN DEFAULT FALSE,
    id_card_number VARCHAR(50),
    
    -- Access & Accounts
    email_account_created BOOLEAN DEFAULT FALSE,
    system_access_granted BOOLEAN DEFAULT FALSE,
    
    -- Buddy/Mentor Assignment
    buddy_assigned BOOLEAN DEFAULT FALSE,
    buddy_employee_id INT,
    buddy_name VARCHAR(255),
    
    -- Notes
    notes TEXT,
    special_requirements TEXT,
    
    -- Completion
    completed_date DATE,
    completed_by INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_status (onboarding_status),
    INDEX idx_onboarding_date (onboarding_date)
);

-- =====================================
-- 10. PERFORMANCE EVALUATIONS TABLE
-- =====================================
CREATE TABLE performance_evaluations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    evaluation_period_start DATE NOT NULL,
    evaluation_period_end DATE NOT NULL,
    evaluation_date DATE NOT NULL,
    evaluation_type ENUM('Probationary', 'Annual', 'Mid-Year', '360 Degree', 'Project-based') NOT NULL,
    evaluator_id INT,
    evaluator_name VARCHAR(255),
    evaluator_position VARCHAR(255),
    
    -- Performance Ratings (1-5 scale)
    job_knowledge_rating DECIMAL(3,2),
    work_quality_rating DECIMAL(3,2),
    productivity_rating DECIMAL(3,2),
    communication_rating DECIMAL(3,2),
    teamwork_rating DECIMAL(3,2),
    initiative_rating DECIMAL(3,2),
    problem_solving_rating DECIMAL(3,2),
    attendance_rating DECIMAL(3,2),
    overall_rating DECIMAL(3,2),
    
    -- Qualitative Feedback
    strengths TEXT,
    areas_for_improvement TEXT,
    achievements TEXT,
    goals_for_next_period TEXT,
    training_recommendations TEXT,
    evaluator_comments TEXT,
    employee_comments TEXT,
    
    -- Status
    status ENUM('Draft', 'Submitted', 'Under Review', 'Completed', 'Acknowledged') DEFAULT 'Draft',
    submitted_date DATE,
    acknowledged_date DATE,
    
    -- Recommendation
    recommendation ENUM('Exceeds Expectations', 'Meets Expectations', 'Needs Improvement', 'Unsatisfactory'),
    promotion_recommended BOOLEAN DEFAULT FALSE,
    salary_increase_recommended BOOLEAN DEFAULT FALSE,
    training_required BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_evaluation_date (evaluation_date),
    INDEX idx_status (status),
    INDEX idx_employee (employee_id)
);

-- =====================================
-- 11. EMPLOYEE RECOGNITION TABLE
-- =====================================
CREATE TABLE employee_recognition (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    recognition_type ENUM(
        'Employee of the Month',
        'Employee of the Year',
        'Outstanding Performance',
        'Innovation Award',
        'Team Player Award',
        'Customer Service Excellence',
        'Perfect Attendance',
        'Leadership Award',
        'Other'
    ) NOT NULL,
    recognition_date DATE NOT NULL,
    award_title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    reason TEXT NOT NULL,
    
    -- Nomination
    nominated_by INT,
    nominator_name VARCHAR(255),
    nomination_date DATE,
    
    -- Approval
    approved_by INT,
    approver_name VARCHAR(255),
    approval_date DATE,
    status ENUM('Nominated', 'Under Review', 'Approved', 'Rejected', 'Awarded') DEFAULT 'Nominated',
    
    -- Award Details
    award_value DECIMAL(10,2),
    award_type ENUM('Certificate', 'Trophy', 'Cash', 'Gift', 'Combined'),
    certificate_number VARCHAR(100),
    public_announcement BOOLEAN DEFAULT TRUE,
    
    -- Additional Info
    ceremony_date DATE,
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_recognition_date (recognition_date),
    INDEX idx_status (status),
    INDEX idx_employee (employee_id),
    INDEX idx_type (recognition_type)
);

-- =====================================
-- 12. DEPARTMENT TRANSFERS TABLE
-- (For sending employee data to other departments)
-- =====================================
CREATE TABLE department_transfers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    transfer_type ENUM('Onboarding Complete', 'Department Change', 'Promotion', 'Data Update') NOT NULL,
    
    -- Source Department (HR1)
    source_module VARCHAR(50) DEFAULT 'HR1',
    
    -- Target Department(s) - Can send to multiple
    target_modules TEXT NOT NULL, -- JSON array: ["HR2", "HR3", "HR4", "Financial"]
    
    -- Data Package
    employee_data JSON NOT NULL, -- Complete employee information
    transfer_reason TEXT,
    
    -- Status
    status ENUM('Pending', 'Sent', 'Acknowledged', 'Failed') DEFAULT 'Pending',
    sent_date TIMESTAMP NULL,
    acknowledged_date TIMESTAMP NULL,
    
    -- Response from receiving departments
    acknowledgment_data JSON, -- Responses from each department
    
    -- Notes
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_employee (employee_id),
    INDEX idx_sent_date (sent_date)
);

-- =====================================
-- 13. AUDIT LOG TABLE
-- =====================================
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id INT NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE', 'STATUS_CHANGE') NOT NULL,
    old_values JSON,
    new_values JSON,
    changed_by INT,
    changed_by_name VARCHAR(255),
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_created_at (created_at)
);

-- =====================================
-- INSERT SAMPLE DATA FOR TESTING
-- =====================================

-- Sample Job Posting
INSERT INTO job_postings (
    job_title, department, position_level, job_description, 
    requirements, salary_range, status, posted_date, closing_date
) VALUES (
    'Loan Officer', 
    'Lending Operations', 
    'Mid Level',
    'Responsible for evaluating, authorizing, and managing microloans for clients.',
    'Bachelor\'s degree in Finance or related field, 2+ years experience in microfinance',
    '₱25,000 - ₱35,000',
    'Active',
    CURDATE(),
    DATE_ADD(CURDATE(), INTERVAL 30 DAY)
);

-- Sample Applicant
INSERT INTO applicants (
    first_name, last_name, email, phone, 
    education_level, years_of_experience
) VALUES (
    'Maria', 
    'Santos', 
    'maria.santos@email.com', 
    '09171234567',
    'Bachelor\'s Degree',
    3
);

-- Sample Application
INSERT INTO applications (
    job_posting_id, applicant_id, application_date, 
    status, cover_letter
) VALUES (
    1, 
    1, 
    CURDATE(),
    'New',
    'I am excited to apply for the Loan Officer position...'
);

-- =====================================
-- VIEWS FOR REPORTING
-- =====================================

-- Active Recruitment Pipeline View
CREATE VIEW vw_recruitment_pipeline AS
SELECT 
    jp.job_title,
    jp.department,
    COUNT(DISTINCT a.id) as total_applications,
    SUM(CASE WHEN a.status = 'New' THEN 1 ELSE 0 END) as new_applications,
    SUM(CASE WHEN a.status = 'Under Review' THEN 1 ELSE 0 END) as under_review,
    SUM(CASE WHEN a.status = 'Shortlisted' THEN 1 ELSE 0 END) as shortlisted,
    SUM(CASE WHEN a.status IN ('Interview Scheduled', 'Interview Completed') THEN 1 ELSE 0 END) as in_interview,
    SUM(CASE WHEN a.status = 'Offer Extended' THEN 1 ELSE 0 END) as offers_extended
FROM job_postings jp
LEFT JOIN applications a ON jp.id = a.job_posting_id
WHERE jp.status = 'Active'
GROUP BY jp.id, jp.job_title, jp.department;

-- Onboarding Progress View
CREATE VIEW vw_onboarding_progress AS
SELECT 
    e.employee_code,
    CONCAT(e.first_name, ' ', e.last_name) as employee_name,
    e.department,
    e.position,
    o.onboarding_status,
    o.completion_percentage,
    o.expected_start_date,
    o.actual_start_date,
    DATEDIFF(CURDATE(), o.onboarding_date) as days_in_onboarding
FROM employees e
INNER JOIN onboarding o ON e.id = o.employee_id
WHERE o.onboarding_status != 'Completed';

-- Employee Performance Summary View
CREATE VIEW vw_employee_performance AS
SELECT 
    e.employee_code,
    CONCAT(e.first_name, ' ', e.last_name) as employee_name,
    e.department,
    e.position,
    pe.evaluation_date,
    pe.overall_rating,
    pe.recommendation,
    COUNT(er.id) as total_recognitions
FROM employees e
LEFT JOIN performance_evaluations pe ON e.id = pe.employee_id 
    AND pe.id = (SELECT id FROM performance_evaluations WHERE employee_id = e.id ORDER BY evaluation_date DESC LIMIT 1)
LEFT JOIN employee_recognition er ON e.id = er.employee_id
WHERE e.is_active = TRUE
GROUP BY e.id, pe.id;

-- =====================================
-- STORED PROCEDURES
-- =====================================

DELIMITER //

-- Procedure to move applicant to employee after offer acceptance
CREATE PROCEDURE sp_convert_applicant_to_employee(
    IN p_application_id INT,
    IN p_employee_code VARCHAR(50),
    IN p_hire_date DATE,
    IN p_basic_salary DECIMAL(12,2),
    IN p_created_by INT
)
BEGIN
    DECLARE v_applicant_id INT;
    DECLARE v_job_posting_id INT;
    DECLARE v_employee_id INT;
    
    -- Get applicant and job info
    SELECT applicant_id, job_posting_id 
    INTO v_applicant_id, v_job_posting_id
    FROM applications 
    WHERE id = p_application_id;
    
    -- Create employee record
    INSERT INTO employees (
        employee_code, applicant_id, application_id,
        first_name, last_name, email, phone, date_of_birth, gender,
        department, position, employment_type, hire_date, basic_salary,
        onboarding_status, is_active, created_by
    )
    SELECT 
        p_employee_code, v_applicant_id, p_application_id,
        a.first_name, a.last_name, a.email, a.phone, a.date_of_birth, a.gender,
        jp.department, jp.job_title, jp.employment_type, p_hire_date, p_basic_salary,
        'Not Started', TRUE, p_created_by
    FROM applicants a
    CROSS JOIN job_postings jp
    WHERE a.id = v_applicant_id AND jp.id = v_job_posting_id;
    
    SET v_employee_id = LAST_INSERT_ID();
    
    -- Create onboarding record
    INSERT INTO onboarding (
        employee_id, onboarding_date, expected_start_date, 
        onboarding_status, completion_percentage
    ) VALUES (
        v_employee_id, CURDATE(), p_hire_date,
        'Pending', 0
    );
    
    -- Update application status
    UPDATE applications 
    SET status = 'Offer Accepted'
    WHERE id = p_application_id;
    
    SELECT v_employee_id as employee_id;
END //

-- Procedure to complete onboarding and transfer to other departments
CREATE PROCEDURE sp_complete_onboarding_and_transfer(
    IN p_employee_id INT,
    IN p_target_modules JSON,
    IN p_completed_by INT
)
BEGIN
    DECLARE v_employee_data JSON;
    
    -- Mark onboarding as completed
    UPDATE onboarding 
    SET onboarding_status = 'Completed',
        completion_percentage = 100,
        completed_date = CURDATE(),
        completed_by = p_completed_by
    WHERE employee_id = p_employee_id;
    
    UPDATE employees
    SET onboarding_status = 'Completed',
        onboarding_completion_date = CURDATE()
    WHERE id = p_employee_id;
    
    -- Prepare employee data for transfer
    SELECT JSON_OBJECT(
        'employee_id', id,
        'employee_code', employee_code,
        'first_name', first_name,
        'last_name', last_name,
        'email', email,
        'phone', phone,
        'department', department,
        'position', position,
        'hire_date', hire_date,
        'basic_salary', basic_salary,
        'sss_number', sss_number,
        'tin_number', tin_number,
        'philhealth_number', philhealth_number,
        'pagibig_number', pagibig_number,
        'bank_account_number', bank_account_number,
        'onboarding_completion_date', onboarding_completion_date
    )
    INTO v_employee_data
    FROM employees
    WHERE id = p_employee_id;
    
    -- Create transfer record
    INSERT INTO department_transfers (
        employee_id, transfer_type, target_modules,
        employee_data, transfer_reason, status, created_by
    ) VALUES (
        p_employee_id, 'Onboarding Complete', p_target_modules,
        v_employee_data, 'Employee onboarding completed, data ready for other modules',
        'Pending', p_completed_by
    );
    
    SELECT LAST_INSERT_ID() as transfer_id;
END //

DELIMITER ;

-- =====================================
-- GRANT PERMISSIONS (Adjust as needed)
-- =====================================
-- CREATE USER IF NOT EXISTS 'hr1_user'@'localhost' IDENTIFIED BY 'secure_password';
-- GRANT ALL PRIVILEGES ON microfinance_hr1.* TO 'hr1_user'@'localhost';
-- FLUSH PRIVILEGES;

-- =====================================
-- END OF SCHEMA
-- =====================================