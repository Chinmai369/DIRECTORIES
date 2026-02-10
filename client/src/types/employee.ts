// Import safe date parsing utility
import { safeParseDate } from '../utils/dateUtils';

// Backend Employee model fields (from Sequelize model)
export interface BackendEmployee {
  employeeid: string;
  cfms_id: string;
  name: string;
  surname: string;
  fathername: string;
  designation: string;
  desgcode: string;
  dept_id: number;
  department_name: string;
  department_code: string;
  distcode: string;
  distname: string;
  description_long?: string;
  mobileno: string;
  email1: string;
  doj?: string | Date | null; // Date of joining (optional, can be null/empty)
  dor?: string | Date | null; // Date of retirement (optional, can be null/empty)
  dob?: string | Date | null; // Date of birth (optional, can be null/empty)
  basicpay?: number;
  gross?: number;
  gender_desc?: string;
  employee_status?: string;
  position_name?: string; // For commissioner filter
}

// Frontend Employee interface (mapped from backend)
export interface Employee {
  id: number; // Generated from employeeid or index
  name: string;
  designation: string;
  department: string; // Position column: description_long (ULB name), fallback distname, department_name
  cfmsId: string; // Maps from cfms_id
  employeeId: string; // Maps from employeeid
  email: string; // Maps from email1
  phone: string; // Maps from mobileno
  mobile: string; // Maps from mobileno
  office: string; // Generated from department_name
  birthday: string; // Not in backend - may need to calculate or use default
  retirementDate: string; // Maps from dor
  joiningDate: string; // Maps from doj
  currentPosition: string; // Generated from designation + department
  previousPosition: string; // Not in backend - default value
  charges: string; // Not in backend - default "None"
  responsibilities: string; // Maps from employee_status or default
  photo: string; // Not in backend - placeholder or generated
}

// API Response types
export interface EmployeesResponse {
  success: boolean;
  total: number;
  rows: BackendEmployee[];
}

export interface EmployeesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  distcode?: string;
  dept_id?: number;
  designation?: string;
  position?: string; // For commissioner filter (COMM)
  status?: 'regular' | 'incharge' | 'suspended'; // Card filter: status
  birthdayMonth?: 'current' | 'next'; // Card filter: birthday month
  retiringYear?: 'current'; // Card filter: retiring year
}

/**
 * Legacy safeDate function - kept for backward compatibility
 * Now uses safeParseDate internally and converts null to empty string
 * @deprecated Use safeParseDate instead for better null handling
 */
function safeDate(value: string | Date | null | undefined): string {
  const result = safeParseDate(value);
  return result || '';
}

// Re-export safeParseDate for convenience
export { safeParseDate };

// Helper function to map backend employee to frontend employee
// Never throws - always returns a valid Employee object, even with bad backend data
export function mapBackendToFrontendEmployee(
  backend: BackendEmployee,
  index: number
): Employee {
  try {
    // Generate photo URL placeholder (or use a default)
    const photoPlaceholder = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      backend.name || 'Employee'
    )}&size=400&background=random`;

    // Map employee_status to responsibilities
    const responsibilities =
      backend.employee_status === "Regular" ||
      backend.employee_status === "REGULAR"
        ? "Regular"
        : backend.employee_status === "Incharge" ||
          backend.employee_status === "INCHARGE"
        ? "Incharge"
        : "Regular"; // Default

    // Calculate birthday placeholder (not available in backend)
    // Using a default date or can be calculated from age if available
    const defaultBirthday = "1970-01-01";

    // Safely parse dates - handle null, empty strings, DD/MM/YYYY format, or invalid dates
    const retirementDate = safeParseDate(backend.dor) || '';
    const joiningDate = safeParseDate(backend.doj) || '';
    
    // Handle dob (date of birth) if it exists in backend data
    const birthday = safeParseDate(backend.dob) || defaultBirthday;
    
    // Log date parsing for first few records (temporary debugging)
    if (index < 3) {
      console.log(`[mapBackendToFrontendEmployee] Date parsing for employee ${index + 1}:`, {
        rawDoj: backend.doj,
        parsedJoiningDate: joiningDate || 'null',
        rawDor: backend.dor,
        parsedRetirementDate: retirementDate || 'null',
        rawDob: backend.dob,
        parsedBirthday: birthday
      });
    }

    const mapped: Employee = {
      id: index + 1,
      name: `${backend.name || ""} ${backend.surname || ""}`.trim() || `Employee ${index + 1}`,
      designation: backend.designation || "",
      department: backend.description_long || backend.distname || backend.department_name || "",
      cfmsId: backend.cfms_id || "",
      employeeId: backend.employeeid || "",
      email: backend.email1 || "",
      phone: backend.mobileno || "",
      mobile: backend.mobileno || "",
      office: `${backend.description_long || backend.distname || backend.department_name || ""} Municipal Office`.trim() || "Municipal Office",
      birthday: birthday || defaultBirthday, // Use dob if available, otherwise default
      retirementDate: retirementDate,
      joiningDate: joiningDate,
      currentPosition: `${backend.designation || ""} - ${backend.description_long || backend.distname || backend.department_name || ""}`.trim() || "Unknown Position",
      previousPosition: "Assistant Commissioner", // Default value
      charges: "None", // Default value
      responsibilities,
      photo: photoPlaceholder,
    };

    // Log successful mapping (only for first few records to avoid spam)
    if (index < 3) {
      console.log(`[mapBackendToFrontendEmployee] Successfully mapped employee ${index + 1}:`, {
        employeeId: mapped.employeeId,
        name: mapped.name,
        retirementDate: mapped.retirementDate || 'empty',
        joiningDate: mapped.joiningDate || 'empty',
        birthday: mapped.birthday
      });
    }

    return mapped;
  } catch (error) {
    // Never throw - return a safe default Employee object
    console.error(`[mapBackendToFrontendEmployee] Error mapping employee at index ${index}:`, error, backend);
    
    return {
      id: index + 1,
      name: backend.name || `Employee ${index + 1}`,
      designation: backend.designation || "",
      department: backend.description_long || backend.distname || backend.department_name || "",
      cfmsId: backend.cfms_id || "",
      employeeId: backend.employeeid || "",
      email: backend.email1 || "",
      phone: backend.mobileno || "",
      mobile: backend.mobileno || "",
      office: `${backend.description_long || backend.distname || backend.department_name || ""} Municipal Office`.trim() || "Municipal Office",
      birthday: "1970-01-01",
      retirementDate: "",
      joiningDate: "",
      currentPosition: `${backend.designation || ""} - ${backend.description_long || backend.distname || backend.department_name || ""}`.trim() || "Unknown Position",
      previousPosition: "Assistant Commissioner",
      charges: "None",
      responsibilities: "Regular",
      photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(backend.name || 'Employee')}&size=400&background=random`,
    };
  }
}
