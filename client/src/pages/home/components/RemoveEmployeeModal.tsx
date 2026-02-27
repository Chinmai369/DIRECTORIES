import { useState } from 'react';
import { employeeService } from '../../../services/api';

interface RemoveEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRemove: () => void; // Refresh callback
}

export default function RemoveEmployeeModal({ isOpen, onClose, onRemove }: RemoveEmployeeModalProps) {
  const [cfmsId, setCfmsId] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'found' | 'not-found'>('idle');
  const [confirmText, setConfirmText] = useState('');
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!cfmsId.trim()) return;

    setSearchStatus('searching');
    setConfirmText('');
    setError(null);

    try {
      // Search in directory by CFMS ID or name
      const result = await employeeService.getEmployees({ search: cfmsId.trim() });

      if (result.rows && result.rows.length > 0) {
        // Try to find exact CFMS ID match first
        const exact = result.rows.find((emp: any) => emp.cfms_id === cfmsId.trim());
        const employee = exact || result.rows[0];
        setSearchResult(employee);
        setSearchStatus('found');
      } else {
        setSearchResult(null);
        setSearchStatus('not-found');
      }
    } catch (err: any) {
      setError('Error searching directory');
      setSearchStatus('idle');
    }
  };

  const handleRemove = async () => {
    if (!searchResult || confirmText !== 'REMOVE') return;

    setRemoving(true);
    setError(null);

    try {
      const result = await employeeService.removeEmployee(searchResult.cfms_id);
      if (result.success) {
        onRemove(); // Refresh the list
        handleReset();
        onClose();
      } else {
        setError(result.message || 'Failed to remove employee');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to remove employee');
    } finally {
      setRemoving(false);
    }
  };

  const handleReset = () => {
    setCfmsId('');
    setSearchResult(null);
    setSearchStatus('idle');
    setConfirmText('');
    setError(null);
  };

  const handleClose = () => {
    handleReset();
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
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                <i className="ri-user-unfollow-line text-white text-lg"></i>
              </div>
              <div>
                <h2 className="text-white font-semibold text-base">Remove from Directory</h2>
                <p className="text-red-100 text-xs">Search by CFMS ID or Name</p>
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
              <i className="ri-error-warning-line text-red-600 text-lg flex-shrink-0"></i>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Search Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">CFMS ID or Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={cfmsId}
                onChange={(e) => {
                  setCfmsId(e.target.value);
                  setSearchStatus('idle');
                  setSearchResult(null);
                  setConfirmText('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter CFMS ID or employee name"
                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSearch}
                disabled={!cfmsId.trim() || searchStatus === 'searching'}
                className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium whitespace-nowrap cursor-pointer flex items-center gap-2"
              >
                {searchStatus === 'searching' ? (
                  <><i className="ri-loader-4-line animate-spin"></i> Searching</>
                ) : (
                  <><i className="ri-search-line"></i> Search</>
                )}
              </button>
            </div>
          </div>

          {/* Not Found */}
          {searchStatus === 'not-found' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-user-search-line text-amber-600 text-lg"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-800">Not Found in Directory</p>
                  <p className="text-xs text-amber-600">"{cfmsId}" is not in the commissioner directory</p>
                </div>
              </div>
            </div>
          )}

          {/* Found */}
          {searchStatus === 'found' && searchResult && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bold text-red-700">
                  {(searchResult.name || 'E')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <i className="ri-error-warning-fill text-red-600"></i>
                    <span className="text-xs font-medium text-red-700">Employee Found in Directory</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {searchResult.name} {searchResult.surname}
                  </h3>
                  <p className="text-xs text-gray-600">{searchResult.designation}</p>
                  <p className="text-xs text-gray-500">{searchResult.department_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mb-4 pt-2 border-t border-red-200">
                <div><span className="text-gray-500">CFMS ID:</span> <span className="font-medium text-gray-700">{searchResult.cfms_id}</span></div>
                <div><span className="text-gray-500">Employee ID:</span> <span className="font-medium text-gray-700">{searchResult.employeeid || '—'}</span></div>
                <div><span className="text-gray-500">Mobile:</span> <span className="font-medium text-gray-700">{searchResult.mobileno || '—'}</span></div>
                <div><span className="text-gray-500">District:</span> <span className="font-medium text-gray-700">{searchResult.distname || '—'}</span></div>
              </div>

              {/* Confirm */}
              <div className="bg-red-100 rounded-lg p-3 mb-3">
                <div className="flex items-start gap-2">
                  <i className="ri-alert-line text-red-600 text-lg mt-0.5"></i>
                  <div>
                    <p className="text-xs font-medium text-red-800">This will remove the employee from the directory</p>
                    <p className="text-xs text-red-600 mt-0.5">Type <span className="font-bold">REMOVE</span> to confirm</p>
                  </div>
                </div>
              </div>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder="Type REMOVE to confirm"
                className="w-full px-3 py-2.5 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm text-center font-medium tracking-wider"
              />
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
            onClick={handleRemove}
            disabled={searchStatus !== 'found' || confirmText !== 'REMOVE' || removing}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium cursor-pointer flex items-center gap-2 whitespace-nowrap"
          >
            {removing ? (
              <><i className="ri-loader-4-line animate-spin"></i> Removing...</>
            ) : (
              <><i className="ri-delete-bin-line"></i> Remove from Directory</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
