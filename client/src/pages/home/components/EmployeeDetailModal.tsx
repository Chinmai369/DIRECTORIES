import { useEffect, useState } from 'react';
import { employeeService } from '../../../services/api';
import { safeFormatDate } from '../../../utils/dateUtils';

interface EmployeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
}

interface EmployeeDetail {
  employeeid: string;
  cfms_id: string;
  name: string;
  surname: string;
  fathername: string;
  designation: string;
  department_name: string;
  distname: string;
  mobileno: string;
  email1: string;
  dob?: string | Date | null;
  dor?: string | Date | null;
  gender_desc?: string;
  employee_status?: string;
  basicpay?: number;
  gross?: number;
}

export default function EmployeeDetailModal({ isOpen, onClose, employeeId }: EmployeeDetailModalProps) {
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && employeeId) {
      const fetchEmployee = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await employeeService.getEmployeeById(employeeId);
          setEmployee(data as EmployeeDetail);
        } catch (err: any) {
          if (err.response?.status === 404) {
            setError('Employee not found');
          } else {
            setError(err.response?.data?.message || err.message || 'Failed to load employee details');
          }
        } finally {
          setLoading(false);
        }
      };

      fetchEmployee();
    } else {
      setEmployee(null);
      setError(null);
    }
  }, [isOpen, employeeId]);

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-3 rounded-t-xl flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold truncate">
              {loading ? 'Loading...' : employee ? `${employee.name} ${employee.surname}` : 'Employee Details'}
            </h2>
            <p className="text-teal-100 text-xs mt-0.5 truncate">
              {employee?.designation || 'Employee Profile'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1.5 transition-all hover:scale-110 ml-2 flex-shrink-0"
            aria-label="Close"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-3">
          {loading && (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-2"></div>
              <p className="text-gray-600 text-xs">Loading...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center animate-pulse">
              <i className="ri-error-warning-line text-red-600 text-xl mb-2"></i>
              <p className="text-red-800 font-semibold text-xs">{error}</p>
            </div>
          )}

          {!loading && !error && employee && (
            <div className="space-y-2.5 animate-fadeIn">
              {/* Personal Information Card */}
              <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-100 hover:shadow-md transition-shadow">
                <h3 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                  <i className="ri-user-line text-blue-600 text-sm"></i>
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 gap-1.5">
                  <div className="flex justify-between items-center py-0.5 border-b border-gray-200 last:border-0">
                    <label className="text-xs font-medium text-gray-500">Employee ID</label>
                    <p className="text-xs text-gray-900 font-mono text-right">{employee.employeeid}</p>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-gray-200 last:border-0">
                    <label className="text-xs font-medium text-gray-500">CFMS ID</label>
                    <p className="text-xs text-gray-900 font-mono text-right">{employee.cfms_id || 'N/A'}</p>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-gray-200 last:border-0">
                    <label className="text-xs font-medium text-gray-500">Full Name</label>
                    <p className="text-xs text-gray-900 font-medium text-right truncate ml-2">{employee.name} {employee.surname}</p>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-gray-200 last:border-0">
                    <label className="text-xs font-medium text-gray-500">Father's Name</label>
                    <p className="text-xs text-gray-900 text-right truncate ml-2">{employee.fathername || 'N/A'}</p>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-gray-200 last:border-0">
                    <label className="text-xs font-medium text-gray-500">Date of Birth</label>
                    <p className="text-xs text-gray-900 text-right">
                      {employee.dob 
                        ? (typeof employee.dob === 'string' 
                            ? safeFormatDate(employee.dob, 'N/A')
                            : employee.dob instanceof Date
                            ? safeFormatDate(employee.dob.toISOString().split('T')[0], 'N/A')
                            : 'N/A')
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <label className="text-xs font-medium text-gray-500">Gender</label>
                    <p className="text-xs text-gray-900 text-right">{employee.gender_desc || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Employment Information Card */}
              <div className="bg-purple-50 rounded-lg p-2.5 border border-purple-100 hover:shadow-md transition-shadow">
                <h3 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                  <i className="ri-briefcase-line text-purple-600 text-sm"></i>
                  Employment Information
                </h3>
                <div className="grid grid-cols-1 gap-1.5">
                  <div className="flex justify-between items-center py-0.5 border-b border-gray-200 last:border-0">
                    <label className="text-xs font-medium text-gray-500">Designation</label>
                    <p className="text-xs text-gray-900 font-medium text-right truncate ml-2">{employee.designation || 'N/A'}</p>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-gray-200 last:border-0">
                    <label className="text-xs font-medium text-gray-500">Department</label>
                    <p className="text-xs text-gray-900 text-right truncate ml-2">{employee.department_name || 'N/A'}</p>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-gray-200 last:border-0">
                    <label className="text-xs font-medium text-gray-500">District</label>
                    <p className="text-xs text-gray-900 text-right truncate ml-2">{employee.distname || 'N/A'}</p>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-gray-200 last:border-0">
                    <label className="text-xs font-medium text-gray-500">Status</label>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                      employee.employee_status === 'Regular' || employee.employee_status === '1'
                        ? 'bg-emerald-100 text-emerald-800'
                        : employee.employee_status === 'Incharge' || employee.employee_status === '2'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {employee.employee_status || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <label className="text-xs font-medium text-gray-500">Date of Retirement</label>
                    <p className="text-xs text-gray-900 text-right">
                      {employee.dor 
                        ? (typeof employee.dor === 'string' 
                            ? safeFormatDate(employee.dor, 'N/A')
                            : employee.dor instanceof Date
                            ? safeFormatDate(employee.dor.toISOString().split('T')[0], 'N/A')
                            : 'N/A')
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information Card */}
              <div className="bg-green-50 rounded-lg p-2.5 border border-green-100 hover:shadow-md transition-shadow">
                <h3 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                  <i className="ri-phone-line text-green-600 text-sm"></i>
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 gap-1.5">
                  <div className="flex justify-between items-center py-0.5 border-b border-gray-200 last:border-0">
                    <label className="text-xs font-medium text-gray-500">Mobile Number</label>
                    <p className="text-xs text-gray-900 font-mono text-right">{employee.mobileno || 'N/A'}</p>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <label className="text-xs font-medium text-gray-500">Email</label>
                    <p className="text-xs text-gray-900 text-right truncate ml-2">{employee.email1 || 'N/A'}</p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-2 rounded-b-xl flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all text-xs font-medium hover:scale-105 active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
