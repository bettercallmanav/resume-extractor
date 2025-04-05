'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { validatePdfFile, formatFileSize } from '@/utils/pdf-helpers';
import { FileWithPreview, BATCH_WARNING_THRESHOLD, AVG_PROCESSING_TIME_PER_FILE } from '@/lib/types';

interface FileUploadProps {
  onFileSelected: (file: FileWithPreview) => Promise<void>;
  isProcessing: boolean;
  currentFile: FileWithPreview | null;
}

export default function FileUpload({ onFileSelected, isProcessing }: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [showWarningDialog, setShowWarningDialog] = useState<boolean>(false);

  // Clean up the file preview URLs when component unmounts
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    // Convert to FileWithPreview and validate
    const newFiles = acceptedFiles.map(file => {
      const fileWithPreview = file as FileWithPreview;
      fileWithPreview.preview = URL.createObjectURL(file);
      fileWithPreview.status = 'queued';
      return fileWithPreview;
    });

    // Validate files
    const validFiles = newFiles.filter(file => {
      const validation = validatePdfFile(file);
      if (!validation.valid) {
        file.status = 'failed';
        file.error = validation.error;
      }
      return validation.valid;
    });

    // Check if warning threshold is exceeded
    if (validFiles.length > BATCH_WARNING_THRESHOLD) {
      const estimatedTime = Math.round((validFiles.length * AVG_PROCESSING_TIME_PER_FILE) / 60);
      setWarning(
        `You've selected ${validFiles.length} files. Processing may take approximately ${estimatedTime} minutes.`
      );
      setShowWarningDialog(true);
    }

    setFiles(prev => [...prev, ...validFiles]);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    disabled: isProcessing,
    multiple: true
  });

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const clearAllFiles = () => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    setError(null);
    setWarning(null);
  };

  // Process files one by one

  const processAllFiles = async () => {
    // Reset any existing errors
    setError(null);
    
    // Process files one by one
    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'queued') {
        // Update status to processing
        setFiles(prev => {
          const newFiles = [...prev];
          newFiles[i].status = 'processing';
          return newFiles;
        });

        try {
          // Process the file
          await onFileSelected(files[i]);

          // Update status to completed
          setFiles(prev => {
            const newFiles = [...prev];
            newFiles[i].status = 'completed';
            return newFiles;
          });
        } catch (err) {
          // Update status to failed
          setFiles(prev => {
            const newFiles = [...prev];
            newFiles[i].status = 'failed';
            
            // Check for specific error messages
            let errorMessage = err instanceof Error ? err.message : 'Unknown error';
            
            // Make the error message more user-friendly
            if (errorMessage.includes('The PDF is too large to process')) {
              errorMessage = 'This PDF is too large for Claude to process. Please try a smaller PDF file (fewer pages or smaller file size).';
            }
            
            newFiles[i].error = errorMessage;
            return newFiles;
          });
        }
      }
    }
  };

  // Get counts for status display
  const queuedCount = files.filter(f => f.status === 'queued').length;
  const completedCount = files.filter(f => f.status === 'completed').length;
  const failedCount = files.filter(f => f.status === 'failed').length;
  const processingCount = files.filter(f => f.status === 'processing').length;

  return (
    <div className="w-full">
      {/* Excel-like upload area */}
      <div 
        {...getRootProps()} 
        className={`p-6 border-2 border-dashed rounded text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-[#217346] bg-[#e6f2ff] shadow-sm' 
            : 'border-gray-300 hover:border-[#217346] hover:bg-[#f8f9fa]'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-3">
          <div className="flex items-center justify-center">
            <svg 
              className={`w-10 h-10 ${isDragActive ? 'text-[#217346]' : 'text-gray-400'}`}
              stroke="currentColor" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
          </div>
          <p className={`text-base font-medium ${isDragActive ? 'text-[#217346]' : 'text-gray-700'}`}>
            {isDragActive ? 'Drop PDF files here' : 'Drag & drop PDF resumes or click to select'}
          </p>
          <p className="text-sm text-gray-500">
            Multiple PDF files supported, max 32MB each
          </p>
        </div>
      </div>

      {/* Excel-like Warning Dialog */}
      {showWarningDialog && (
        <div className="mt-4 bg-[#fff4e5] border border-[#ffb74d] p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-[#f57c00]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-.83 0-1.5-.67-1.5-1.5S11.17 14 12 14s1.5.67 1.5 1.5S12.83 17 12 17zm1-4h-2V7h2v6z"/>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-[#e65100]">Warning</p>
              <p className="mt-1 text-sm text-[#e65100]/80">{warning}</p>
              <div className="mt-3 flex space-x-2">
                <button 
                  onClick={() => setShowWarningDialog(false)}
                  className="px-3 py-1 bg-[#217346] text-white text-xs font-medium rounded hover:bg-[#1a5c38] transition-colors"
                >
                  Continue
                </button>
                <button 
                  onClick={clearAllFiles}
                  className="px-3 py-1 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-100 transition-colors"
                >
                  Clear Files
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Excel-like Error Dialog */}
      {error && (
        <div className="mt-4 bg-[#fde9e9] border border-[#f44336] p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-[#d32f2f]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-[#c62828]">Error</p>
              <p className="mt-1 text-sm text-[#c62828]/80">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Excel-like File List */}
      {files.length > 0 && (
        <div className="mt-4">
          {/* Excel-like header */}
          <div className="bg-[#f3f2f1] border border-gray-300 border-b-0 rounded-t px-3 py-2 flex justify-between items-center">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-[#217346] mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
              <h3 className="text-sm font-medium text-gray-700">
                Files ({files.length})
              </h3>
            </div>
            <div className="flex items-center text-xs">
              {queuedCount > 0 && (
                <span className="mr-2 px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                  Queued: {queuedCount}
                </span>
              )}
              {processingCount > 0 && (
                <span className="mr-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                  Processing: {processingCount}
                </span>
              )}
              {completedCount > 0 && (
                <span className="mr-2 px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                  Completed: {completedCount}
                </span>
              )}
              {failedCount > 0 && (
                <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded">
                  Failed: {failedCount}
                </span>
              )}
            </div>
          </div>

          {/* Excel-like table */}
          <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-b">
            <table className="min-w-full border-collapse">
              <thead className="bg-[#f3f2f1] text-xs text-gray-700">
                <tr>
                  <th className="py-1 px-3 text-left font-medium border border-gray-300">Name</th>
                  <th className="py-1 px-3 text-left font-medium border border-gray-300">Size</th>
                  <th className="py-1 px-3 text-left font-medium border border-gray-300">Status</th>
                  <th className="py-1 px-3 text-center font-medium border border-gray-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file, index) => (
                  <tr 
                    key={index} 
                    className={`text-sm ${
                      index % 2 === 0 ? 'bg-white' : 'bg-[#f8f9fa]'
                    } ${file.status === 'processing' ? 'bg-[#e6f2ff]' : ''}`}
                  >
                    <td className="py-1.5 px-3 border border-gray-300">
                      <div className="flex items-center">
                        <svg 
                          className={`w-4 h-4 mr-2 ${
                            file.status === 'completed' ? 'text-green-500' : 
                            file.status === 'failed' ? 'text-red-500' : 
                            file.status === 'processing' ? 'text-blue-500' : 
                            'text-gray-400'
                          }`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          {file.status === 'completed' ? (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          ) : file.status === 'failed' ? (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          ) : (
                            <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                          )}
                        </svg>
                        <span className="truncate max-w-[150px]">{file.name}</span>
                      </div>
                    </td>
                    <td className="py-1.5 px-3 text-xs text-gray-500 border border-gray-300">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="py-1.5 px-3 border border-gray-300">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        file.status === 'completed' ? 'bg-green-100 text-green-700' : 
                        file.status === 'failed' ? 'bg-red-100 text-red-700' : 
                        file.status === 'processing' ? 'bg-blue-100 text-blue-700' : 
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {file.status === 'completed' ? 'Completed' : 
                         file.status === 'failed' ? 'Failed' : 
                         file.status === 'processing' ? 'Processing' : 
                         'Queued'}
                      </span>
                    </td>
                    <td className="py-1.5 px-3 text-center border border-gray-300">
                      {!isProcessing && file.status !== 'processing' && (
                        <button
                          onClick={() => removeFile(index)}
                          className="text-xs text-gray-500 hover:text-red-500"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Excel-like Action Buttons */}
          <div className="mt-4 flex space-x-2">
            {queuedCount > 0 && !isProcessing && (
              <button
                onClick={processAllFiles}
                className="flex-1 py-2 px-4 bg-[#217346] hover:bg-[#1a5c38] text-white text-sm font-medium rounded transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Process {queuedCount} {queuedCount === 1 ? 'File' : 'Files'}
              </button>
            )}
            {!isProcessing && (
              <button
                onClick={clearAllFiles}
                className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded border border-gray-300 transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
