// HR1 API Client for MySQL Backend
// Handles all communication between frontend and PHP API

// Configuration
const HR1_API_BASE_URL = 'http://localhost:8080/api/hr1-api.php';

// Utility function to make API requests
async function apiRequest(action, data = {}, method = 'GET') {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        let url = `${HR1_API_BASE_URL}?action=${action}`;

        if (method === 'GET' && Object.keys(data).length > 0) {
            const params = new URLSearchParams(data);
            url += `&${params.toString()}`;
        } else if (method === 'POST') {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// HR1 API Object with all methods
const HR1API = {
    // ==================== JOB POSTINGS ====================
    
    getAllJobPostings: async function() {
        return await apiRequest('job-postings');
    },

    getJobPostingById: async function(id) {
        return await apiRequest('job-posting', { id });
    },

    createJobPosting: async function(jobData) {
        return await apiRequest('create-job-posting', jobData, 'POST');
    },

    updateJobPosting: async function(id, jobData) {
        return await apiRequest('update-job-posting', { id, ...jobData }, 'POST');
    },

    deleteJobPosting: async function(id) {
        return await apiRequest('delete-job-posting', { id }, 'POST');
    },

    // ==================== APPLICATIONS ====================
    
    getAllApplications: async function() {
        return await apiRequest('applications');
    },

    getApplicationById: async function(id) {
        return await apiRequest('application', { id });
    },

    createApplication: async function(appData) {
        return await apiRequest('create-application', appData, 'POST');
    },

    updateApplicationStatus: async function(id, status) {
        return await apiRequest('update-application-status', { id, status }, 'POST');
    },

    // ==================== INTERVIEWS ====================
    
    scheduleInterview: async function(interviewData) {
        return await apiRequest('schedule-interview', interviewData, 'POST');
    },

    getInterviewsByApplication: async function(applicationId) {
        return await apiRequest('interviews-by-application', { application_id: applicationId });
    },

    // ==================== OFFERS ====================
    
    createOffer: async function(offerData) {
        return await apiRequest('create-offer', offerData, 'POST');
    },

    updateOfferStatus: async function(id, status) {
        return await apiRequest('update-offer-status', { id, status }, 'POST');
    },

    // ==================== EMPLOYEES ====================
    
    getAllEmployees: async function() {
        return await apiRequest('employees');
    },

    getEmployeeById: async function(id) {
        return await apiRequest('employee', { id });
    },

    createEmployee: async function(employeeData) {
        return await apiRequest('create-employee', employeeData, 'POST');
    },

    // ==================== ONBOARDING ====================
    
    getOnboardingList: async function() {
        return await apiRequest('onboarding-list');
    },

    getOnboardingById: async function(id) {
        return await apiRequest('onboarding', { id });
    },

    updateOnboardingProgress: async function(id, progressData) {
        return await apiRequest('update-onboarding', { id, ...progressData }, 'POST');
    },

    completeOnboardingItem: async function(onboardingId, itemName, isCompleted) {
        return await apiRequest('update-checklist-item', { 
            onboarding_id: onboardingId, 
            item_name: itemName,
            is_completed: isCompleted 
        }, 'POST');
    },

    // ==================== DEPARTMENT TRANSFERS ====================
    
    createDepartmentTransfer: async function(transferData) {
        return await apiRequest('create-transfer', transferData, 'POST');
    },

    getPendingTransfers: async function() {
        return await apiRequest('pending-transfers');
    },

    acknowledgeDepartmentTransfer: async function(transferId, departmentName) {
        return await apiRequest('acknowledge-transfer', { 
            transfer_id: transferId,
            department: departmentName 
        }, 'POST');
    },

    // ==================== PERFORMANCE EVALUATIONS ====================
    
    getAllEvaluations: async function() {
        return await apiRequest('evaluations');
    },

    getEvaluationById: async function(id) {
        return await apiRequest('evaluation', { id });
    },

    createEvaluation: async function(evalData) {
        return await apiRequest('create-evaluation', evalData, 'POST');
    },

    getEvaluationsByEmployee: async function(employeeId) {
        return await apiRequest('evaluations-by-employee', { employee_id: employeeId });
    },

    // ==================== SOCIAL RECOGNITION ====================
    
    getAllRecognitions: async function() {
        return await apiRequest('recognitions');
    },

    getRecognitionById: async function(id) {
        return await apiRequest('recognition', { id });
    },

    createRecognition: async function(recData) {
        return await apiRequest('create-recognition', recData, 'POST');
    },

    approveRecognition: async function(id, approverName, approvalDate) {
        return await apiRequest('approve-recognition', { 
            id, 
            approver_name: approverName,
            approval_date: approvalDate 
        }, 'POST');
    }
};

// Utility function to format dates for MySQL
function formatDateForMySQL(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HR1API, formatDateForMySQL };
}

console.log('✅ HR1 MySQL API Client loaded successfully');
console.log('📡 API Base URL:', HR1_API_BASE_URL);