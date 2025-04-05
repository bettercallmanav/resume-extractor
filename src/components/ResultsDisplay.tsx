'use client';

import { ContactInfo, ResumeData } from '@/lib/types';
import { useState } from 'react';
import * as XLSX from 'xlsx';

interface ResultsDisplayProps {
  resumeDataList: ResumeData[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
}

export default function ResultsDisplay({ 
  resumeDataList, 
  onRemoveItem, 
  onClearAll
}: ResultsDisplayProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof ContactInfo | 'fileName' | 'timestamp'>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Function to copy text to clipboard
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      
      // Reset the copied status after 2 seconds
      setTimeout(() => {
        setCopiedField(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Function to download data as CSV
  const downloadCSV = () => {
    if (resumeDataList.length === 0) return;

    // Create CSV content
    const headers = ['File Name', 'Full Name', 'Email', 'Phone', 'LinkedIn', 'Location', 'Website', 'Timestamp'];
    const rows = resumeDataList.map(item => [
      item.fileName,
      item.data.fullName || '',
      item.data.email || '',
      item.data.phone || '',
      item.data.linkedin || '',
      item.data.location || '',
      item.data.website || '',
      new Date(item.timestamp).toLocaleString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'resume_contact_info.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to download data as XLSX
  const downloadXLSX = () => {
    if (resumeDataList.length === 0) return;

    // Create worksheet data
    const headers = ['File Name', 'Full Name', 'Email', 'Phone', 'LinkedIn', 'Location', 'Website', 'Timestamp'];
    const rows = resumeDataList.map(item => [
      item.fileName,
      item.data.fullName || '',
      item.data.email || '',
      item.data.phone || '',
      item.data.linkedin || '',
      item.data.location || '',
      item.data.website || '',
      new Date(item.timestamp).toLocaleString()
    ]);
    
    const wsData = [headers, ...rows];
    
    // Create worksheet and workbook
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contact Info');
    
    // Generate and download file
    XLSX.writeFile(wb, 'resume_contact_info.xlsx');
  };

  // Function to sort the data
  const sortedData = [...resumeDataList].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    if (sortField === 'fileName') {
      aValue = a.fileName;
      bValue = b.fileName;
    } else if (sortField === 'timestamp') {
      aValue = new Date(a.timestamp).getTime();
      bValue = new Date(b.timestamp).getTime();
    } else {
      aValue = a.data[sortField] || '';
      bValue = b.data[sortField] || '';
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Function to handle sort
  const handleSort = (field: keyof ContactInfo | 'fileName' | 'timestamp') => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Function to render sort indicator
  const renderSortIndicator = (field: keyof ContactInfo | 'fileName' | 'timestamp') => {
    if (field !== sortField) return null;
    
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  // Function to copy row data as JSON
  const copyRowData = (item: ResumeData) => {
    const jsonString = JSON.stringify(item.data, null, 2);
    copyToClipboard(jsonString, `row-${item.id}`);
  };

  // Excel-like row hover state
  const [hoverRowIndex, setHoverRowIndex] = useState<number | null>(null);

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-200 flex flex-col h-full">
      {/* Excel-like ribbon */}
      <div className="bg-[#217346] text-white py-2 px-4 flex justify-between items-center rounded-t-lg">
        <div className="flex items-center">
          <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.17 3.25H2.83c-.76 0-1.38.62-1.38 1.38v14.74c0 .76.62 1.38 1.38 1.38h18.34c.76 0 1.38-.62 1.38-1.38V4.63c0-.76-.62-1.38-1.38-1.38zM8.82 17.95H3.34V12.1h5.48v5.85zm0-7.42H3.34V6.05h5.48v4.48zm7.31 7.42H9.89V12.1h6.24v5.85zm0-7.42H9.89V6.05h6.24v4.48zm4.53 7.42h-3.11V12.1h3.11v5.85zm0-7.42h-3.11V6.05h3.11v4.48z" />
          </svg>
          <span className="font-semibold">Resume Data</span>
          <span className="ml-2 bg-white text-[#217346] text-xs px-2 py-0.5 rounded">
            {resumeDataList.length} {resumeDataList.length === 1 ? 'row' : 'rows'}
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={downloadCSV}
            disabled={resumeDataList.length === 0}
            className={`py-1 px-3 text-sm font-medium rounded transition-colors flex items-center
              ${resumeDataList.length === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-white text-[#217346] hover:bg-gray-100'}`}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            CSV
          </button>
          <button
            onClick={downloadXLSX}
            disabled={resumeDataList.length === 0}
            className={`py-1 px-3 text-sm font-medium rounded transition-colors flex items-center
              ${resumeDataList.length === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-white text-[#217346] hover:bg-gray-100'}`}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Excel
          </button>
          {resumeDataList.length > 0 && (
            <button
              onClick={onClearAll}
              className="py-1 px-3 bg-white text-red-600 hover:bg-gray-100 text-sm font-medium rounded transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>
      
      {/* Excel-like formula bar */}
      <div className="bg-[#f3f2f1] border-b border-gray-300 px-4 py-1 flex items-center text-xs text-gray-600">
        <div className="mr-2 font-medium">Sheet1</div>
        <div className="flex-1">
          Resume contact information
        </div>
      </div>
      
      {resumeDataList.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-[#f8f9fa] border border-gray-200">
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2 text-sm font-medium">
              No data available. Upload and process resumes to see results.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              {/* Excel-like column headers */}
              <thead>
                <tr className="bg-[#f3f2f1] text-gray-700">
                  <th 
                    scope="col" 
                    className="py-2 px-3 text-left text-xs font-medium border border-gray-300 cursor-pointer"
                    onClick={() => handleSort('fileName')}
                  >
                    <div className="flex items-center">
                      File Name {renderSortIndicator('fileName')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="py-2 px-3 text-left text-xs font-medium border border-gray-300 cursor-pointer"
                    onClick={() => handleSort('fullName')}
                  >
                    <div className="flex items-center">
                      Full Name {renderSortIndicator('fullName')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="py-2 px-3 text-left text-xs font-medium border border-gray-300 cursor-pointer"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center">
                      Email {renderSortIndicator('email')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="py-2 px-3 text-left text-xs font-medium border border-gray-300 cursor-pointer"
                    onClick={() => handleSort('phone')}
                  >
                    <div className="flex items-center">
                      Phone {renderSortIndicator('phone')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="py-2 px-3 text-left text-xs font-medium border border-gray-300 cursor-pointer"
                    onClick={() => handleSort('location')}
                  >
                    <div className="flex items-center">
                      Address {renderSortIndicator('location')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="py-2 px-3 text-left text-xs font-medium border border-gray-300 cursor-pointer"
                    onClick={() => handleSort('linkedin')}
                  >
                    <div className="flex items-center">
                      LinkedIn {renderSortIndicator('linkedin')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="py-2 px-3 text-left text-xs font-medium border border-gray-300 cursor-pointer"
                    onClick={() => handleSort('website')}
                  >
                    <div className="flex items-center">
                      Website {renderSortIndicator('website')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="py-2 px-3 text-left text-xs font-medium border border-gray-300 cursor-pointer"
                    onClick={() => handleSort('timestamp')}
                  >
                    <div className="flex items-center">
                      Processed {renderSortIndicator('timestamp')}
                    </div>
                  </th>
                  <th scope="col" className="py-2 px-3 text-center text-xs font-medium border border-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item, index) => (
                  <tr 
                    key={item.id} 
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#f8f9fa]'} ${hoverRowIndex === index ? 'bg-[#f0f0f0]' : ''}`}
                    onMouseEnter={() => setHoverRowIndex(index)}
                    onMouseLeave={() => setHoverRowIndex(null)}
                  >
                    <td className="py-2 px-3 text-sm text-gray-800 border border-gray-300 truncate max-w-[150px]">
                      {item.fileName}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-800 border border-gray-300 truncate max-w-[150px]">
                      {item.data.fullName || '-'}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-800 border border-gray-300 truncate max-w-[150px]">
                      {item.data.email ? (
                        <a 
                          href={`mailto:${item.data.email}`}
                          className="text-blue-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {item.data.email}
                        </a>
                      ) : '-'}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-800 border border-gray-300 truncate max-w-[150px]">
                      {item.data.phone || '-'}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-800 border border-gray-300 truncate max-w-[150px]">
                      {item.data.location || '-'}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-800 border border-gray-300 truncate max-w-[150px]">
                      {item.data.linkedin ? (
                        <a 
                          href={item.data.linkedin.startsWith('http') ? item.data.linkedin : `https://${item.data.linkedin}`}
                          className="text-blue-600 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {item.data.linkedin}
                        </a>
                      ) : '-'}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-800 border border-gray-300 truncate max-w-[150px]">
                      {item.data.website ? (
                        <a 
                          href={item.data.website.startsWith('http') ? item.data.website : `https://${item.data.website}`}
                          className="text-blue-600 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {item.data.website}
                        </a>
                      ) : '-'}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-500 border border-gray-300 truncate max-w-[150px]">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-sm font-medium border border-gray-300 whitespace-nowrap text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyRowData(item);
                        }}
                        className="text-blue-600 hover:text-blue-800 mx-1"
                        title={copiedField === `row-${item.id}` ? 'Copied!' : 'Copy'}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveItem(item.id);
                        }}
                        className="text-red-600 hover:text-red-800 mx-1"
                        title="Remove"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Excel-like status bar */}
      <div className="bg-[#f3f2f1] border-t border-gray-300 px-4 py-1 flex justify-between items-center text-xs text-gray-600">
        <div>
          {resumeDataList.length > 0 ? `${resumeDataList.length} ${resumeDataList.length === 1 ? 'row' : 'rows'}` : 'No data'}
        </div>
        <div className="flex items-center">
          <span className="mr-4">100%</span>
          <button className="text-gray-500 hover:text-gray-700 mx-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4" />
            </svg>
          </button>
          <span className="mx-1">100%</span>
          <button className="text-gray-500 hover:text-gray-700 mx-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
