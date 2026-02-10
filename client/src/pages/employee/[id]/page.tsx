import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { employeeService } from '../../../services/api';
import { safeFormatDate } from '../../../utils/dateUtils';
import Navbar from '../../home/components/Navbar';
import Footer from '../../home/components/Footer';

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

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!id) {
        setError('Employee ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await employeeService.getEmployeeById(id);
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
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-20 pb-8">
          <div className="max-w-6xl mx-auto px-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
                <p className="text-gray-600 text-sm">Loading employee details...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-20 pb-8">
          <div className="max-w-6xl mx-auto px-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3">
                <i className="ri-error-warning-line text-red-600 text-xl"></i>
                <div>
                  <h3 className="text-red-800 font-semibold mb-1">Error Loading Employee</h3>
                  <p className="text-red-600 text-sm">{error || 'Employee not found'}</p>
                  <button
                    onClick={() => navigate('/')}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Back to List
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="mb-6 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <i className="ri-arrow-left-line"></i>
            <span>Back to Employee List</span>
          </button>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {employee.name} {employee.surname}
            </h1>
            <p className="text-gray-600">{employee.designation || 'Employee Profile'}</p>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            {/* Personal Information Section */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Employee ID</label>
                  <p className="text-sm text-gray-900 font-mono mt-1">{employee.employeeid}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">CFMS ID</label>
                  <p className="text-sm text-gray-900 font-mono mt-1">{employee.cfms_id || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-sm text-gray-900 mt-1">{employee.name} {employee.surname}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Father's Name</label>
                  <p className="text-sm text-gray-900 mt-1">{employee.fathername || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {employee.dob 
                      ? (typeof employee.dob === 'string' 
                          ? safeFormatDate(employee.dob, 'N/A')
                          : employee.dob instanceof Date
                          ? safeFormatDate(employee.dob.toISOString().split('T')[0], 'N/A')
                          : 'N/A')
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Gender</label>
                  <p className="text-sm text-gray-900 mt-1">{employee.gender_desc || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Employment Information Section */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Employment Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Designation</label>
                  <p className="text-sm text-gray-900 mt-1">{employee.designation || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="text-sm text-gray-900 mt-1">{employee.department_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">District</label>
                  <p className="text-sm text-gray-900 mt-1">{employee.distname || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Employee Status</label>
                  <p className="text-sm text-gray-900 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      employee.employee_status === 'Regular' || employee.employee_status === '1'
                        ? 'bg-emerald-100 text-emerald-800'
                        : employee.employee_status === 'Incharge' || employee.employee_status === '2'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {employee.employee_status || 'N/A'}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Retirement</label>
                  <p className="text-sm text-gray-900 mt-1">
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

            {/* Contact Information Section */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Mobile Number</label>
                  <p className="text-sm text-gray-900 font-mono mt-1">{employee.mobileno || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm text-gray-900 mt-1">{employee.email1 || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Financial Information Section */}
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Basic Pay</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {employee.basicpay ? `₹${employee.basicpay.toLocaleString('en-IN')}` : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Gross Salary</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {employee.gross ? `₹${employee.gross.toLocaleString('en-IN')}` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
