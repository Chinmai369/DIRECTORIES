import { useState } from 'react';
import { employeeService } from '../../../services/api';
import { safeFormatDate } from '../../../utils/dateUtils';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void; // Refresh callback
}

export default function AddEmployeeModal({ isOpen, onClose, onAdd }: AddEmployeeModalProps) {
  const [cfmsId, setCfmsId] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'found' | 'not-found' | 'exists'>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!cfmsId.trim()) return;
    
    setSearchStatus('searching');
    setError(null);
    
    try {
      // First check if CFMS ID already exists in current system
      const existingEmployees = await employeeService.getEmployees({ search: cfmsId.trim() });
      
      if (existingEmployees.rows.length > 0) {
        setSearchStatus('exists');
        setSearchResult(existingEmployees.rows[0]);
        return;
      }

      // Search in entire database for CFMS ID (all employees, no position filter)
      const result = await employeeService.searchAllEmployees({ 
        search: cfmsId.trim()
      });
      
      if (result.rows.length > 0) {
        const employee = result.rows.find(emp => 
          emp.cfms_id === cfmsId.trim() || 
          emp.employeeid === cfmsId.trim()
        );
        
        if (employee) {
          setSearchResult(employee);
          setSearchStatus('found');
        } else {
          setSearchStatus('not-found');
          setSearchResult(null);
        }
      } else {
        setSearchStatus('not-found');
        setSearchResult(null);
      }
    } catch (err: any) {
      setError('Error searching for CFMS ID');
      setSearchStatus('idle');
      setSearchResult(null);
    }
  };

  const handleAdd = async () => {
    if (!searchResult || searchStatus !== 'found') return;

    setLoading(true);
    setError(null);

    try {
      // Add the found employee to the system
      const employeeData = {
        ...searchResult,
        // Ensure required fields are present
        employeeid: searchResult.employeeid || `EMP${Date.now()}`,
        cfms_id: searchResult.cfms_id || cfmsId,
        name: searchResult.name || '',
        designation: searchResult.designation || '',
        department_name: searchResult.department_name || '',
        mobileno: searchResult.mobileno || '',
        email1: searchResult.email1 || '',
      };

      const result = await employeeService.addEmployee(employeeData);
      
      if (result.success) {
        onAdd(); // Refresh the employee list
        handleClose();
      } else {
        setError(result.message || 'Failed to add employee');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCfmsId('');
    setSearchResult(null);
    setSearchStatus('idle');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                <i className="ri-user-add-line text-white text-lg"></i>
              </div>
              <div>
                <h2 className="text-white font-semibold text-base">Add Employee</h2>
                <p className="text-teal-100 text-xs">Search by CFMS ID</p>
              </div>
            </div>
            <button 
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <i className="ri-error-warning-line text-red-600 text-lg"></i>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Search Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">CFMS ID</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={cfmsId}
                  onChange={(e) => {
                    setCfmsId(e.target.value);
                    setSearchStatus('idle');
                    setSearchResult(null);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter CFMS ID"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={!cfmsId.trim() || searchStatus === 'searching'}
                className="px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium whitespace-nowrap cursor-pointer flex items-center gap-2"
              >
                {searchStatus === 'searching' ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>
                    Searching
                  </>
                ) : (
                  <>
                    <i className="ri-search-line"></i>
                    Search
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Search Results */}
          {searchStatus === 'not-found' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-user-unfollow-line text-red-600 text-lg"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-800">No Record Found</p>
                  <p className="text-xs text-red-600">CFMS ID "{cfmsId}" not found in database</p>
                </div>
              </div>
            </div>
          )}

          {searchStatus === 'exists' && searchResult && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-error-warning-line text-amber-600 text-lg"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-800">Already Exists</p>
                  <p className="text-xs text-amber-600">{searchResult.name} is already in the directory</p>
                </div>
              </div>
            </div>
          )}

          {searchStatus === 'found' && searchResult && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                {searchResult.photo && (
                  <img 
                    src={searchResult.photo} 
                    alt={searchResult.name}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border-2 border-white shadow-sm"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <i className="ri-checkbox-circle-fill text-emerald-600"></i>
                    <span className="text-xs font-medium text-emerald-700">Record Found</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{searchResult.name}</h3>
                  <p className="text-xs text-gray-600">{searchResult.designation}</p>
                  <p className="text-xs text-gray-500">{searchResult.department_name}</p>
                </div>
              </div>
              
              {/* Employee Details */}
              <div className="mt-3 pt-3 border-t border-emerald-200 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Employee ID:</span>
                  <span className="ml-1 font-medium text-gray-700">{searchResult.employeeid}</span>
                </div>
                <div>
                  <span className="text-gray-500">CFMS ID:</span>
                  <span className="ml-1 font-medium text-gray-700">{searchResult.cfms_id}</span>
                </div>
                <div>
                  <span className="text-gray-500">Mobile:</span>
                  <span className="ml-1 font-medium text-gray-700">{searchResult.mobileno}</span>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <span className="ml-1 font-medium text-gray-700">{searchResult.email1}</span>
                </div>
                {searchResult.dob && (
                  <div>
                    <span className="text-gray-500">DOB:</span>
                    <span className="ml-1 font-medium text-gray-700">
                      {safeFormatDate(searchResult.dob, 'N/A')}
                    </span>
                  </div>
                )}
                {searchResult.dor && (
                  <div>
                    <span className="text-gray-500">DOR:</span>
                    <span className="ml-1 font-medium text-gray-700">
                      {safeFormatDate(searchResult.dor, 'N/A')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={searchStatus !== 'found' || loading}
            className="px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium cursor-pointer flex items-center gap-2 whitespace-nowrap"
          >
            {loading ? (
              <>
                <i className="ri-loader-4-line animate-spin"></i>
                Adding...
              </>
            ) : (
              <>
                <i className="ri-user-add-line"></i>
                Add Employee
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
