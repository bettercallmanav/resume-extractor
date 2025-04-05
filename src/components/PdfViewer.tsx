'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Initialize PDF.js worker
if (typeof window !== 'undefined') {
  // Use unpkg as a more reliable CDN
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
}

interface PdfViewerProps {
  pdfData: string | null;
  fileName: string | null;
}

export default function PdfViewer({ pdfData, fileName }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  // Handle document load success
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  // Navigation functions
  const goToPrevPage = () => setPageNumber(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setPageNumber(prev => Math.min(numPages || 1, prev + 1));
  
  // Zoom functions
  const zoomIn = () => setScale(prev => Math.min(2.0, prev + 0.1));
  const zoomOut = () => setScale(prev => Math.max(0.5, prev - 0.1));
  const resetZoom = () => setScale(1.0);

  if (!pdfData) {
    return (
      <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">No PDF selected</p>
          <p className="mt-1 text-xs text-gray-400">Select a resume from the table to view the original PDF</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-200 flex flex-col h-full">
      {/* Excel-like ribbon */}
      <div className="bg-[#217346] text-white py-2 px-4 flex flex-col sm:flex-row justify-between items-center rounded-t-lg">
        <div className="flex items-center mb-2 sm:mb-0">
          <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.17 3.25H2.83c-.76 0-1.38.62-1.38 1.38v14.74c0 .76.62 1.38 1.38 1.38h18.34c.76 0 1.38-.62 1.38-1.38V4.63c0-.76-.62-1.38-1.38-1.38zM8.82 17.95H3.34V12.1h5.48v5.85zm0-7.42H3.34V6.05h5.48v4.48zm7.31 7.42H9.89V12.1h6.24v5.85zm0-7.42H9.89V6.05h6.24v4.48zm4.53 7.42h-3.11V12.1h3.11v5.85zm0-7.42h-3.11V6.05h3.11v4.48z" />
          </svg>
          <span className="font-semibold">PDF Viewer</span>
          {fileName && (
            <span className="ml-2 bg-white text-[#217346] text-xs px-2 py-0.5 rounded truncate max-w-[150px] sm:max-w-xs">
              {fileName}
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={zoomOut} 
            className="py-1 px-2 bg-white text-[#217346] hover:bg-gray-100 text-sm font-medium rounded transition-colors"
            aria-label="Zoom out"
          >
            <span>-</span>
          </button>
          <button 
            onClick={resetZoom} 
            className="py-1 px-2 bg-white text-[#217346] hover:bg-gray-100 text-sm font-medium rounded transition-colors"
            aria-label="Reset zoom"
          >
            {Math.round(scale * 100)}%
          </button>
          <button 
            onClick={zoomIn} 
            className="py-1 px-2 bg-white text-[#217346] hover:bg-gray-100 text-sm font-medium rounded transition-colors"
            aria-label="Zoom in"
          >
            <span>+</span>
          </button>
        </div>
      </div>
      
      {/* Excel-like formula bar */}
      <div className="bg-[#f3f2f1] border-b border-gray-300 px-4 py-1 flex items-center text-xs text-gray-600">
        <div className="mr-2 font-medium">Document</div>
        <div className="flex-1">
          {fileName ? `Viewing: ${fileName}` : 'No document selected'}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto border border-gray-200 bg-[#f8f9fa]">
        <div className="flex justify-center">
          <Document
            file={`data:application/pdf;base64,${pdfData}`}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#217346] mx-auto mb-4"></div>
                <p>Loading PDF...</p>
              </div>
            }
            error={
              <div className="text-center py-10 text-red-500">
                <svg className="mx-auto h-10 w-10 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Failed to load PDF</p>
              </div>
            }
            className="max-w-full"
          >
            <Page 
              pageNumber={pageNumber} 
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="max-w-full"
              width={typeof window !== 'undefined' ? Math.min(window.innerWidth - 80, 800) : 600}
            />
          </Document>
        </div>
      </div>
      
      {numPages && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-2 sm:space-y-0">
          <button 
            onClick={goToPrevPage} 
            disabled={pageNumber <= 1}
            className="w-full sm:w-auto px-3 py-1.5 bg-[#217346] text-white rounded-md disabled:opacity-50 disabled:bg-gray-300 disabled:text-gray-500 transition-colors flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          <p className="text-sm text-gray-600 font-medium">
            Page {pageNumber} of {numPages}
          </p>
          <button 
            onClick={goToNextPage} 
            disabled={pageNumber >= numPages}
            className="w-full sm:w-auto px-3 py-1.5 bg-[#217346] text-white rounded-md disabled:opacity-50 disabled:bg-gray-300 disabled:text-gray-500 transition-colors flex items-center justify-center"
          >
            Next
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
