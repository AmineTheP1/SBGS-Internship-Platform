// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost';

// API endpoints
export const API_ENDPOINTS = {
  // HR endpoints
  HR_LOGIN: `${API_BASE_URL}/api/hr/login`,
  HR_SESSION: `${API_BASE_URL}/api/hr/session`,
  HR_LOGOUT: `${API_BASE_URL}/api/hr/logout`,
  HR_APPLICATIONS: `${API_BASE_URL}/api/hr/get-applications`,
  HR_UPDATE_STATUS: `${API_BASE_URL}/api/hr/update-status`,
  HR_ASSIGN_INTERN: `${API_BASE_URL}/api/hr/assign-intern`,
  HR_GET_SUPERVISORS: `${API_BASE_URL}/api/hr/get-supervisors`,
  HR_SET_START_DATE: `${API_BASE_URL}/api/hr/set-start-date`,
  HR_CREATE_SUPERVISOR: `${API_BASE_URL}/api/hr/create-supervisor`,
  HR_GET_UNIVERSITIES: `${API_BASE_URL}/api/hr/get-universities`,
  HR_DELETE_APPLICATION: `${API_BASE_URL}/api/hr/delete-application`,
  HR_GET_CV: `${API_BASE_URL}/api/hr/get-cv`,
  HR_SUPER_ADMIN_CREATE_RH: `${API_BASE_URL}/api/hr/super-admin/create-rh`,

  // Supervisor endpoints
  SUPERVISOR_LOGIN: `${API_BASE_URL}/api/supervisor/login`,
  SUPERVISOR_SESSION: `${API_BASE_URL}/api/supervisor/session`,
  SUPERVISOR_LOGOUT: `${API_BASE_URL}/api/supervisor/logout`,
  SUPERVISOR_ASSIGNED_INTERNS: `${API_BASE_URL}/api/supervisor/get-assigned-interns`,
  SUPERVISOR_INTERN_DETAILS: `${API_BASE_URL}/api/supervisor/get-intern-details`,
  SUPERVISOR_MARK_ABSENCE: `${API_BASE_URL}/api/supervisor/mark-absence`,
  SUPERVISOR_MARK_UNJUSTIFIED_ABSENCE: `${API_BASE_URL}/api/supervisor/mark-unjustified-absence`,
  SUPERVISOR_MONTHLY_ABSENCES: `${API_BASE_URL}/api/supervisor/get-monthly-absences`,
  SUPERVISOR_ADMIN_CREATE_SUPERVISOR: `${API_BASE_URL}/api/supervisor-admin/create-supervisor`,

  // Candidate endpoints
  CANDIDATE_LOGIN: `${API_BASE_URL}/api/candidate/login`,
  CANDIDATE_SESSION: `${API_BASE_URL}/api/candidate/session`,
  CANDIDATE_LOGOUT: `${API_BASE_URL}/api/candidate/logout`,
  CANDIDATE_CLOCK_IN: `${API_BASE_URL}/api/candidate/clock-in`,
  CANDIDATE_CLOCK_OUT: `${API_BASE_URL}/api/candidate/clock-out`,
  CANDIDATE_DAILY_REPORT: `${API_BASE_URL}/api/candidate/get-attendance`,
  CANDIDATE_UPDATE_DAILY_REPORT: `${API_BASE_URL}/api/candidate/update-daily-report`,
  CANDIDATE_FINAL_REPORT: `${API_BASE_URL}/api/candidate/final-report`,

  // Application endpoints
  APPLY: `${API_BASE_URL}/api/hr/apply`,
  CONTACT: `${API_BASE_URL}/api/contact`,
  NEWSLETTER: `${API_BASE_URL}/api/newsletter`,

  // File endpoints
  FILES: `${API_BASE_URL}/api/files`,
};

export default API_ENDPOINTS; 