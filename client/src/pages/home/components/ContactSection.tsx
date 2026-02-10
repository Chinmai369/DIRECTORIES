
import { useMemo, useEffect, useState } from 'react';
import { employeeService } from '../../../services/api';
import { mapBackendToFrontendEmployee, type Employee } from '../../../types/employee';
import { exportContactToExcel } from '../../../utils/exportUtils';

interface ContactSectionProps {
  searchTerm: string;
}

export default function ContactSection({ searchTerm }: ContactSectionProps) {
  const [personnelData, setPersonnelData] = useState<Employee[]>([]);
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

        console.log('[ContactSection] Fetching employees with params:', params);
        const response = await employeeService.getEmployees(params);
        console.log('[ContactSection] API response:', {
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
        console.log('[ContactSection] Mapped employees count:', mappedEmployees.length);
        setPersonnelData(mappedEmployees);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch employees. Please try again.';
        setError(errorMessage);
        console.error('[ContactSection] Error fetching employees:', {
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
    exportContactToExcel(filteredData);
  };

  return (
    <section id="contact" className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Direct contact details for all department heads and commissioners
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
            <p className="text-gray-600">Loading contact information...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <i className="ri-error-warning-line text-red-600 text-3xl mb-2"></i>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">S.No</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Designation</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Mobile</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Office</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((person, index) => (
                <tr key={person.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{person.name}</div>
                    <div className="text-sm text-gray-500">{person.cfmsId}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{person.designation}</td>
                  <td className="px-6 py-4">
                    <a href={`mailto:${person.email}`} className="text-sm text-teal-600 hover:text-teal-700 cursor-pointer">
                      {person.email}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{person.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{person.mobile}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{person.office}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </section>
  );
}
