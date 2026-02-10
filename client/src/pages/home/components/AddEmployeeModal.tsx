
import { useState } from 'react';
import { safeFormatDate } from '../../../utils/dateUtils';

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

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (employee: PersonnelData) => void;
  existingData: PersonnelData[];
}

// Mock CFMS database - simulating external database lookup
const cfmsDatabase: Record<string, Partial<PersonnelData>> = {
  '15200001': {
    name: 'KRISHNA MURTHY',
    designation: 'Municipal Commissioner',
    department: 'ANAKAPALLE',
    employeeId: '7010001',
    email: 'krishna.murthy@cdma.gov.in',
    mobile: '9849900001',
    birthday: '1975-03-15',
    retirementDate: '2035-03-31',
    joiningDate: '2000-06-01',
    photo: 'https://readdy.ai/api/search-image?query=professional%20indian%20male%20government%20municipal%20commissioner%20formal%20attire%20confident%20expression%20office%20portrait%20administrative%20leader&width=400&height=400&seq=person-new-001&orientation=squarish'
  },
  '15200002': {
    name: 'LAKSHMI DEVI',
    designation: 'Municipal Commissioner',
    department: 'VIZIANAGARAM',
    employeeId: '7010002',
    email: 'lakshmi.devi@cdma.gov.in',
    mobile: '9849900002',
    birthday: '1978-07-22',
    retirementDate: '2038-07-31',
    joiningDate: '2003-04-15',
    photo: 'https://readdy.ai/api/search-image?query=professional%20indian%20female%20government%20municipal%20commissioner%20formal%20business%20attire%20confident%20smile%20office%20portrait%20administrative%20leader&width=400&height=400&seq=person-new-002&orientation=squarish'
  },
  '15200003': {
    name: 'SURESH BABU',
    designation: 'Municipal Commissioner',
    department: 'ANANTAPUR',
    employeeId: '7010003',
    email: 'suresh.babu@cdma.gov.in',
    mobile: '9849900003',
    birthday: '1976-11-08',
    retirementDate: '2036-11-30',
    joiningDate: '2001-08-20',
    photo: 'https://readdy.ai/api/search-image?query=professional%20indian%20male%20government%20municipal%20commissioner%20formal%20suit%20confident%20expression%20office%20portrait%20administrative%20executive&width=400&height=400&seq=person-new-003&orientation=squarish'
  },
  '15200004': {
    name: 'PADMAVATHI',
    designation: 'Municipal Commissioner',
    department: 'HINDUPUR',
    employeeId: '7010004',
    email: 'padmavathi@cdma.gov.in',
    mobile: '9849900004',
    birthday: '1980-02-14',
    retirementDate: '2040-02-29',
    joiningDate: '2005-01-10',
    photo: 'https://readdy.ai/api/search-image?query=professional%20indian%20female%20government%20municipal%20commissioner%20formal%20attire%20professional%20expression%20office%20portrait%20administrative%20officer&width=400&height=400&seq=person-new-004&orientation=squarish'
  },
  '15200005': {
    name: 'RANGA RAO',
    designation: 'Municipal Commissioner',
    department: 'ADONI',
    employeeId: '7010005',
    email: 'ranga.rao@cdma.gov.in',
    mobile: '9849900005',
    birthday: '1974-09-25',
    retirementDate: '2034-09-30',
    joiningDate: '1999-12-01',
    photo: 'https://readdy.ai/api/search-image?query=professional%20indian%20male%20government%20municipal%20commissioner%20formal%20business%20attire%20determined%20expression%20office%20portrait%20administrative%20manager&width=400&height=400&seq=person-new-005&orientation=squarish'
  }
};

