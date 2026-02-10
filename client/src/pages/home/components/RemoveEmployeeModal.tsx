
import { useState } from 'react';

interface PersonnelData {
  id: number;
  name: string;
  designation: string;
  department: string;
  cfmsId: string;
  employeeId: string;
  email: string;
  phone: string;
  mobile: string;
  office: string;
  birthday: string;
  retirementDate: string;
  joiningDate: string;
  currentPosition: string;
  previousPosition: string;
  charges: string;
  responsibilities: string;
  photo: string;
}

interface RemoveEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRemove: (cfmsId: string) => void;
  existingData: PersonnelData[];
}

export default function RemoveEmployeeModal({ isOpen, onClose, onRemove, existingData }: RemoveEmployeeModalProps) {
  const [cfmsId, setCfmsId] = useState('');
  const [searchResult, setSearchResult] = useState<PersonnelData | null>(null);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'found' | 'not-found'>('idle');
  const [confirmText, setConfirmText] = useState('');

  const handleSearch = () => {
    if (!cfmsId.trim()) return;
    
    setSearchStatus('searching');
    setConfirmText('');
    
    // Simulate search delay
    setTimeout(() => {
      const employee = existingData.find(emp => emp.cfmsId === cfmsId.trim());
      if (employee) {
        setSearchResult(employee);
        setSearchStatus('found');
      } else {
        setSearchResult(null);
        setSearchStatus('not-found');
      }
    }, 300);
  };

  const handleRemove = () => {
    if (!searchResult || confirmText !== 'REMOVE') return;
    onRemove(searchResult.cfmsId);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setCfmsId('');
    setSearchResult(null);
    setSearchStatus('idle');
    setConfirmText('');
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
                <h2 className="text-white font-semibold text-base">Remove Commissioner</h2>
                <p className="text-red-100 text-xs">Search by CFMS ID</p>
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
                    setConfirmText('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter CFMS ID to search"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={!cfmsId.trim() || searchStatus === 'searching'}
                className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium whitespace-nowrap cursor-pointer flex items-center gap-2"
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
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-user-search-line text-amber-600 text-lg"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-800">Not Found in Directory</p>
                  <p className="text-xs text-amber-600">CFMS ID "{cfmsId}" is not in the current directory</p>
                </div>
              </div>
            </div>
          )}

          {searchStatus === 'found' && searchResult && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <img 
                  src={searchResult.photo} 
                  alt={searchResult.name}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border-2 border-white shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <i className="ri-error-warning-fill text-red-600"></i>
                    <span className="text-xs font-medium text-red-700">Employee Found</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{searchResult.name}</h3>
                  <p className="text-xs text-gray-600">{searchResult.designation}</p>
                  <p className="text-xs text-gray-500">{searchResult.department}</p>
                </div>
              </div>
              
              {/* Employee Details */}
              <div className="mt-3 pt-3 border-t border-red-200 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">CFMS ID:</span>
                  <span className="ml-1 font-medium text-gray-700">{searchResult.cfmsId}</span>
                </div>
                <div>
                  <span className="text-gray-500">Employee ID:</span>
                  <span className="ml-1 font-medium text-gray-700">{searchResult.employeeId}</span>
                </div>
                <div>
                  <span className="text-gray-500">Mobile:</span>
                  <span className="ml-1 font-medium text-gray-700">{searchResult.mobile}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className={`ml-1 font-medium ${searchResult.responsibilities === 'Regular' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {searchResult.responsibilities}
                  </span>
                </div>
              </div>

              {/* Confirmation Input */}
              <div className="mt-4 pt-3 border-t border-red-200">
                <div className="bg-red-100 rounded-lg p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <i className="ri-alert-line text-red-600 text-lg mt-0.5"></i>
                    <div>
                      <p className="text-xs font-medium text-red-800">Warning: This action cannot be undone</p>
                      <p className="text-xs text-red-600 mt-0.5">Type <span className="font-bold">REMOVE</span> to confirm deletion</p>
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
            disabled={searchStatus !== 'found' || confirmText !== 'REMOVE'}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium cursor-pointer flex items-center gap-2 whitespace-nowrap"
          >
            <i className="ri-delete-bin-line"></i>
            Remove Commissioner
          </button>
        </div>
      </div>
    </div>
  );
}
