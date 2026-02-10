
import { useMemo, useEffect, useState } from 'react';
import { employeeService } from '../../../services/api';
import { mapBackendToFrontendEmployee, type Employee } from '../../../types/employee';
import { exportPositionsToExcel } from '../../../utils/exportUtils';
import { safeCreateDate } from '../../../utils/dateUtils';

interface ChargesSectionProps {
  searchTerm: string;
}

export default function ChargesSection({ searchTerm }: ChargesSectionProps) {
  const [personnelData, setPersonnelData] = useState<Employee[]>([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: any = {
          page: 1,
          limit: 1000,
          // Note: position filter removed - showing all employees
        };

        if (searchTerm) {
          params.search = searchTerm;
        }

        console.log('[ChargesSection] Fetching employees with params:', params);
        const response = await employeeService.getEmployees(params);
        console.log('[ChargesSection] API response:', {
          success: response.success,
          total: response.total,
          rowsCount: response.rows?.length || 0
        });
        
        if (!response.rows || !Array.isArray(response.rows)) {
          throw new Error('Invalid response: rows is not an array');
        }
        
        const mappedEmployees = response.rows.map((backend, index) =>
          mapBackendToFrontendEmployee(backend, index)
        );
        console.log('[ChargesSection] Mapped employees count:', mappedEmployees.length);
        setPersonnelData(mappedEmployees);
        setTotalEmployees(response.total || 0);
        console.log('[ChargesSection] Card counts:', {
          pageRowsCount: mappedEmployees.length,
          backendTotal: response.total,
          totalUsed: response.total || mappedEmployees.length
        });
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch employees. Please try again.';
        setError(errorMessage);
        console.error('[ChargesSection] Error fetching employees:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [searchTerm]);

  const filteredData = useMemo(() => {
    if (searchTerm === '') return personnelData;
    return personnelData.filter(person => 
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.cfmsId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, personnelData]);

  const handleExport = () => {
    exportPositionsToExcel(filteredData);
  };

  const personnelWithCharges = useMemo(() => {
    return filteredData.filter(person => person.charges !== 'None');
  }, [filteredData]);

  return (
    <section id="charges" className="py-20 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Positions & Status</h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Current positions, career progression, and administrative status
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap self-center md:self-auto"
          >
            <i className="ri-file-excel-2-line text-lg"></i>
            Export to Excel
          </button>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading positions and status...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-8">
            <i className="ri-error-warning-line text-red-600 text-3xl mb-2"></i>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
        {personnelWithCharges.length > 0 && (
          <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <i className="ri-alert-line text-orange-600 text-2xl mt-1"></i>
              <div>
                <h3 className="text-lg font-semibold text-orange-900 mb-2">Personnel Under Investigation</h3>
                <div className="space-y-3">
                  {personnelWithCharges.map((person) => (
                    <div key={person.id} className="bg-white rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">{person.name}</h4>
                          <p className="text-sm text-gray-600">{person.designation} - {person.department}</p>
                        </div>
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium whitespace-nowrap">
                          Under Inquiry
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-700"><strong>Status:</strong> {person.charges}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">S.No</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name & IDs</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Current Position</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Previous Position</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Department</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((person, index) => (
                  <tr key={person.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{person.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        <div>CFMS: {person.cfmsId}</div>
                        <div>Emp: {person.employeeId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{person.currentPosition}</div>
                      <div className="text-xs text-gray-500">Since {safeCreateDate(person.joiningDate)?.getFullYear() || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{person.previousPosition}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium capitalize whitespace-nowrap">
                        {person.department}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {person.charges === 'None' ? (
                        <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium whitespace-nowrap">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium whitespace-nowrap">
                          Under Review
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-user-line text-teal-600 text-3xl"></i>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{totalEmployees || personnelData.length}</h3>
            <p className="text-sm text-gray-600">Total Personnel</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-shield-check-line text-green-600 text-3xl"></i>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{personnelData.length - personnelWithCharges.length}</h3>
            <p className="text-sm text-gray-600">Active Status</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-alert-line text-orange-600 text-3xl"></i>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{personnelWithCharges.length}</h3>
            <p className="text-sm text-gray-600">Under Review</p>
          </div>
        </div>
        </>
        )}
      </div>
    </section>
  );
}
