import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
}

/**
 * Export personnel data to an Excel file.
 * @param data - Array of personnel objects.
 * @param filename - Base name for the generated file (default: 'CDMA_Directory').
 */
export const exportToExcel = (data: PersonnelData[], filename: string = 'CDMA_Directory') => {
  try {
    const exportData = data.map((person, index) => ({
      'S.No': index + 1,
      'Name': person.name,
      'Designation': person.designation,
      'Department': person.department.charAt(0).toUpperCase() + person.department.slice(1),
      'CFMS ID': person.cfmsId,
      'Employee ID': person.employeeId,
      'Email': person.email,
      'Phone': person.phone,
      'Mobile': person.mobile,
      'Office': person.office,
      'Birthday': formatDate(person.birthday),
      'Retirement Date': formatDate(person.retirementDate),
      'Joining Date': formatDate(person.joiningDate),
      'Current Position': person.currentPosition,
      'Previous Position': person.previousPosition,
      'Charges': person.charges,
      'Responsibilities': person.responsibilities
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const colWidths = [
      { wch: 6 },   // S.No
      { wch: 28 },  // Name
      { wch: 20 },  // Designation
      { wch: 15 },  // Department
      { wch: 16 },  // CFMS ID
      { wch: 16 },  // Employee ID
      { wch: 30 },  // Email
      { wch: 18 },  // Phone
      { wch: 18 },  // Mobile
      { wch: 28 },  // Office
      { wch: 14 },  // Birthday
      { wch: 16 },  // Retirement Date
      { wch: 14 },  // Joining Date
      { wch: 32 },  // Current Position
      { wch: 28 },  // Previous Position
      { wch: 40 },  // Charges
      { wch: 60 },  // Responsibilities
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Personnel Directory');

    XLSX.writeFile(workbook, `${filename}_${getDateString()}.xlsx`);
  } catch (error) {
    console.error('Failed to export Excel file:', error);
    // Optionally, surface the error to the caller
    throw error;
  }
};

/**
 * Export personnel data to a PDF file.
 * @param data - Array of personnel objects.
 * @param filename - Base name for the generated file (default: 'CDMA_Directory').
 */
export const exportToPDF = (data: PersonnelData[], filename: string = 'CDMA_Directory') => {
  try {
    const doc = new jsPDF('landscape', 'mm', 'a4');

    // Title
    doc.setFontSize(18);
    doc.setTextColor(0, 128, 128);
    doc.text('CDMA Department - Personnel Directory', 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Generated on: ${new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      14,
      22
    );

    // Main Directory Table
    const directoryData = data.map((person, index) => [
      index + 1,
      person.name,
      person.designation,
      person.department.charAt(0).toUpperCase() + person.department.slice(1),
      person.cfmsId,
      person.employeeId,
      person.email,
    ]);

    autoTable(doc, {
      startY: 28,
      head: [['S.No', 'Name', 'Designation', 'Department', 'CFMS ID', 'Employee ID', 'Email']],
      body: directoryData,
      theme: 'striped',
      headStyles: {
        fillColor: [0, 128, 128],
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 45 },
        2: { cellWidth: 35 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 },
        6: { cellWidth: 55 },
      },
    });

    // Contact Information Page
    doc.addPage('landscape');
    doc.setFontSize(14);
    doc.setTextColor(0, 128, 128);
    doc.text('Contact Information', 14, 15);

    const contactData = data.map((person, index) => [
      index + 1,
      person.name,
      person.phone,
      person.mobile,
      person.office,
    ]);

    autoTable(doc, {
      startY: 22,
      head: [['S.No', 'Name', 'Phone', 'Mobile', 'Office Location']],
      body: contactData,
      theme: 'striped',
      headStyles: {
        fillColor: [0, 128, 128],
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 55 },
        2: { cellWidth: 40 },
        3: { cellWidth: 40 },
        4: { cellWidth: 80 },
      },
    });

    // Important Dates Page
    doc.addPage('landscape');
    doc.setFontSize(14);
    doc.setTextColor(0, 128, 128);
    doc.text('Important Dates - Birthdays & Retirement', 14, 15);

    const datesData = data.map((person, index) => [
      index + 1,
      person.name,
      person.designation,
      formatDate(person.birthday),
      formatDate(person.joiningDate),
      formatDate(person.retirementDate),
      calculateYearsOfService(person.joiningDate),
    ]);

    autoTable(doc, {
      startY: 22,
      head: [
        ['S.No', 'Name', 'Designation', 'Birthday', 'Joining Date', 'Retirement Date', 'Years of Service'],
      ],
      body: datesData,
      theme: 'striped',
      headStyles: {
        fillColor: [0, 128, 128],
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 50 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
        5: { cellWidth: 35 },
        6: { cellWidth: 30 },
      },
    });

    // Positions & Charges Page
    doc.addPage('landscape');
    doc.setFontSize(14);
    doc.setTextColor(0, 128, 128);
    doc.text('Current Positions & Charges', 14, 15);

    const positionsData = data.map((person, index) => [
      index + 1,
      person.name,
      person.currentPosition,
      person.previousPosition,
      person.charges === 'None' ? 'Clear' : 'Under Review',
      person.charges,
    ]);

    autoTable(doc, {
      startY: 22,
      head: [['S.No', 'Name', 'Current Position', 'Previous Position', 'Status', 'Charges']],
      body: positionsData,
      theme: 'striped',
      headStyles: {
        fillColor: [0, 128, 128],
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 45 },
        2: { cellWidth: 50 },
        3: { cellWidth: 45 },
        4: { cellWidth: 25 },
        5: { cellWidth: 60 },
      },
    });

    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 25,
        doc.internal.pageSize.height - 10
      );
      doc.text('CDMA Department - Confidential', 14, doc.internal.pageSize.height - 10);
    }

    doc.save(`${filename}_${getDateString()}.pdf`);
  } catch (error) {
    console.error('Failed to export PDF file:', error);
    throw error;
  }
};

