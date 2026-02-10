import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { safeCreateDate } from '../../../utils/dateUtils';
import { exportToPDF } from '../../../utils/exportUtils';
import EmployeeDetailModal from './EmployeeDetailModal';

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

interface DataTableProps {
  data: PersonnelData[];
  backendPage?: number; // Backend pagination page (1-based)
  backendLimit?: number; // Backend pagination limit
}

type SortField = 'sno' | 'cfmsId' | 'employeeId' | 'name' | 'mobile' | 'department' | 'designation' | 'birthday' | 'age' | 'retirementDate' | 'timeToRetirement' | 'responsibilities';
type SortDirection = 'asc' | 'desc';

type ColumnKey = 'sno' | 'cfmsId' | 'employeeId' | 'name' | 'mobile' | 'department' | 'designation' | 'birthday' | 'age' | 'retirementDate' | 'timeToRetirement' | 'responsibilities';

interface ColumnConfig {
  key: ColumnKey;
  label: string;
  visible: boolean;
}

export default function DataTable({ data, backendPage = 1, backendLimit = 25 }: DataTableProps) {
  const [sortField, setSortField] = useState<SortField>('sno');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showColumnChooser, setShowColumnChooser] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Column visibility state - all visible by default
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { key: 'sno', label: 'S.No', visible: true },
    { key: 'cfmsId', label: 'CFMS ID', visible: true },
    { key: 'employeeId', label: 'Employee ID', visible: true },
    { key: 'name', label: 'Employee Name', visible: true },
    { key: 'mobile', label: 'Mobile No', visible: true },
    { key: 'department', label: 'Position', visible: true },
    { key: 'designation', label: 'Role', visible: true },
    { key: 'birthday', label: 'DOB', visible: true },
    { key: 'age', label: 'Age', visible: true },
    { key: 'retirementDate', label: 'DOR', visible: true },
    { key: 'timeToRetirement', label: 'Time to Retire', visible: true },
    { key: 'responsibilities', label: 'Status', visible: true },
  ]);
  
  // Calculate the starting serial number based on backend pagination
  const backendOffset = (backendPage - 1) * backendLimit;
  
  const toggleColumnVisibility = (key: ColumnKey) => {
    setColumns(prev => prev.map(col => 
      col.key === key ? { ...col, visible: !col.visible } : col
    ));
  };
  
  const visibleColumns = columns.filter(col => col.visible);

  const handleEmployeeClick = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployeeId(null);
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

  const calculateTimeToRetirement = (retirementDate: string) => {
    const retirement = safeCreateDate(retirementDate);
    if (!retirement) {
      return { text: 'N/A', days: -1, sortValue: -1 };
    }
    
    const today = new Date();
    const diffTime = retirement.getTime() - today.getTime();
    
    if (diffTime <= 0) {
      return { text: 'Retired', days: -1, sortValue: -1 };
    }
    
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(totalDays / 365);
    const remainingDaysAfterYears = totalDays % 365;
    const months = Math.floor(remainingDaysAfterYears / 30);
    const days = remainingDaysAfterYears % 30;
    
    let text = '';
    if (years > 0) {
      text += `${years}y `;
    }
    if (months > 0) {
      text += `${months}m `;
    }
    if (days > 0 && years === 0) {
      text += `${days}d`;
    }
    
    return { text: text.trim() || '0d', days: totalDays, sortValue: totalDays };
  };

  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortField) {
        case 'sno':
          aVal = data.indexOf(a);
          bVal = data.indexOf(b);
          break;
        case 'cfmsId':
          aVal = a.cfmsId;
          bVal = b.cfmsId;
          break;
        case 'employeeId':
          aVal = a.employeeId;
          bVal = b.employeeId;
          break;
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'mobile':
          aVal = a.mobile;
          bVal = b.mobile;
          break;
        case 'department':
          aVal = a.department.toLowerCase();
          bVal = b.department.toLowerCase();
          break;
        case 'designation':
          aVal = a.designation.toLowerCase();
          bVal = b.designation.toLowerCase();
          break;
        case 'birthday':
          aVal = safeCreateDate(a.birthday)?.getTime() || 0;
          bVal = safeCreateDate(b.birthday)?.getTime() || 0;
          break;
        case 'age':
          aVal = calculateAge(a.birthday);
          bVal = calculateAge(b.birthday);
          break;
        case 'retirementDate':
          aVal = safeCreateDate(a.retirementDate)?.getTime() || 0;
          bVal = safeCreateDate(b.retirementDate)?.getTime() || 0;
          break;
        case 'timeToRetirement':
          aVal = calculateTimeToRetirement(a.retirementDate).sortValue;
          bVal = calculateTimeToRetirement(b.retirementDate).sortValue;
          break;
        case 'responsibilities':
          aVal = a.responsibilities.toLowerCase();
          bVal = b.responsibilities.toLowerCase();
          break;
        default:
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [data, sortField, sortDirection]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (dateString: string) => {
    const date = safeCreateDate(dateString);
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDateString = () => {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  };

  const handleExportExcel = () => {
    const exportData = sortedData.map((person, index) => ({
      'S.No': index + 1,
      'CFMS ID': person.cfmsId,
      'Employee ID': person.employeeId,
      'Employee Name': person.name,
      'Mobile No': person.mobile,
      'Position': person.department,
      'Role': person.designation,
      'DOB': formatDate(person.birthday),
      'Age': `${calculateAge(person.birthday)} yrs`,
      'DOR': formatDate(person.retirementDate),
      'Time to Retirement': calculateTimeToRetirement(person.retirementDate).text,
      'Status': person.responsibilities
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet['!cols'] = [
      { wch: 6 },   // S.No
      { wch: 12 },  // CFMS ID
      { wch: 12 },  // Employee ID
      { wch: 35 },  // Employee Name
      { wch: 14 },  // Mobile No
      { wch: 25 },  // Position
      { wch: 22 },  // Role
      { wch: 14 },  // DOB
      { wch: 10 },  // Age
      { wch: 14 },  // DOR
      { wch: 18 },  // Time to Retirement
      { wch: 10 },  // Status
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Personnel Directory');
    XLSX.writeFile(workbook, `CDMA_Personnel_Directory_${getDateString()}.xlsx`);
    setShowExportMenu(false);
  };

  const handleExportPDF = () => {
    try {
      exportToPDF(sortedData, 'CDMA_Personnel_Directory');
      setShowExportMenu(false);
    } catch (error) {
      console.error('Failed to export PDF:', error);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="ml-1 inline-flex flex-col">
      <i className={`ri-arrow-up-s-fill text-xs leading-none ${sortField === field && sortDirection === 'asc' ? 'text-teal-600' : 'text-gray-300'}`}></i>
      <i className={`ri-arrow-down-s-fill text-xs leading-none -mt-1 ${sortField === field && sortDirection === 'desc' ? 'text-teal-600' : 'text-gray-300'}`}></i>
    </span>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-50">
        <h2 className="text-base font-semibold text-gray-900">Personnel Directory</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Rows:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-gray-300 rounded text-sm cursor-pointer bg-white"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          
          {/* Column Chooser */}
          <div className="relative">
            <button
              onClick={() => setShowColumnChooser(!showColumnChooser)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium whitespace-nowrap cursor-pointer"
            >
              <i className="ri-eye-line w-4 h-4 flex items-center justify-center"></i>
              Columns
            </button>
            
            {showColumnChooser && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowColumnChooser(false)}
                ></div>
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-20 min-w-[200px]">
                  <div className="text-xs font-semibold text-gray-700 mb-2 pb-2 border-b border-gray-200">
                    Show/Hide Columns
                  </div>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {columns.map((column) => (
                      <label
                        key={column.key}
                        className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-1.5 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={column.visible}
                          onChange={() => toggleColumnVisibility(column.key)}
                          className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                        />
                        <span className="text-xs">{column.label}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setColumns(prev => prev.map(col => ({ ...col, visible: true })));
                    }}
                    className="mt-2 w-full text-xs text-teal-600 hover:text-teal-700 font-medium py-1"
                  >
                    Show All
                  </button>
                </div>
              </>
            )}
          </div>
          
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium whitespace-nowrap cursor-pointer"
            >
              <i className="ri-download-line w-4 h-4 flex items-center justify-center"></i>
              Export
              <i className="ri-arrow-down-s-line w-4 h-4 flex items-center justify-center"></i>
            </button>
            
            {showExportMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowExportMenu(false)}
                ></div>
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[180px]">
                  <button
                    onClick={handleExportExcel}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left first:rounded-t-lg"
                  >
                    <i className="ri-file-excel-2-line w-5 h-5 text-green-600"></i>
                    <div>
                      <div className="font-medium">Export to Excel</div>
                      <div className="text-xs text-gray-500">.xlsx format</div>
                    </div>
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left last:rounded-b-lg border-t border-gray-100"
                  >
                    <i className="ri-file-pdf-2-line w-5 h-5 text-red-600"></i>
                    <div>
                      <div className="font-medium">Export to PDF</div>
                      <div className="text-xs text-gray-500">.pdf format</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1400px]">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.find(col => col.key === 'sno')?.visible && (
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:brightness-95 transition-all bg-slate-100"
                  onClick={() => handleSort('sno')}
                >
                  <div className="flex items-center">
                    S.No
                    <SortIcon field="sno" />
                  </div>
                </th>
              )}
              {columns.find(col => col.key === 'cfmsId')?.visible && (
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:brightness-95 transition-all bg-indigo-50"
                  onClick={() => handleSort('cfmsId')}
                >
                  <div className="flex items-center">
                    CFMS ID
                    <SortIcon field="cfmsId" />
                  </div>
                </th>
              )}
              {columns.find(col => col.key === 'employeeId')?.visible && (
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:brightness-95 transition-all bg-violet-50"
                  onClick={() => handleSort('employeeId')}
                >
                  <div className="flex items-center">
                    Employee ID
                    <SortIcon field="employeeId" />
                  </div>
                </th>
              )}
              {columns.find(col => col.key === 'name')?.visible && (
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:brightness-95 transition-all bg-teal-50"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Employee Name
                    <SortIcon field="name" />
                  </div>
                </th>
              )}
              {columns.find(col => col.key === 'mobile')?.visible && (
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:brightness-95 transition-all bg-cyan-50"
                  onClick={() => handleSort('mobile')}
                >
                  <div className="flex items-center">
                    Mobile No
                    <SortIcon field="mobile" />
                  </div>
                </th>
              )}
              {columns.find(col => col.key === 'department')?.visible && (
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:brightness-95 transition-all bg-emerald-50"
                  onClick={() => handleSort('department')}
                >
                  <div className="flex items-center">
                    Position
                    <SortIcon field="department" />
                  </div>
                </th>
              )}
              {columns.find(col => col.key === 'designation')?.visible && (
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:brightness-95 transition-all bg-lime-50"
                  onClick={() => handleSort('designation')}
                >
                  <div className="flex items-center">
                    Role
                    <SortIcon field="designation" />
                  </div>
                </th>
              )}
              {columns.find(col => col.key === 'birthday')?.visible && (
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:brightness-95 transition-all bg-amber-50"
                  onClick={() => handleSort('birthday')}
                >
                  <div className="flex items-center">
                    DOB
                    <SortIcon field="birthday" />
                  </div>
                </th>
              )}
              {columns.find(col => col.key === 'age')?.visible && (
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:brightness-95 transition-all bg-orange-50"
                  onClick={() => handleSort('age')}
                >
                  <div className="flex items-center">
                    Age
                    <SortIcon field="age" />
                  </div>
                </th>
              )}
              {columns.find(col => col.key === 'retirementDate')?.visible && (
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:brightness-95 transition-all bg-rose-50"
                  onClick={() => handleSort('retirementDate')}
                >
                  <div className="flex items-center">
                    DOR
                    <SortIcon field="retirementDate" />
                  </div>
                </th>
              )}
              {columns.find(col => col.key === 'timeToRetirement')?.visible && (
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:brightness-95 transition-all bg-pink-50"
                  onClick={() => handleSort('timeToRetirement')}
                >
                  <div className="flex items-center whitespace-nowrap">
                    Time to Retire
                    <SortIcon field="timeToRetirement" />
                  </div>
                </th>
              )}
              {columns.find(col => col.key === 'responsibilities')?.visible && (
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:brightness-95 transition-all bg-sky-50"
                  onClick={() => handleSort('responsibilities')}
                >
                  <div className="flex items-center">
                    Status
                    <SortIcon field="responsibilities" />
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.map((person, index) => {
              // Calculate serial number: backend offset + client-side pagination offset + current index + 1
              const serialNumber = backendOffset + (currentPage - 1) * rowsPerPage + index + 1;
              const timeToRetire = calculateTimeToRetirement(person.retirementDate);
              const age = calculateAge(person.birthday);
              return (
                <tr 
                  key={person.id} 
                  className="hover:bg-gray-50 transition-colors"
                >
                  {columns.find(col => col.key === 'sno')?.visible && (
                    <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                      {serialNumber}
                    </td>
                  )}
                  {columns.find(col => col.key === 'cfmsId')?.visible && (
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                      {person.cfmsId}
                    </td>
                  )}
                  {columns.find(col => col.key === 'employeeId')?.visible && (
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                      {person.employeeId}
                    </td>
                  )}
                  {columns.find(col => col.key === 'name')?.visible && (
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleEmployeeClick(person.employeeId)}
                        className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline transition-colors cursor-pointer text-left"
                      >
                        {person.name}
                      </button>
                    </td>
                  )}
                  {columns.find(col => col.key === 'mobile')?.visible && (
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                      {person.mobile}
                    </td>
                  )}
                  {columns.find(col => col.key === 'department')?.visible && (
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {person.department}
                    </td>
                  )}
                  {columns.find(col => col.key === 'designation')?.visible && (
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {person.designation}
                    </td>
                  )}
                  {columns.find(col => col.key === 'birthday')?.visible && (
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(person.birthday)}
                    </td>
                  )}
                  {columns.find(col => col.key === 'age')?.visible && (
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {age} yrs
                    </td>
                  )}
                  {columns.find(col => col.key === 'retirementDate')?.visible && (
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(person.retirementDate)}
                    </td>
                  )}
                  {columns.find(col => col.key === 'timeToRetirement')?.visible && (
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                        timeToRetire.days <= 0 
                          ? 'bg-gray-100 text-gray-600' 
                          : timeToRetire.days <= 365 
                            ? 'bg-red-100 text-red-700' 
                            : timeToRetire.days <= 730 
                              ? 'bg-amber-100 text-amber-700' 
                              : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {timeToRetire.text}
                      </span>
                    </td>
                  )}
                  {columns.find(col => col.key === 'responsibilities')?.visible && (
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        person.responsibilities === 'Regular' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {person.responsibilities}
                      </span>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50">
        <div className="text-sm text-gray-600">
          Showing <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> to{' '}
          <span className="font-medium">{Math.min(currentPage * rowsPerPage, sortedData.length)}</span> of{' '}
          <span className="font-medium">{sortedData.length}</span> entries
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <i className="ri-skip-back-line w-4 h-4 flex items-center justify-center"></i>
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                  onClick={() => setCurrentPage(pageNum)}
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
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <i className="ri-arrow-right-s-line w-4 h-4 flex items-center justify-center"></i>
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <i className="ri-skip-forward-line w-4 h-4 flex items-center justify-center"></i>
          </button>
        </div>
      </div>

      {/* Employee Detail Modal */}
      {selectedEmployeeId && (
        <EmployeeDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          employeeId={selectedEmployeeId}
        />
      )}
    </div>
  );
}
