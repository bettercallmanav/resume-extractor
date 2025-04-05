/**
 * Utility functions for handling PDF files
 */

// Convert a File object to a base64 string
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
};

// Validate if a file is a PDF and within size limits
export const validatePdfFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'File must be a PDF' };
  }

  // Check file size (32MB limit as per Claude's requirements)
  const MAX_FILE_SIZE = 32 * 1024 * 1024; // 32MB in bytes
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `File size exceeds 32MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB)` 
    };
  }

  return { valid: true };
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return bytes + ' bytes';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + ' KB';
  } else {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
};
