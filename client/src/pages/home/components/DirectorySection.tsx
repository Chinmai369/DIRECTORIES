import { useState, useMemo, useEffect } from 'react';
import ExportButtons from '../../../components/feature/ExportButtons';
import { employeeService } from '../../../services/api';
import { mapBackendToFrontendEmployee, type Employee } from '../../../types/employee';

interface DirectorySectionProps {
  searchTerm: string;
  selectedDepartment: string;
}

export default function DirectorySection({ searchTerm, selectedDepartment }: DirectorySectionProps) {
  const [sortBy, setSortBy] = useState<'name' | 'department' | 'designation'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [personnelData, setPersonnelData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch employees from API
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: any = {
          page: 1,
          limit: 1000, // Fetch all for directory view
          // Note: position filter removed - showing all employees
        };

        if (searchTerm) {
          params.search = searchTerm;
        }

        if (selectedDepartment !== 'all') {
          params.dept_id = selectedDepartment;
        }

        console.log('[DirectorySection] Fetching employees with params:', params);
        const response = await employeeService.getEmployees(params);
        console.log('[DirectorySection] API response:', {
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
        console.log('[DirectorySection] Mapped employees count:', mappedEmployees.length);
        setPersonnelData(mappedEmployees);
        setTotalRecords(response.total);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch employees. Please try again.';
        setError(errorMessage);
        console.error('[DirectorySection] Error fetching employees:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [searchTerm, selectedDepartment]);

  const filteredAndSortedData = useMemo(() => {
    let filtered = personnelData.filter(person => {
      const matchesSearch = searchTerm === '' || 
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.cfmsId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.designation.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = selectedDepartment === 'all' || person.department === selectedDepartment;
      
      return matchesSearch && matchesDepartment;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'department') {
        comparison = a.department.localeCompare(b.department);
      } else if (sortBy === 'designation') {
        comparison = a.designation.localeCompare(b.designation);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [searchTerm, selectedDepartment, sortBy, sortOrder, personnelData]);

  const toggleSort = (field: 'name' | 'department' | 'designation') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <section id="directory" className="py-20 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Personnel Directory</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete listing of all HODs and Commissioners with their detailed information
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md mb-6 p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <button
              onClick={() => toggleSort('name')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                sortBy === 'name' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => toggleSort('department')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                sortBy === 'department' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Department {sortBy === 'department' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => toggleSort('designation')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                sortBy === 'designation' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Designation {sortBy === 'designation' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <div className="ml-auto flex items-center gap-4">
              {loading ? (
                <span className="text-sm text-gray-600">Loading...</span>
              ) : error ? (
                <span className="text-sm text-red-600">Error: {error}</span>
              ) : (
                <span className="text-sm text-gray-600">
                  Showing {filteredAndSortedData.length} of {totalRecords} personnel
                </span>
              )}
              {!loading && !error && (
                <ExportButtons data={filteredAndSortedData} filename="CDMA_Personnel_Directory" />
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading personnel directory...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <i className="ri-error-warning-line text-red-600 text-3xl mb-2"></i>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Data Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedData.map((person) => (
            <div key={person.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden relative">
              <div className="h-48 w-full overflow-hidden">
                <img 
                  src={person.photo} 
                  alt={person.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{person.name}</h3>
                <p className="text-sm font-medium text-teal-600 mb-1">{person.designation}</p>
                <p className="text-sm text-gray-600 mb-4 capitalize">{person.department} Department</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <i className="ri-id-card-line text-gray-400 w-5 h-5 flex items-center justify-center"></i>
                    <span className="text-gray-700"><strong>CFMS:</strong> {person.cfmsId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <i className="ri-user-line text-gray-400 w-5 h-5 flex items-center justify-center"></i>
                    <span className="text-gray-700"><strong>Emp ID:</strong> {person.employeeId}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium whitespace-nowrap cursor-pointer">
                    View Full Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {!loading && !error && filteredAndSortedData.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-search-line text-6xl text-gray-300 mb-4"></i>
            <p className="text-xl text-gray-500">No personnel found matching your criteria</p>
          </div>
        )}
      </div>
    </section>
  );
}
