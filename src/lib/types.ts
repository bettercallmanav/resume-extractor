// Types for resume data extraction
export interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  linkedin?: string;
  location?: string;
  website?: string;
}

// Types for multiple resume data
export interface ResumeData {
  id: string;
  fileName: string;
  data: ContactInfo;
  timestamp: Date;
  pdfData: string; // Base64 encoded PDF
}

// Types for API requests and responses
export interface ExtractResumeRequest {
  pdfBase64: string;
}

export interface ExtractResumeResponse {
  success: boolean;
  data?: ContactInfo;
  error?: string;
}

// Types for file upload
export interface FileWithPreview extends File {
  preview?: string;
  status?: 'queued' | 'processing' | 'completed' | 'failed';
  error?: string;
}

// Constants
export const BATCH_WARNING_THRESHOLD = 10;
export const AVG_PROCESSING_TIME_PER_FILE = 15; // seconds
