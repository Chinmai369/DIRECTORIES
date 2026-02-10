import { useState, useMemo, useRef, useEffect } from 'react';
import Navbar from './components/Navbar';
import StatsSection from './components/StatsSection';
import DataTable from './components/DataTable';
import Footer from './components/Footer';
import AddEmployeeModal from './components/AddEmployeeModal';
import RemoveEmployeeModal from './components/RemoveEmployeeModal';
import { employeeService } from '../../services/api';
import { mapBackendToFrontendEmployee, type Employee } from '../../types/employee';
import { safeCreateDate } from '../../utils/dateUtils';

const filterLabels: Record<string, { title: string; icon: string; color: string; bgColor: string }> = {
  all: { title: 'All Personnel', icon: 'ri-team-line', color: 'text-teal-600', bgColor: 'bg-teal-50 border-teal-200' },
  regular: { title: 'Regular Status Personnel', icon: 'ri-user-follow-line', color: 'text-emerald-600', bgColor: 'bg-emerald-50 border-emerald-200' },
  incharge: { title: 'Incharge Status Personnel', icon: 'ri-user-shared-line', color: 'text-amber-600', bgColor: 'bg-amber-50 border-amber-200' },
  birthdaysThisMonth: { title: 'Birthdays This Month', icon: 'ri-cake-2-line', color: 'text-pink-600', bgColor: 'bg-pink-50 border-pink-200' },
  birthdaysNextMonth: { title: 'Birthdays Next Month', icon: 'ri-gift-line', color: 'text-rose-600', bgColor: 'bg-rose-50 border-rose-200' },
  leaveToday: { title: 'On Leave Today', icon: 'ri-calendar-check-line', color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200' },
  leaveTomorrow: { title: 'Leave Tomorrow', icon: 'ri-calendar-todo-line', color: 'text-yellow-600', bgColor: 'bg-yellow-50 border-yellow-200' },
  upcomingLeaves: { title: 'Upcoming Leaves', icon: 'ri-calendar-event-line', color: 'text-cyan-600', bgColor: 'bg-cyan-50 border-cyan-200' },
  suspended: { title: 'Suspended Personnel', icon: 'ri-user-forbid-line', color: 'text-red-600', bgColor: 'bg-red-50 border-red-200' },
  retiringThisYear: { title: 'Retiring This Year', icon: 'ri-user-unfollow-line', color: 'text-slate-600', bgColor: 'bg-slate-50 border-slate-200' }
};

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [designationFilter, setDesignationFilter] = useState<string>('all');
  const [cardFilter, setCardFilter] = useState<string | null>(null);
  
  // Card filter state for API params
  const [cardStatusFilter, setCardStatusFilter] = useState<'regular' | 'incharge' | 'suspended' | null>(null);
  const [cardBirthdayMonthFilter, setCardBirthdayMonthFilter] = useState<'current' | 'next' | null>(null);
  const [cardRetiringYearFilter, setCardRetiringYearFilter] = useState<'current' | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  
  // API state - ensure initialized as empty array
  const [personnelList, setPersonnelList] = useState<Employee[]>(() => {
    const initial: Employee[] = [];
    console.log('[Home] Initializing personnelList as array:', Array.isArray(initial));
    return initial;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(25); // Records per page from backend
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Calculate total pages from backend total
  const totalPages = Math.ceil(totalRecords / limit);
  
  console.log('[Home] Pagination state:', {
    currentPage,
    limit,
    totalRecords,
    totalPages,
    recordsOnPage: personnelList.length
  });
  
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Safety check: ensure personnelList is always an array (runs on every render)
  useEffect(() => {
    if (!Array.isArray(personnelList)) {
      console.error('[Home] personnelList corrupted, resetting to empty array. Current value:', personnelList);
      setPersonnelList([]);
    }
  }, [personnelList]);

  // Fetch employees from API
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: any = {
          page: currentPage,
          limit: limit,
        };

        // Add search parameter
        if (searchTerm) {
          params.search = searchTerm;
        }

        // Add district filter
        if (districtFilter !== 'all') {
          params.distcode = districtFilter;
        }

        // Add department filter
        if (departmentFilter !== 'all') {
          params.dept_id = departmentFilter;
        }

        // Add designation filter
        if (designationFilter !== 'all') {
          params.designation = designationFilter;
        }

        // Add card filter params
        if (cardStatusFilter) {
          params.status = cardStatusFilter;
        }
        if (cardBirthdayMonthFilter) {
          params.birthdayMonth = cardBirthdayMonthFilter;
        }
        if (cardRetiringYearFilter) {
          params.retiringYear = cardRetiringYearFilter;
        }

        // Note: position filter removed - showing all employees by default
        // To filter commissioners only, use designation filter instead

        console.log('[Home] Fetching employees with params:', params);
        console.log('[CardClick] filters:', params);
        const response = await employeeService.getEmployees(params);
        console.log('[Home] Raw response from service:', response);
        console.log('[Home] response type:', typeof response);
        console.log('[Home] response.rows:', response.rows);
        console.log('[Home] response.rows type:', typeof response.rows);
        console.log('[Home] response.rows isArray:', Array.isArray(response.rows));
        console.log('[Home] API response:', {
          success: response.success,
          total: response.total,
          rowsCount: response.rows?.length || 0,
          rowsIsArray: Array.isArray(response.rows),
          rowsType: typeof response.rows,
          fullResponse: response
        });
        
        // Ensure response.rows is an array
        if (!response.rows) {
          console.error('[Home] Response.rows is missing:', response);
          throw new Error('Invalid response: rows is missing');
        }
        
        if (!Array.isArray(response.rows)) {
          console.error('[Home] Response.rows is not an array:', {
            type: typeof response.rows,
            value: response.rows,
            fullResponse: response
          });
          throw new Error(`Invalid response: rows is not an array (type: ${typeof response.rows})`);
        }
        
        console.log('[Home] Confirmed rows is array with length:', response.rows.length);
        console.log('[Home] First row sample:', response.rows[0]);
        
        // Map backend employees to frontend format
        const mappedEmployees: Employee[] = [];
        try {
          response.rows.forEach((backend, index) => {
            try {
              const mapped = mapBackendToFrontendEmployee(backend, (currentPage - 1) * limit + index);
              mappedEmployees.push(mapped);
            } catch (mapErr) {
              console.error(`[Home] Error mapping employee at index ${index}:`, mapErr, backend);
            }
          });
        } catch (mapError) {
          console.error('[Home] Error during mapping:', mapError);
          throw new Error(`Mapping failed: ${mapError}`);
        }
        
        console.log('[Home] Mapped employees count:', mappedEmployees.length);
        console.log('[Home] Mapped employees is array:', Array.isArray(mappedEmployees));
        console.log('[Home] Mapped employees type:', typeof mappedEmployees);
        console.log('[Home] First mapped employee:', mappedEmployees[0]);
        
        // Ensure we're setting an array
        if (!Array.isArray(mappedEmployees)) {
          console.error('[Home] Mapped employees is not an array:', {
            type: typeof mappedEmployees,
            value: mappedEmployees
          });
          throw new Error('Mapping failed: result is not an array');
        }
        
        // Double-check before setting state
        if (mappedEmployees.length === 0) {
          console.warn('[Home] Warning: Mapped employees array is empty');
        }
        
        console.log('[Home] Setting personnelList state with array of length:', mappedEmployees.length);
        setPersonnelList(mappedEmployees);
        setTotalRecords(response.total || 0);
        console.log('[Home] State set successfully - total:', response.total, 'current page:', currentPage, 'limit:', limit);
        console.log('[Home] Pagination summary:', {
          pageRowsCount: mappedEmployees.length,
          backendTotal: response.total,
          currentPage,
          limit,
          totalPages: Math.ceil((response.total || 0) / limit)
        });
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch employees. Please try again.';
        setError(errorMessage);
        console.error('[Home] Error fetching employees:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          fullError: err
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [currentPage, limit, searchTerm, districtFilter, departmentFilter, designationFilter, cardStatusFilter, cardBirthdayMonthFilter, cardRetiringYearFilter]);
  
  // Track previous filter values to detect changes
  const prevFiltersRef = useRef({ 
    searchTerm, 
    districtFilter, 
    departmentFilter, 
    designationFilter,
    cardStatusFilter,
    cardBirthdayMonthFilter,
    cardRetiringYearFilter
  });
  
  // Reset to page 1 when filters/search change
  useEffect(() => {
    const prevFilters = prevFiltersRef.current;
    const filtersChanged = 
      prevFilters.searchTerm !== searchTerm ||
      prevFilters.districtFilter !== districtFilter ||
      prevFilters.departmentFilter !== departmentFilter ||
      prevFilters.designationFilter !== designationFilter ||
      prevFilters.cardStatusFilter !== cardStatusFilter ||
      prevFilters.cardBirthdayMonthFilter !== cardBirthdayMonthFilter ||
      prevFilters.cardRetiringYearFilter !== cardRetiringYearFilter;
    
    if (filtersChanged && currentPage !== 1) {
      console.log('[Home] Filters/search changed, resetting to page 1');
      setCurrentPage(1);
    }
    
    // Update ref for next comparison
    prevFiltersRef.current = { 
      searchTerm, 
      districtFilter, 
      departmentFilter, 
      designationFilter,
      cardStatusFilter,
      cardBirthdayMonthFilter,
      cardRetiringYearFilter
    };
  }, [searchTerm, districtFilter, departmentFilter, designationFilter, cardStatusFilter, cardBirthdayMonthFilter, cardRetiringYearFilter, currentPage]);

  const scrollToTable = () => {
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCardClick = (filterKey: string) => {
    console.log('[CardClick] Card clicked:', filterKey);
    
    // Toggle filter - click again to clear
    if (cardFilter === filterKey) {
      console.log('[CardClick] Clearing filter');
      setCardFilter(null);
      setStatusFilter('all');
      setCardStatusFilter(null);
      setCardBirthdayMonthFilter(null);
      setCardRetiringYearFilter(null);
      setCurrentPage(1); // Reset to page 1
    } else {
      console.log('[CardClick] Setting filter:', filterKey);
      setCardFilter(filterKey);
      setCurrentPage(1); // Reset to page 1 when filter changes
      
      // Clear conflicting filters
      setDistrictFilter('all');
      setDepartmentFilter('all');
      setDesignationFilter('all');
      setSearchTerm(''); // Optionally clear search
      
      // Set filter flags based on card type
      switch (filterKey) {
        case 'all':
          setCardStatusFilter(null);
          setCardBirthdayMonthFilter(null);
          setCardRetiringYearFilter(null);
          setStatusFilter('all');
          break;
        case 'regular':
          setCardStatusFilter('regular');
          setCardBirthdayMonthFilter(null);
          setCardRetiringYearFilter(null);
          setStatusFilter('regular');
          break;
        case 'incharge':
          setCardStatusFilter('incharge');
          setCardBirthdayMonthFilter(null);
          setCardRetiringYearFilter(null);
          setStatusFilter('incharge');
          break;
        case 'birthdaysThisMonth':
          setCardStatusFilter(null);
          setCardBirthdayMonthFilter('current');
          setCardRetiringYearFilter(null);
          setStatusFilter('all');
          break;
        case 'birthdaysNextMonth':
          setCardStatusFilter(null);
          setCardBirthdayMonthFilter('next');
          setCardRetiringYearFilter(null);
          setStatusFilter('all');
          break;
        case 'retiringThisYear':
          setCardStatusFilter(null);
          setCardBirthdayMonthFilter(null);
          setCardRetiringYearFilter('current');
          setStatusFilter('all');
          break;
        case 'suspended':
          setCardStatusFilter('suspended');
          setCardBirthdayMonthFilter(null);
          setCardRetiringYearFilter(null);
          setStatusFilter('all');
          break;
        default:
          // Leave/other cards - no backend filter yet
          setCardStatusFilter(null);
          setCardBirthdayMonthFilter(null);
          setCardRetiringYearFilter(null);
          break;
      }
      
      // Log the filters that will be applied (after state updates)
      setTimeout(() => {
        const params: any = {
          page: 1,
          limit: limit,
        };
        
        // Note: These will be read from state in the useEffect
        console.log('[CardClick] filters will be applied:', {
          cardStatusFilter,
          cardBirthdayMonthFilter,
          cardRetiringYearFilter,
          filterKey
        });
      }, 0);
      
      // Scroll to table after a brief delay to allow state update
      setTimeout(scrollToTable, 100);
    }
  };

  const filteredData = useMemo(() => {
    // Safety check: ensure personnelList is always an array
    if (!Array.isArray(personnelList)) {
      console.error('[Home] personnelList is not an array in filteredData:', {
        type: typeof personnelList,
        value: personnelList,
        isArray: Array.isArray(personnelList)
      });
      return [];
    }

    // When card filters are active (birthdayMonth, retiringYear, etc.), 
    // backend already filters the data, so we only apply search/status/designation filters
    // For card filters like 'regular'/'incharge', backend filters by status, so we don't need to filter again

    let filtered: Employee[] = [];
    try {
      filtered = personnelList.filter(person => {
        // Safety check for each person object
        if (!person || typeof person !== 'object') {
          console.warn('[Home] Invalid person object in filter:', person);
          return false;
        }
        
        // Search filter (always applies)
        const matchesSearch = !searchTerm || 
          (person.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
          (person.cfmsId?.includes(searchTerm) || false) ||
          (person.employeeId?.includes(searchTerm) || false) ||
          (person.department?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
          (person.mobile?.includes(searchTerm) || false);
        
        // Status filter (only if no backend card status filter is active)
        // When cardStatusFilter is set, backend already filtered by status
        const matchesStatus = cardStatusFilter ? true : (
          statusFilter === 'all' || 
          (statusFilter === 'regular' && person.responsibilities === 'Regular') ||
          (statusFilter === 'incharge' && person.responsibilities === 'Incharge')
        );
        
        // Designation filter
        const matchesRole = designationFilter === 'all' || 
          (person.designation?.toLowerCase().includes(designationFilter.toLowerCase()) || false);
        
        return matchesSearch && matchesStatus && matchesRole;
      });
    } catch (filterError) {
      console.error('[Home] Error during filtering:', filterError, {
        personnelListType: typeof personnelList,
        personnelListIsArray: Array.isArray(personnelList),
        personnelListValue: personnelList
      });
      return [];
    }
    
    console.log('[Home] Filtered data:', {
      totalRecords: personnelList.length,
      filteredCount: filtered.length,
      searchTerm,
      statusFilter,
      designationFilter,
      cardFilter,
      cardStatusFilter,
      cardBirthdayMonthFilter,
      cardRetiringYearFilter
    });
    
    // Ensure we return an array
    if (!Array.isArray(filtered)) {
      console.error('[Home] Filtered result is not an array:', {
        type: typeof filtered,
        value: filtered
      });
      return [];
    }
    
    return filtered;
  }, [searchTerm, statusFilter, designationFilter, cardFilter, cardStatusFilter, cardBirthdayMonthFilter, cardRetiringYearFilter, personnelList]);

  const handleAddEmployee = (newEmployee: Employee) => {
    setPersonnelList(prev => {
      // Safety check: ensure prev is an array
      if (!Array.isArray(prev)) {
        console.error('[Home] handleAddEmployee: prev is not an array:', prev);
        return [newEmployee];
      }
      return [...prev, newEmployee];
    });
    // In a real app, you would also call an API to add the employee
  };

  const handleRemoveEmployee = (cfmsId: string) => {
    setPersonnelList(prev => {
      // Safety check: ensure prev is an array
      if (!Array.isArray(prev)) {
        console.error('[Home] handleRemoveEmployee: prev is not an array:', prev);
        return [];
      }
      return prev.filter(emp => emp.cfmsId !== cfmsId);
    });
    // In a real app, you would also call an API to remove the employee
  };

  const currentFilterInfo = cardFilter ? filterLabels[cardFilter] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-20 pb-8">
        <div className="max-w-[1600px] mx-auto px-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Personnel Management Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">CDMA Department - Municipal Employees Directory</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Employees</p>
                <p className="text-2xl font-bold text-teal-600">{totalRecords.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <StatsSection 
            data={personnelList} 
            totalEmployees={totalRecords}
            activeFilter={cardFilter || undefined}
            onCardClick={handleCardClick}
          />

          {/* Table Section with Ref */}
          <div ref={tableRef} className="scroll-mt-24">
            {/* Dynamic Filter Heading */}
            {currentFilterInfo && (
              <div className={`rounded-xl shadow-sm border-2 p-5 mb-4 ${currentFilterInfo.bgColor}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-white/80 shadow-sm`}>
                      <i className={`${currentFilterInfo.icon} ${currentFilterInfo.color} text-2xl w-7 h-7 flex items-center justify-center`}></i>
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${currentFilterInfo.color.replace('600', '700')}`}>{currentFilterInfo.title}</h2>
                      <p className={`text-sm ${currentFilterInfo.color.replace('600', '500')} mt-0.5`}>
                        Showing <span className="font-semibold">{filteredData.length}</span> {filteredData.length === 1 ? 'record' : 'records'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCardFilter(null);
                      setStatusFilter('all');
                      setCardStatusFilter(null);
                      setCardBirthdayMonthFilter(null);
                      setCardRetiringYearFilter(null);
                      setCurrentPage(1);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 bg-white/80 hover:bg-white ${currentFilterInfo.color.replace('600', '600')} hover:${currentFilterInfo.color.replace('600', '700')} rounded-lg transition-all text-sm font-medium cursor-pointer shadow-sm hover:shadow`}
                  >
                    <i className="ri-close-line text-lg"></i>
                    Clear Filter
                  </button>
                </div>
              </div>
            )}

            {/* Add/Remove Employee Buttons */}
            <div className="flex justify-end gap-2 mb-3">
              <button
                onClick={() => setIsRemoveModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors text-sm font-medium cursor-pointer shadow-sm hover:shadow whitespace-nowrap"
              >
                <i className="ri-user-unfollow-line text-base"></i>
                Remove Employee
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium cursor-pointer shadow-sm hover:shadow whitespace-nowrap"
              >
                <i className="ri-user-add-line text-base"></i>
                Add Employee
              </button>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
                  <div className="relative flex-1 min-w-[280px]">
                    <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                      type="text"
                      placeholder="Search by Name, CFMS ID, Employee ID, Municipality, Mobile..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm cursor-pointer bg-white min-w-[140px]"
                  >
                    <option value="all">All Status</option>
                    <option value="regular">Regular</option>
                    <option value="incharge">Incharge</option>
                  </select>
                  <select
                    value={designationFilter}
                    onChange={(e) => setDesignationFilter(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm cursor-pointer bg-white min-w-[180px]"
                  >
                    <option value="all">All Designations</option>
                    <option value="Municipal Commissioner">Municipal Commissioner</option>
                  </select>
                </div>
                <div className="text-sm text-gray-500">
                  Showing <span className="font-semibold text-gray-900">{personnelList.length}</span> of <span className="font-semibold text-gray-900">{totalRecords}</span> records
                  {totalPages > 1 && (
                    <span className="ml-2">(Page {currentPage} of {totalPages})</span>
                  )}
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
                  <p className="text-gray-600 text-sm">Loading employees...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3">
                  <i className="ri-error-warning-line text-red-600 text-xl"></i>
                  <div>
                    <h3 className="text-red-800 font-semibold mb-1">Error Loading Data</h3>
                    <p className="text-red-600 text-sm">{error}</p>
                    <button
                      onClick={() => {
                        setError(null);
                        setCurrentPage(1);
                      }}
                      className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Backend Pagination Controls */}
            {!loading && !error && totalPages > 1 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Rows per page:</span>
                    <select
                      value={limit}
                      onChange={(e) => {
                        const newLimit = Number(e.target.value);
                        setLimit(newLimit);
                        setCurrentPage(1); // Reset to first page when limit changes
                        console.log('[Home] Limit changed to:', newLimit);
                      }}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm cursor-pointer bg-white"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        console.log('[Home] Pagination: First page');
                        setCurrentPage(1);
                      }}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      <i className="ri-skip-back-line w-4 h-4 flex items-center justify-center"></i>
                    </button>
                    <button
                      onClick={() => {
                        console.log('[Home] Pagination: Previous page');
                        setCurrentPage(prev => Math.max(1, prev - 1));
                      }}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      <i className="ri-arrow-left-s-line w-4 h-4 flex items-center justify-center"></i>
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => {
                              console.log('[Home] Pagination: Page', pageNum);
                              setCurrentPage(pageNum);
                            }}
                            className={`px-3 py-1.5 text-sm rounded cursor-pointer transition-colors ${
                              currentPage === pageNum
                                ? 'bg-teal-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => {
                        console.log('[Home] Pagination: Next page');
                        setCurrentPage(prev => Math.min(totalPages, prev + 1));
                      }}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      <i className="ri-arrow-right-s-line w-4 h-4 flex items-center justify-center"></i>
                    </button>
                    <button
                      onClick={() => {
                        console.log('[Home] Pagination: Last page');
                        setCurrentPage(totalPages);
                      }}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      <i className="ri-skip-forward-line w-4 h-4 flex items-center justify-center"></i>
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Data Table */}
            {!loading && !error && (
              <DataTable 
                data={filteredData} 
                backendPage={currentPage}
                backendLimit={limit}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddEmployee}
        existingData={personnelList}
      />

      {/* Remove Employee Modal */}
      <RemoveEmployeeModal
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        onRemove={handleRemoveEmployee}
        existingData={personnelList}
      />
    </div>
  );
}
