import axios, { AxiosInstance, AxiosError } from "axios";
import type {
  EmployeesResponse,
  EmployeesQueryParams,
  BackendEmployee,
} from "../types/employee";

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 30000, // Increased to 30 seconds for stats endpoint
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor (optional - for adding auth tokens, etc.)
api.interceptors.request.use(
  (config) => {
    // Log request for debugging
    console.log('[API] Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      params: config.params
    });
    // Add any request modifications here (e.g., auth tokens)
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      console.error("API Error:", error.response.status, error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error("Network Error:", error.request);
    } else {
      // Something else happened
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// Employee API service
export const employeeService = {
  /**
   * Get employees with pagination and filters
   */
  getEmployees: async (
    params: EmployeesQueryParams = {}
  ): Promise<EmployeesResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.distcode) queryParams.append("distcode", params.distcode);
    if (params.dept_id) queryParams.append("dept_id", params.dept_id.toString());
    if (params.designation) queryParams.append("designation", params.designation);
    if (params.position) queryParams.append("position", params.position);
    if (params.status) queryParams.append("status", params.status);
    if (params.birthdayMonth) queryParams.append("birthdayMonth", params.birthdayMonth);
    if (params.retiringYear) queryParams.append("retiringYear", params.retiringYear);

    const queryString = queryParams.toString();
    const url = `/employees${queryString ? `?${queryString}` : ""}`;

    console.log('[API] Fetching employees from:', url);
    const response = await api.get<EmployeesResponse>(url);
    console.log('[API] Raw axios response:', response);
    console.log('[API] Raw response.data:', response.data);
    console.log('[API] response.data type:', typeof response.data);
    console.log('[API] response.data.rows:', response.data?.rows);
    console.log('[API] response.data.rows type:', typeof response.data?.rows);
    console.log('[API] response.data.rows isArray:', Array.isArray(response.data?.rows));
    console.log('[API] Response received:', {
      success: response.data?.success,
      total: response.data?.total,
      rowsCount: response.data?.rows?.length || 0,
      rowsIsArray: Array.isArray(response.data?.rows),
      rowsType: typeof response.data?.rows,
      firstRow: response.data?.rows?.[0] || null,
      fullResponseData: response.data
    });
    
    // Ensure we're returning the correct structure
    if (!response.data) {
      console.error('[API] Response.data is missing:', response);
      throw new Error('Invalid API response: data is missing');
    }
    
    if (response.data.success === undefined) {
      console.error('[API] Response.data.success is missing:', response.data);
      throw new Error('Invalid API response: success field is missing');
    }
    
    if (response.data.total === undefined) {
      console.error('[API] Response.data.total is missing:', response.data);
      throw new Error('Invalid API response: total field is missing');
    }
    
    if (!response.data.rows) {
      console.error('[API] Response.data.rows is missing:', response.data);
      throw new Error('Invalid API response: rows field is missing');
    }
    
    if (!Array.isArray(response.data.rows)) {
      console.error('[API] Response.data.rows is not an array:', {
        type: typeof response.data.rows,
        value: response.data.rows,
        fullData: response.data
      });
      throw new Error(`Invalid API response: rows is not an array (type: ${typeof response.data.rows})`);
    }
    
    console.log('[API] Confirmed rows is array with length:', response.data.rows.length);
    console.log('[EmployeesAPI] rows:', response.data.rows.length, 'total:', response.data.total);
    
    return response.data;
  },

  /**
   * Get employee by ID
   */
  getEmployeeById: async (id: string): Promise<BackendEmployee> => {
    const response = await api.get<BackendEmployee>(`/employees/${id}`);
    return response.data;
  },

  /**
   * Get employee statistics
   */
  getEmployeeStats: async (): Promise<{
    total: number;
    regular: number;
    incharge: number;
    birthdaysThisMonth: number;
    birthdaysNextMonth: number;
    retiringThisYear: number;
    suspended: number;
    onLeaveToday: number;
    leaveTomorrow: number;
    upcomingLeaves: number;
  }> => {
    console.log('[API] Fetching employee stats from /employees/stats');
    const response = await api.get('/employees/stats');
    console.log('[API] Stats response received:', response.data);
    return response.data;
  },

  /**
   * Validate CFMS ID against existing database
   */
  validateCfmsId: async (cfmsId: string): Promise<{
    success: boolean;
    message: string;
    exists: boolean;
    employee?: any;
  }> => {
    console.log('[API] Validating CFMS ID:', cfmsId);
    const response = await api.get(`/employees/validate/${cfmsId}`);
    console.log('[API] CFMS validation response:', response.data);
    return response.data;
  },

  /**
   * Search all employees without position filter (for add employee)
   */
  searchAllEmployees: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    distcode?: string;
    dept_id?: number;
    designation?: string;
    status?: 'regular' | 'incharge' | 'suspended';
    birthdayMonth?: 'current' | 'next';
    retiringYear?: 'current';
  }): Promise<EmployeesResponse> => {
    console.log('[API] Searching all employees from /employees/search-all');
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.distcode) queryParams.append("distcode", params.distcode);
    if (params?.dept_id) queryParams.append("dept_id", params.dept_id.toString());
    if (params?.designation) queryParams.append("designation", params.designation);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.birthdayMonth) queryParams.append("birthdayMonth", params.birthdayMonth);
    if (params?.retiringYear) queryParams.append("retiringYear", params.retiringYear);

    const queryString = queryParams.toString();
    const url = `/employees/search-all${queryString ? `?${queryString}` : ""}`;

    const response = await api.get<EmployeesResponse>(url);
    return response.data;
  },

  /**
   * Add new employee
   */
  addEmployee: async (employeeData: any): Promise<{
    success: boolean;
    message: string;
    employee?: any;
  }> => {
    console.log('[API] Adding new employee:', employeeData);
    const response = await api.post('/employees', employeeData);
    console.log('[API] Add employee response:', response.data);
    return response.data;
  },

  /**
   * Remove employee from directory by CFMS ID
   */
  removeEmployee: async (cfmsId: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    console.log('[API] Removing employee with CFMS ID:', cfmsId);
    const response = await api.delete(`/employees/remove/${cfmsId}`);
    console.log('[API] Remove employee response:', response.data);
    return response.data;
  },
};

export default api;
