import { useState } from 'react';
import { employeeService } from '../../../services/api';
import { safeFormatDate } from '../../../utils/dateUtils';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void; // Refresh callback
}

export default function AddEmployeeModal({ isOpen, onClose, onAdd }: AddEmployeeModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'results' | 'not-found' | 'exists'>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search in master table by CFMS ID or name
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearchStatus('searching');
    setError(null);
    setSelectedEmployee(null);
    setSearchResults([]);

    try {
      // 1. Check if already in directory
      const existingInDirectory = await employeeService.getEmployees({ search: searchQuery.trim() });
      if (existingInDirectory.rows.length > 0) {
        const matchExact = existingInDirectory.rows.find(
          (emp: any) => emp.cfms_id === searchQuery.trim() || emp.employeeid === searchQuery.trim()
        );
        if (matchExact) {
          setSearchStatus('exists');
          setSelectedEmployee(matchExact);
          return;
        }
      }

      // 2. Search in master table (ext_cfms_stg_t)
      const result = await employeeService.searchAllEmployees({ search: searchQuery.trim() });

      if (result.rows && result.rows.length > 0) {
        setSearchResults(result.rows);
        setSearchStatus('results');
      } else {
        setSearchStatus('not-found');
      }
    } catch (err: any) {
      setError('Error searching master data. Please try again.');
      setSearchStatus('idle');
    }
  };

  const handleSelectEmployee = (emp: any) => {
    setSelectedEmployee(emp);
    setSearchStatus('results'); // keep results visible but highlight selection
  };

  const handleAdd = async () => {
    if (!selectedEmployee) return;

    setLoading(true);
    setError(null);

    try {
      const employeeData = {
        employeeid:      selectedEmployee.employeeid || '',
        cfms_id:         selectedEmployee.cfms_id    || searchQuery,
        name:            selectedEmployee.name        || '',
        surname:         selectedEmployee.surname     || '',
        designation:     selectedEmployee.designation || '',
        department_name: selectedEmployee.department_name || '',
        distname:        selectedEmployee.distname    || '',
        mobileno:        selectedEmployee.mobileno    || '',
        email1:          selectedEmployee.email1      || '',
        dob:             selectedEmployee.dob         || null,
        dor:             selectedEmployee.dor         || null,
        gender_desc:     selectedEmployee.gender_desc || '',
        employee_status: selectedEmployee.employee_status || 'ACTIVE'
      };

      const result = await employeeService.addEmployee(employeeData);

      if (result.success) {
        onAdd();
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
    setSearchQuery('');
    setSearchResults([]);
    setSelectedEmployee(null);
    setSearchStatus('idle');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose}></div>

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                <i className="ri-user-add-line text-white text-lg"></i>
              </div>
              <div>
                <h2 className="text-white font-semibold text-base">Add Employee</h2>
                <p className="text-teal-100 text-xs">Search by CFMS ID or Name in Master Data</p>
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
        <div className="p-5 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
              <i className="ri-error-warning-line text-red-600 text-lg flex-shrink-0"></i>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Search Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              CFMS ID or Employee Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchStatus('idle');
                  setSearchResults([]);
                  setSelectedEmployee(null);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter CFMS ID or employee name..."
                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || searchStatus === 'searching'}
                className="px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium whitespace-nowrap cursor-pointer flex items-center gap-2"
              >
                {searchStatus === 'searching' ? (
                  <><i className="ri-loader-4-line animate-spin"></i> Searching</>
                ) : (
                  <><i className="ri-search-line"></i> Search</>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Searches in master data (CFMS database)</p>
          </div>

          {/* Not Found */}
          {searchStatus === 'not-found' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-user-unfollow-line text-red-600 text-lg"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-800">No Record Found</p>
                  <p className="text-xs text-red-600">"{searchQuery}" not found in master data</p>
                </div>
              </div>
            </div>
          )}

          {/* Already in Directory */}
          {searchStatus === 'exists' && selectedEmployee && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-error-warning-line text-amber-600 text-lg"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-800">Already in Directory</p>
                  <p className="text-xs text-amber-600">
                    {selectedEmployee.name} {selectedEmployee.surname} is already in the commissioner directory
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Search Results List */}
          {searchStatus === 'results' && searchResults.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2 font-medium">
                {searchResults.length} result{searchResults.length > 1 ? 's' : ''} found — select one to add:
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {searchResults.map((emp, idx) => {
                  const isSelected = selectedEmployee?.cfms_id === emp.cfms_id && selectedEmployee?.employeeid === emp.employeeid;
                  return (
                    <button
                      key={emp.cfms_id || emp.employeeid || idx}
                      onClick={() => handleSelectEmployee(emp)}
                      className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${isSelected ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                          {(emp.name || 'E')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {emp.name} {emp.surname}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{emp.designation} — {emp.department_name || emp.distname}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-gray-400">CFMS: {emp.cfms_id || '—'}</p>
                          {isSelected && <i className="ri-checkbox-circle-fill text-teal-600 text-base"></i>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Employee Preview */}
          {selectedEmployee && searchStatus === 'results' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-checkbox-circle-fill text-emerald-600"></i>
                <span className="text-xs font-semibold text-emerald-700">Selected — will be added to directory</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-800">{selectedEmployee.name} {selectedEmployee.surname}</span></div>
                <div><span className="text-gray-500">CFMS ID:</span> <span className="font-medium text-gray-800">{selectedEmployee.cfms_id || '—'}</span></div>
                <div><span className="text-gray-500">Employee ID:</span> <span className="font-medium text-gray-800">{selectedEmployee.employeeid || '—'}</span></div>
                <div><span className="text-gray-500">Gender:</span> <span className="font-medium text-gray-800">{selectedEmployee.gender_desc || '—'}</span></div>
                <div><span className="text-gray-500">Designation:</span> <span className="font-medium text-gray-800">{selectedEmployee.designation || '—'}</span></div>
                <div><span className="text-gray-500">Department:</span> <span className="font-medium text-gray-800">{selectedEmployee.department_name || '—'}</span></div>
                <div><span className="text-gray-500">District:</span> <span className="font-medium text-gray-800">{selectedEmployee.distname || '—'}</span></div>
                <div><span className="text-gray-500">Status:</span> <span className="font-medium text-gray-800">{selectedEmployee.employee_status || '—'}</span></div>
                <div><span className="text-gray-500">DOB:</span> <span className="font-medium text-gray-800">{safeFormatDate(selectedEmployee.dob, '—')}</span></div>
                <div><span className="text-gray-500">DOR:</span> <span className="font-medium text-gray-800">{safeFormatDate(selectedEmployee.dor, '—')}</span></div>
                <div><span className="text-gray-500">Mobile:</span> <span className="font-medium text-gray-800">{selectedEmployee.mobileno || '—'}</span></div>
                <div><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-800 truncate block">{selectedEmployee.email1 || '—'}</span></div>
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
            disabled={!selectedEmployee || searchStatus !== 'results' || loading}
            className="px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium cursor-pointer flex items-center gap-2 whitespace-nowrap"
          >
            {loading ? (
              <><i className="ri-loader-4-line animate-spin"></i> Adding...</>
            ) : (
              <><i className="ri-user-add-line"></i> Add to Directory</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