import { safeCreateDate, safeFormatDate } from './dateUtils';

/**
 * Format a date string into "DD-MMM-YYYY".
 * Returns an empty string if the input is invalid.
 */
const formatDate = (dateString: string): string => {
  return safeFormatDate(dateString, '');
};

/**
 * Calculate years of service from a joining date to today.
 * Returns a string like "5 years". Handles invalid dates gracefully.
 */
const calculateYearsOfService = (joiningDate: string): string => {
  const joining = safeCreateDate(joiningDate);
  if (!joining) {
    return 'N/A';
  }
  const today = new Date();
  const years = Math.floor(
    (today.getTime() - joining.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
  return `${years} years`;
};

/**
 * Generate a compact date string "YYYYMMDD" for filenames.
 */
const getDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

/**
 * Export Contact Information to Excel
 */
export const exportContactToExcel = (data: PersonnelData[], filename: string = 'CDMA_Contact_Information') => {
  try {
    const exportData = data.map((person, index) => ({
      'S.No': index + 1,
      'Name': person.name,
      'CFMS ID': person.cfmsId,
      'Designation': person.designation,
      'Email': person.email,
      'Phone': person.phone,
      'Mobile': person.mobile,
      'Office Location': person.office
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet['!cols'] = [
      { wch: 6 },   // S.No
      { wch: 28 },  // Name
      { wch: 16 },  // CFMS ID
      { wch: 22 },  // Designation
      { wch: 30 },  // Email
      { wch: 18 },  // Phone
      { wch: 18 },  // Mobile
      { wch: 30 },  // Office
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contact Information');
    XLSX.writeFile(workbook, `${filename}_${getDateString()}.xlsx`);
  } catch (error) {
    console.error('Failed to export Contact Excel file:', error);
    throw error;
  }
};

/**
 * Export Important Dates to Excel
 */
export const exportDatesToExcel = (data: PersonnelData[], filename: string = 'CDMA_Important_Dates') => {
  try {
    const exportData = data.map((person, index) => {
      const joiningDateObj = safeCreateDate(person.joiningDate);
      const birthDateObj = safeCreateDate(person.birthday);
      const today = new Date();
      
      const yearsOfService = joiningDateObj 
        ? today.getFullYear() - joiningDateObj.getFullYear()
        : 0;
      
      let age = 0;
      if (birthDateObj) {
        age = today.getFullYear() - birthDateObj.getFullYear();
        const monthDiff = today.getMonth() - birthDateObj.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
          age--;
        }
      }
      
      return {
        'S.No': index + 1,
        'Name': person.name,
        'Designation': person.designation,
        'Birthday': formatDateExport(person.birthday),
        'Age': `${age} years`,
        'Joining Date': formatDateExport(person.joiningDate),
        'Retirement Date': formatDateExport(person.retirementDate),
        'Years of Service': `${yearsOfService} years`
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet['!cols'] = [
      { wch: 6 },   // S.No
      { wch: 28 },  // Name
      { wch: 22 },  // Designation
      { wch: 16 },  // Birthday
      { wch: 12 },  // Age
      { wch: 16 },  // Joining Date
      { wch: 16 },  // Retirement Date
      { wch: 16 },  // Years of Service
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Important Dates');
    XLSX.writeFile(workbook, `${filename}_${getDateString()}.xlsx`);
  } catch (error) {
    console.error('Failed to export Dates Excel file:', error);
    throw error;
  }
};

/**
 * Export Positions & Status to Excel
 */
export const exportPositionsToExcel = (data: PersonnelData[], filename: string = 'CDMA_Positions_Status') => {
  try {
    const exportData = data.map((person, index) => ({
      'S.No': index + 1,
      'Name': person.name,
      'CFMS ID': person.cfmsId,
      'Employee ID': person.employeeId,
      'Current Position': person.currentPosition,
      'Since Year': safeCreateDate(person.joiningDate)?.getFullYear() || 'N/A',
      'Previous Position': person.previousPosition,
      'Department': person.department.charAt(0).toUpperCase() + person.department.slice(1),
      'Status': person.charges === 'None' ? 'Active' : 'Under Review',
      'Charges': person.charges
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet['!cols'] = [
      { wch: 6 },   // S.No
      { wch: 28 },  // Name
      { wch: 16 },  // CFMS ID
      { wch: 16 },  // Employee ID
      { wch: 32 },  // Current Position
      { wch: 12 },  // Since Year
      { wch: 28 },  // Previous Position
      { wch: 15 },  // Department
      { wch: 14 },  // Status
      { wch: 45 },  // Charges
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Positions & Status');
    XLSX.writeFile(workbook, `${filename}_${getDateString()}.xlsx`);
  } catch (error) {
    console.error('Failed to export Positions Excel file:', error);
    throw error;
  }
};

/**
 * Format date for export
 */
const formatDateExport = (dateString: string): string => {
  return safeFormatDate(dateString, '');
};
