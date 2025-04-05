'use client';

export default function LoadingState() {
  return (
    <div className="flex flex-col h-full">
      {/* Excel-like ribbon */}
      <div className="bg-[#217346] text-white py-2 px-4 flex justify-between items-center rounded-t-lg">
        <div className="flex items-center">
          <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.17 3.25H2.83c-.76 0-1.38.62-1.38 1.38v14.74c0 .76.62 1.38 1.38 1.38h18.34c.76 0 1.38-.62 1.38-1.38V4.63c0-.76-.62-1.38-1.38-1.38zM8.82 17.95H3.34V12.1h5.48v5.85zm0-7.42H3.34V6.05h5.48v4.48zm7.31 7.42H9.89V12.1h6.24v5.85zm0-7.42H9.89V6.05h6.24v4.48zm4.53 7.42h-3.11V12.1h3.11v5.85zm0-7.42h-3.11V6.05h3.11v4.48z" />
          </svg>
          <span className="font-semibold">Processing</span>
        </div>
        <div>
          <span className="bg-white text-[#217346] text-xs px-2 py-0.5 rounded">
            Please wait
          </span>
        </div>
      </div>
      
      {/* Excel-like formula bar */}
      <div className="bg-[#f3f2f1] border-b border-gray-300 px-4 py-1 flex items-center text-xs text-gray-600">
        <div className="mr-2 font-medium">Status:</div>
        <div className="flex-1">
          Extracting contact information...
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center bg-[#f8f9fa] border border-gray-200 p-8">
        <div className="text-center">
          <div className="relative mx-auto mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#217346] mb-4"></div>
            <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full bg-[#e6f2ff]"></div>
            </div>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Resume</h3>
          
          {/* Excel-like progress bar */}
          <div className="w-full max-w-xs mx-auto mb-4">
            <div className="h-2 w-full bg-gray-200 rounded-sm overflow-hidden">
              <div className="h-full bg-[#217346] animate-[progress_2s_ease-in-out_infinite]" style={{width: '75%'}}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <div>0%</div>
              <div>75%</div>
              <div>100%</div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 max-w-sm">
            Claude AI is analyzing the PDF and extracting contact information.
            This typically takes 10-15 seconds per resume.
          </p>
        </div>
      </div>
      
      {/* Excel-like status bar */}
      <div className="bg-[#f3f2f1] border-t border-gray-300 px-4 py-1 flex justify-between items-center text-xs text-gray-600">
        <div>
          Processing...
        </div>
        <div className="flex items-center">
          <span>Please wait</span>
        </div>
      </div>
    </div>
  );
}
