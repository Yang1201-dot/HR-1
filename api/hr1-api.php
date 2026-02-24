<?php
// ======================================
// HR1 API ENDPOINTS
// File: api/hr1-api.php
// ======================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../mysql-config.php';

$db = new HR1Database();
$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'] ?? '', '/'));
$endpoint = $request[0] ?? '';

function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit();
}

function getRequestData() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

try {
    switch ($endpoint) {
        
        // ===== JOB POSTINGS =====
        case 'job-postings':
            if ($method === 'GET') {
                if (isset($request[1])) {
                    // Get specific job posting
                    $job = $db->getJobPosting($request[1]);
                    jsonResponse($job);
                } else {
                    // Get all job postings
                    $status = $_GET['status'] ?? null;
                    $jobs = $db->getAllJobPostings($status);
                    jsonResponse($jobs);
                }
            } elseif ($method === 'POST') {
                // Create new job posting
                $data = getRequestData();
                $id = $db->createJobPosting($data);
                jsonResponse(['success' => true, 'id' => $id], 201);
            } elseif ($method === 'PUT') {
                // Update job posting
                $id = $request[1];
                $data = getRequestData();
                $db->updateJobPosting($id, $data);
                jsonResponse(['success' => true]);
            }
            break;
        
        case 'recruitment-stats':
            if ($method === 'GET') {
                $stats = $db->getRecruitmentStats();
                jsonResponse($stats);
            }
            break;
        
        // ===== APPLICANTS =====
        case 'applicants':
            if ($method === 'POST') {
                // Create new applicant
                $data = getRequestData();
                $id = $db->createApplicant($data);
                jsonResponse(['success' => true, 'id' => $id], 201);
            } elseif ($method === 'GET') {
                if (isset($request[1])) {
                    $applicant = $db->getApplicant($request[1]);
                    jsonResponse($applicant);
                }
            }
            break;
        
        // ===== APPLICATIONS =====
        case 'applications':
            if ($method === 'GET') {
                if (isset($request[1])) {
                    // Get specific application
                    $application = $db->getApplication($request[1]);
                    jsonResponse($application);
                } else {
                    // Get all applications with filters
                    $filters = [];
                    if (isset($_GET['status'])) $filters['status'] = $_GET['status'];
                    if (isset($_GET['job_posting_id'])) $filters['job_posting_id'] = $_GET['job_posting_id'];
                    
                    $applications = $db->getAllApplications($filters);
                    jsonResponse($applications);
                }
            } elseif ($method === 'POST') {
                // Create new application
                $data = getRequestData();
                $id = $db->createApplication($data);
                jsonResponse(['success' => true, 'id' => $id], 201);
            } elseif ($method === 'PUT') {
                // Update application status
                $id = $request[1];
                $data = getRequestData();
                
                if (isset($data['status'])) {
                    $db->updateApplicationStatus($id, $data['status'], $data['screened_by'] ?? null);
                    jsonResponse(['success' => true]);
                }
            }
            break;
        
        case 'application-stats':
            if ($method === 'GET') {
                $stats = $db->getApplicationStats();
                jsonResponse($stats);
            }
            break;
        
        // ===== INTERVIEWS =====
        case 'interviews':
            if ($method === 'POST') {
                // Schedule new interview
                $data = getRequestData();
                $id = $db->scheduleInterview($data);
                jsonResponse(['success' => true, 'id' => $id], 201);
            } elseif ($method === 'GET') {
                if ($request[1] === 'today') {
                    $interviews = $db->getTodayInterviews();
                    jsonResponse($interviews);
                }
            } elseif ($method === 'PUT') {
                // Update interview result
                $id = $request[1];
                $data = getRequestData();
                
                $db->updateInterviewResult(
                    $id,
                    $data['result'],
                    $data['rating'],
                    $data['feedback']
                );
                jsonResponse(['success' => true]);
            }
            break;
        
        // ===== OFFER LETTERS =====
        case 'offers':
            if ($method === 'POST') {
                // Create offer letter
                $data = getRequestData();
                $id = $db->createOfferLetter($data);
                jsonResponse(['success' => true, 'id' => $id], 201);
            } elseif ($method === 'PUT') {
                // Update offer status
                $id = $request[1];
                $data = getRequestData();
                
                $db->updateOfferStatus($id, $data['status'], $data['response_notes'] ?? null);
                
                // If offer accepted, convert to employee
                if ($data['status'] === 'Accepted') {
                    // This will be handled by a separate endpoint
                    jsonResponse(['success' => true, 'next_step' => 'convert_to_employee']);
                } else {
                    jsonResponse(['success' => true]);
                }
            }
            break;
        
        // ===== EMPLOYEE CONVERSION =====
        case 'convert-to-employee':
            if ($method === 'POST') {
                $data = getRequestData();
                
                $result = $db->convertApplicantToEmployee(
                    $data['application_id'],
                    $data['employee_code'],
                    $data['hire_date'],
                    $data['basic_salary'],
                    $data['created_by']
                );
                
                jsonResponse([
                    'success' => true,
                    'employee_id' => $result['employee_id'],
                    'message' => 'Employee created and onboarding initiated'
                ]);
            }
            break;
        
        // ===== EMPLOYEES =====
        case 'employees':
            if ($method === 'GET') {
                if (isset($request[1])) {
                    $employee = $db->getEmployee($request[1]);
                    jsonResponse($employee);
                } else {
                    $filters = [];
                    if (isset($_GET['department'])) $filters['department'] = $_GET['department'];
                    if (isset($_GET['status'])) $filters['employment_status'] = $_GET['status'];
                    
                    $employees = $db->getAllEmployees($filters);
                    jsonResponse($employees);
                }
            }
            break;
        
        // ===== ONBOARDING =====
        case 'onboarding':
            if ($method === 'GET') {
                $status = $_GET['status'] ?? null;
                $onboarding = $db->getAllOnboarding($status);
                jsonResponse($onboarding);
            } elseif ($method === 'PUT') {
                // Update onboarding progress
                $id = $request[1];
                $data = getRequestData();
                
                $db->updateOnboardingProgress($id, $data);
                
                // Recalculate completion percentage
                $percentage = $db->calculateOnboardingCompletion($id);
                
                jsonResponse([
                    'success' => true,
                    'completion_percentage' => $percentage
                ]);
            }
            break;
        
        case 'complete-onboarding':
            if ($method === 'POST') {
                $data = getRequestData();
                
                // Complete onboarding and create transfer record
                $result = $db->completeOnboardingAndTransfer(
                    $data['employee_id'],
                    $data['target_modules'], // Array like ["HR2", "HR3", "HR4", "Financial"]
                    $data['completed_by']
                );
                
                jsonResponse([
                    'success' => true,
                    'transfer_id' => $result['transfer_id'],
                    'message' => 'Onboarding completed. Employee data ready for transfer.'
                ]);
            }
            break;
        
        // ===== PERFORMANCE EVALUATIONS =====
        case 'evaluations':
            if ($method === 'POST') {
                $data = getRequestData();
                $id = $db->createPerformanceEvaluation($data);
                jsonResponse(['success' => true, 'id' => $id], 201);
            } elseif ($method === 'GET') {
                $employee_id = $_GET['employee_id'] ?? null;
                $evaluations = $db->getAllEvaluations($employee_id);
                jsonResponse($evaluations);
            }
            break;
        
        // ===== RECOGNITION =====
        case 'recognitions':
            if ($method === 'POST') {
                $data = getRequestData();
                $id = $db->createRecognition($data);
                jsonResponse(['success' => true, 'id' => $id], 201);
            } elseif ($method === 'GET') {
                $recognitions = $db->getAllRecognitions();
                jsonResponse($recognitions);
            } elseif ($method === 'PUT') {
                // Approve recognition
                $id = $request[1];
                $data = getRequestData();
                
                $db->approveRecognition($id, $data['approved_by'], $data['approver_name']);
                jsonResponse(['success' => true]);
            }
            break;
        
        // ===== DEPARTMENT TRANSFERS =====
        case 'transfers':
            if ($method === 'GET') {
                if ($request[1] === 'pending') {
                    $transfers = $db->getPendingTransfers();
                    jsonResponse($transfers);
                }
            } elseif ($method === 'PUT') {
                $id = $request[1];
                $action = $request[2] ?? '';
                
                if ($action === 'send') {
                    // Mark as sent (this would trigger actual sending to other departments)
                    $db->markTransferSent($id);
                    jsonResponse(['success' => true, 'message' => 'Transfer marked as sent']);
                } elseif ($action === 'acknowledge') {
                    // Record acknowledgment from receiving department
                    $data = getRequestData();
                    $db->recordTransferAcknowledgment($id, $data['acknowledgment_data']);
                    jsonResponse(['success' => true]);
                }
            }
            break;
        
        // ===== WORKFLOW: COMPLETE RECRUITMENT TO ONBOARDING =====
        case 'workflow':
            if ($method === 'POST') {
                $action = $request[1] ?? '';
                $data = getRequestData();
                
                if ($action === 'accept-offer') {
                    // Step 1: Update offer status to Accepted
                    $db->updateOfferStatus($data['offer_id'], 'Accepted', $data['notes'] ?? null);
                    
                    // Step 2: Convert applicant to employee
                    $employee = $db->convertApplicantToEmployee(
                        $data['application_id'],
                        $data['employee_code'],
                        $data['hire_date'],
                        $data['basic_salary'],
                        $data['created_by']
                    );
                    
                    jsonResponse([
                        'success' => true,
                        'employee_id' => $employee['employee_id'],
                        'message' => 'Candidate converted to employee. Onboarding process started.',
                        'next_step' => 'Complete onboarding tasks'
                    ]);
                    
                } elseif ($action === 'finish-onboarding') {
                    // Final step: Complete onboarding and transfer to other departments
                    $result = $db->completeOnboardingAndTransfer(
                        $data['employee_id'],
                        $data['target_modules'],
                        $data['completed_by']
                    );
                    
                    jsonResponse([
                        'success' => true,
                        'transfer_id' => $result['transfer_id'],
                        'message' => 'Onboarding completed! Employee data sent to: ' . implode(', ', $data['target_modules']),
                        'status' => 'Employee ready for work'
                    ]);
                }
            }
            break;
        
        default:
            jsonResponse(['error' => 'Endpoint not found'], 404);
    }
    
} catch (Exception $e) {
    jsonResponse([
        'error' => 'Server error',
        'message' => $e->getMessage()
    ], 500);
}
?>