export default function AddEmployeeModal({ isOpen, onClose, onAdd, existingData }: AddEmployeeModalProps) {
  const [cfmsId, setCfmsId] = useState('');
  const [searchResult, setSearchResult] = useState<Partial<PersonnelData> | null>(null);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'found' | 'not-found' | 'exists'>('idle');
  const [responsibilities, setResponsibilities] = useState('Regular');

  const handleSearch = () => {
    if (!cfmsId.trim()) return;
    
    setSearchStatus('searching');
    
    // Simulate API call delay
    setTimeout(() => {
      // Check if already exists in current data
      const existingEmployee = existingData.find(emp => emp.cfmsId === cfmsId.trim());
      if (existingEmployee) {
        setSearchStatus('exists');
        setSearchResult(existingEmployee);
        return;
      }

      // Search in CFMS database
      const result = cfmsDatabase[cfmsId.trim()];
      if (result) {
        setSearchResult(result);
        setSearchStatus('found');
      } else {
        setSearchResult(null);
        setSearchStatus('not-found');
      }
    }, 500);
  };

  const handleAdd = () => {
    if (!searchResult || searchStatus !== 'found') return;

    const newEmployee: PersonnelData = {
      id: Date.now(),
      name: searchResult.name || '',
      designation: searchResult.designation || 'Municipal Commissioner',
      department: searchResult.department || '',
      cfmsId: cfmsId.trim(),
      employeeId: searchResult.employeeId || '',
      email: searchResult.email || '',
      phone: searchResult.mobile || '',
      mobile: searchResult.mobile || '',
      office: `${searchResult.department} Municipal Office`,
      birthday: searchResult.birthday || '',
      retirementDate: searchResult.retirementDate || '',
      joiningDate: searchResult.joiningDate || '',
      currentPosition: `Municipal Commissioner - ${searchResult.department}`,
      previousPosition: 'Assistant Commissioner',
      charges: 'None',
      responsibilities: responsibilities,
      photo: searchResult.photo || ''
    };

    onAdd(newEmployee);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setCfmsId('');
    setSearchResult(null);
    setSearchStatus('idle');
    setResponsibilities('Regular');
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
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                <i className="ri-user-add-line text-white text-lg"></i>
              </div>
              <div>
                <h2 className="text-white font-semibold text-base">Add New Commissioner</h2>
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
                  placeholder="Enter CFMS ID (e.g., 15200001)"
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
            <p className="text-xs text-gray-400 mt-1.5">
              <i className="ri-information-line mr-1"></i>
              Try: 15200001, 15200002, 15200003, 15200004, 15200005
            </p>
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
                <img 
                  src={searchResult.photo} 
                  alt={searchResult.name}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border-2 border-white shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <i className="ri-checkbox-circle-fill text-emerald-600"></i>
                    <span className="text-xs font-medium text-emerald-700">Record Found</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{searchResult.name}</h3>
                  <p className="text-xs text-gray-600">{searchResult.designation}</p>
                  <p className="text-xs text-gray-500">{searchResult.department}</p>
                </div>
              </div>
              
              {/* Employee Details */}
              <div className="mt-3 pt-3 border-t border-emerald-200 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Employee ID:</span>
                  <span className="ml-1 font-medium text-gray-700">{searchResult.employeeId}</span>
                </div>
                <div>
                  <span className="text-gray-500">Mobile:</span>
                  <span className="ml-1 font-medium text-gray-700">{searchResult.mobile}</span>
                </div>
                <div>
                  <span className="text-gray-500">DOB:</span>
                  <span className="ml-1 font-medium text-gray-700">
                    {safeFormatDate(searchResult.birthday, 'N/A')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">DOR:</span>
                  <span className="ml-1 font-medium text-gray-700">
                    {safeFormatDate(searchResult.retirementDate, 'N/A')}
                  </span>
                </div>
              </div>

              {/* Status Selection */}
              <div className="mt-3 pt-3 border-t border-emerald-200">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Assign Status</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setResponsibilities('Regular')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      responsibilities === 'Regular'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white border border-gray-300 text-gray-700 hover:border-emerald-400'
                    }`}
                  >
                    <i className="ri-user-follow-line mr-1"></i>
                    Regular
                  </button>
                  <button
                    onClick={() => setResponsibilities('Incharge')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      responsibilities === 'Incharge'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-white border border-gray-300 text-gray-700 hover:border-amber-400'
                    }`}
                  >
                    <i className="ri-user-shared-line mr-1"></i>
                    Incharge
                  </button>
                </div>
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
            disabled={searchStatus !== 'found'}
            className="px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium cursor-pointer flex items-center gap-2 whitespace-nowrap"
          >
            <i className="ri-user-add-line"></i>
            Add Commissioner
          </button>
        </div>
      </div>
    </div>
  );
}
