import { useMemo, useEffect, useState } from 'react';
import { employeeService } from '../../../services/api';
import { mapBackendToFrontendEmployee, type Employee } from '../../../types/employee';
import { exportDatesToExcel } from '../../../utils/exportUtils';
import { safeCreateDate, safeFormatDate } from '../../../utils/dateUtils';

interface DatesSectionProps {
  searchTerm: string;
}

export default function DatesSection({ searchTerm }: DatesSectionProps) {
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

        console.log('[DatesSection] Fetching employees with params:', params);
        const response = await employeeService.getEmployees(params);
        console.log('[DatesSection] API response:', {
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
        console.log('[DatesSection] Mapped employees count:', mappedEmployees.length);
        setPersonnelData(mappedEmployees);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch employees. Please try again.';
        setError(errorMessage);
        console.error('[DatesSection] Error fetching employees:', {
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
    exportDatesToExcel(filteredData);
  };

  const upcomingBirthdays = useMemo(() => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    
    return filteredData.filter(person => {
      const birthday = safeCreateDate(person.birthday);
      if (!birthday) return false;
      const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
      return thisYearBirthday >= today && thisYearBirthday <= nextMonth;
    }).sort((a, b) => {
      const dateA = safeCreateDate(a.birthday);
      const dateB = safeCreateDate(b.birthday);
      if (!dateA || !dateB) return 0;
      return dateA.getMonth() - dateB.getMonth() || dateA.getDate() - dateB.getDate();
    });
  }, [filteredData]);

  const upcomingRetirements = useMemo(() => {
    const today = new Date();
    const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    
    return filteredData.filter(person => {
      const retirement = safeCreateDate(person.retirementDate);
      if (!retirement) return false;
      return retirement >= today && retirement <= nextYear;
    }).sort((a, b) => {
      const dateA = safeCreateDate(a.retirementDate);
      const dateB = safeCreateDate(b.retirementDate);
      if (!dateA || !dateB) return 0;
      return dateA.getTime() - dateB.getTime();
    });
  }, [filteredData]);

  const formatDate = (dateString: string) => {
    return safeFormatDate(dateString, 'Invalid Date');
  };

  const calculateAge = (birthday: string) => {
    const birthDate = safeCreateDate(birthday);
    if (!birthDate) return 0;
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <section id="dates" className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Important Dates</h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Track birthdays, retirement dates, and service milestones
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
            <p className="text-gray-600">Loading important dates...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-12">
            <i className="ri-error-warning-line text-red-600 text-3xl mb-2"></i>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center">
                <i className="ri-cake-3-line text-white text-2xl"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Upcoming Birthdays</h3>
                <p className="text-sm text-gray-600">Next 30 days</p>
              </div>
            </div>

            <div className="space-y-4">
              {upcomingBirthdays.length > 0 ? (
                upcomingBirthdays.map((person) => (
                  <div key={person.id} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{person.name}</h4>
                        <p className="text-sm text-gray-600">{person.designation}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-teal-600">{formatDate(person.birthday)}</p>
                        <p className="text-xs text-gray-500">Turning {calculateAge(person.birthday) + 1}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No upcoming birthdays in the next 30 days</p>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                <i className="ri-calendar-check-line text-white text-2xl"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Upcoming Retirements</h3>
                <p className="text-sm text-gray-600">Next 12 months</p>
              </div>
            </div>

            <div className="space-y-4">
              {upcomingRetirements.length > 0 ? (
                upcomingRetirements.map((person) => (
                  <div key={person.id} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{person.name}</h4>
                        <p className="text-sm text-gray-600">{person.designation}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-orange-600">{formatDate(person.retirementDate)}</p>
                        <p className="text-xs text-gray-500">Service since {new Date(person.joiningDate).getFullYear()}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No retirements scheduled in the next 12 months</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">S.No</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Birthday</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Age</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Joining Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Retirement Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Years of Service</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((person, index) => {
                  const yearsOfService = new Date().getFullYear() - new Date(person.joiningDate).getFullYear();
                  return (
                    <tr key={person.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{person.name}</div>
                        <div className="text-sm text-gray-500">{person.designation}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{formatDate(person.birthday)}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{calculateAge(person.birthday)} years</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{formatDate(person.joiningDate)}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{formatDate(person.retirementDate)}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{yearsOfService} years</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}
      </div>
    </section>
  );
}
