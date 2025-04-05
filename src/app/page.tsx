'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import FileUpload from '@/components/FileUpload';
import ResultsDisplay from '@/components/ResultsDisplay';
import LoadingState from '@/components/LoadingState';
import { ResumeData, FileWithPreview } from '@/lib/types';
import { fileToBase64 } from '@/utils/pdf-helpers';

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeDataList, setResumeDataList] = useState<ResumeData[]>([]);
  const [currentFile, setCurrentFile] = useState<FileWithPreview | null>(null);

  const processFile = async (file: FileWithPreview): Promise<void> => {
    setIsProcessing(true);
    setError(null);
    setCurrentFile(file);

    try {
      // Convert file to base64
      const base64Data = await fileToBase64(file);
      
      // Call API to extract resume data
      const response = await fetch('/api/extract-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pdfBase64: base64Data }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to extract information from the resume');
      }

      // Add new resume data to the list
      const newResumeData: ResumeData = {
        id: uuidv4(),
        fileName: file.name,
        data: result.data,
        timestamp: new Date(),
        pdfData: base64Data // Still store the PDF data for future use if needed
      };

      setResumeDataList(prev => [...prev, newResumeData]);
    } catch (err) {
      console.error('Error extracting resume data:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err; // Re-throw to let the FileUpload component know there was an error
    } finally {
      setIsProcessing(false);
      setCurrentFile(null);
    }
  };

  const handleRemoveItem = (id: string) => {
    setResumeDataList(prev => prev.filter(item => item.id !== id));
  };

  const handleClearAll = () => {
    setResumeDataList([]);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Excel-like header */}
        <div className="bg-[#217346] text-white py-4 px-6 rounded-t-lg mb-0 flex items-center">
          <img 
            src="/miduty.webp" 
            alt="Miduty Logo" 
            className="h-10 w-auto mr-4"
          />
          <div>
            <h1 className="text-2xl font-bold">
              Resume Contact Extractor
            </h1>
            <p className="text-sm text-white/80">
              Professional tool for extracting contact information from PDF resumes
            </p>
          </div>
        </div>

        {/* Excel-like menu bar */}
        <div className="bg-[#f3f2f1] border-b border-gray-300 px-6 py-2 flex items-center text-sm text-gray-700 font-medium">
          <div className="mr-6">File</div>
          <div className="mr-6">Home</div>
          <div className="mr-6">Insert</div>
          <div className="mr-6">Data</div>
          <div className="mr-6">View</div>
          <div className="mr-6">Help</div>
        </div>

        {/* Responsive two-column layout */}
        <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-200px)]">
          {/* Left column - File upload */}
          <div className="w-full lg:w-2/5 p-4 lg:border-r border-gray-300 mb-4 lg:mb-0">
            <div className="bg-white shadow-sm rounded-sm p-4 border border-gray-200 h-full">
              <div className="bg-[#217346] text-white py-2 px-4 rounded-t-sm -mt-4 -mx-4 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H9V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L7 9.414V13H5.5z" />
                  <path d="M9 13h2v5a1 1 0 11-2 0v-5z" />
                </svg>
                <span className="font-medium">Upload Resumes</span>
              </div>
              
              <FileUpload 
                onFileSelected={processFile} 
                isProcessing={isProcessing}
                currentFile={currentFile}
              />

              {error && (
                <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-3 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right column - Data Table */}
          <div className="w-full lg:w-3/5 p-4 flex flex-col">
            <div className="flex mb-0">
              <div className="py-2 px-6 text-sm font-medium rounded-t-lg bg-white text-[#217346] border border-gray-300 border-b-0">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
                  </svg>
                  Data Table
                </div>
              </div>
            </div>
            
            <div className="flex-1 bg-white border border-gray-300 rounded-b-lg rounded-tr-lg">
              {isProcessing && <LoadingState />}

              {!isProcessing && (
                <ResultsDisplay 
                  resumeDataList={resumeDataList} 
                  onRemoveItem={handleRemoveItem}
                  onClearAll={handleClearAll}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
