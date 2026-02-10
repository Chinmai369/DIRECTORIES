
import { useState } from 'react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

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

interface ExportButtonsProps {
  data: PersonnelData[];
  filename?: string;
}

/**
 * ExportButtons – component that provides Excel / PDF export functionality.
 * Handles UI state, adds basic error handling and ensures the component
 * remains robust even if the export utilities throw.
 */
export default function ExportButtons({
  data,
  filename = 'CDMA_Directory',
}: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState<'excel' | 'pdf' | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  /** Helper to reset the exporting state after a short delay */
  const resetExportState = () => {
    // Give the UI a little time to show the spinner before resetting
    setTimeout(() => setIsExporting(null), 500);
  };

  const handleExcelExport = async () => {
    setIsExporting('excel');
    setShowDropdown(false);
    try {
      // Small async pause to allow UI update before heavy processing
      await new Promise((resolve) => setTimeout(resolve, 100));
      await exportToExcel(data, filename);
    } catch (error) {
      console.error('Excel export failed:', error);
      // Optional: you could show a toast/notification here
    } finally {
      resetExportState();
    }
  };

  const handlePDFExport = async () => {
    setIsExporting('pdf');
    setShowDropdown(false);
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      await exportToPDF(data, filename);
    } catch (error) {
      console.error('PDF export failed:', error);
      // Optional: display an error notification
    } finally {
      resetExportState();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium whitespace-nowrap cursor-pointer"
      >
        <i className="ri-download-2-line w-4 h-4 flex items-center justify-center"></i>
        Export Data
        <i
          className={`ri-arrow-down-s-line w-4 h-4 flex items-center justify-center transition-transform ${
            showDropdown ? 'rotate-180' : ''
          }`}
        ></i>
      </button>

      {showDropdown && (
        <>
          {/* Overlay to close dropdown when clicking outside */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          ></div>

          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
            <button
              onClick={handleExcelExport}
              disabled={isExporting !== null}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isExporting === 'excel' ? (
                <i className="ri-loader-4-line w-5 h-5 flex items-center justify-center animate-spin text-green-600"></i>
              ) : (
                <i className="ri-file-excel-2-line w-5 h-5 flex items-center justify-center text-green-600"></i>
              )}
              <div>
                <div className="font-medium">Export to Excel</div>
                <div className="text-xs text-gray-500">.xlsx format</div>
              </div>
            </button>

            <div className="border-t border-gray-100"></div>

            <button
              onClick={handlePDFExport}
              disabled={isExporting !== null}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isExporting === 'pdf' ? (
                <i className="ri-loader-4-line w-5 h-5 flex items-center justify-center animate-spin text-red-600"></i>
              ) : (
                <i className="ri-file-pdf-2-line w-5 h-5 flex items-center justify-center text-red-600"></i>
              )}
              <div>
                <div className="font-medium">Export to PDF</div>
                <div className="text-xs text-gray-500">.pdf format</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
