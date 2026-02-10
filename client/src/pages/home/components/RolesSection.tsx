import { useMemo, useEffect, useState } from 'react';
import { employeeService } from '../../../services/api';
import { mapBackendToFrontendEmployee, type Employee } from '../../../types/employee';

interface RolesSectionProps {
  searchTerm: string;
}

export default function RolesSection({ searchTerm }: RolesSectionProps) {
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

        console.log('[RolesSection] Fetching employees with params:', params);
        const response = await employeeService.getEmployees(params);
        console.log('[RolesSection] API response:', {
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
        console.log('[RolesSection] Mapped employees count:', mappedEmployees.length);
        setPersonnelData(mappedEmployees);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch employees. Please try again.';
        setError(errorMessage);
        console.error('[RolesSection] Error fetching employees:', {
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

  return (
    <section id="roles" className="py-20 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Roles & Responsibilities</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Detailed overview of departmental responsibilities and key functions
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading roles and responsibilities...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <i className="ri-error-warning-line text-red-600 text-3xl mb-2"></i>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredData.map((person) => (
            <div key={person.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                  <img 
                    src={person.photo} 
                    alt={person.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{person.name}</h3>
                  <p className="text-sm font-medium text-teal-600">{person.designation}</p>
                  <p className="text-sm text-gray-600 capitalize">{person.department} Department</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <i className="ri-briefcase-line text-teal-600 mt-1 w-5 h-5 flex items-center justify-center"></i>
                  <div>
                    <strong className="text-gray-700">Current:</strong>
                    <p className="text-gray-600">{person.currentPosition}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <i className="ri-history-line text-gray-400 mt-1 w-5 h-5 flex items-center justify-center"></i>
                  <div>
                    <strong className="text-gray-700">Previous:</strong>
                    <p className="text-gray-600">{person.previousPosition}</p>
                  </div>
                </div>
              </div>

              <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Responsibilities</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{person.responsibilities}</p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {person.responsibilities.split(',').map((resp, index) => (
                  <span key={index} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">
                    {resp.trim()}
                  </span>
                ))}
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </section>
  );
}
