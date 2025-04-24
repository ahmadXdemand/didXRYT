'use client';

import Button from '@/components/ui/button';
import { IDInformation } from './types';

interface IdInformationDisplayProps {
  extractedInfo: IDInformation;
  selectedIdImage: string | null | undefined;
  selfieImage: string | null | undefined;
  walletConnected: boolean;
  walletAddress: string | undefined;
  onStartCamera: () => void;
  onResetImage: () => void;
  onDeployDID: () => void;
  onUploadSelfie: () => void;
  onResetSelfie: () => void;
}

export default function IdInformationDisplay({
  extractedInfo,
  selectedIdImage,
  selfieImage,
  walletConnected,
  walletAddress,
  onStartCamera,
  onResetImage,
  onDeployDID,
  onUploadSelfie,
  onResetSelfie
}: IdInformationDisplayProps) {
  return (
    <div className="mb-8">
      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Extracted ID Information</h3>
        
        {/* Display both ID image and selfie if available */}
        <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">ID Document</h4>
            <div className="w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <img 
                src={selectedIdImage || ''} 
                alt="ID Document" 
                className="w-full object-contain" 
                style={{ maxHeight: '200px' }}
              />
            </div>
          </div>
          
          {selfieImage ? (
            <div>
              <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Verification Photo</h4>
              <div className="w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <img 
                  src={selfieImage} 
                  alt="Verification Photo" 
                  className="w-full object-contain" 
                  style={{ maxHeight: '200px' }}
                />
              </div>
              <Button 
                shape="rounded" 
                variant="ghost"
                onClick={onResetSelfie}
                className="mt-2 text-sm"
              >
                Retake Photo
              </Button>
            </div>
          ) : (
            <div className="flex flex-col justify-center">
              <p className="mb-3 text-sm font-medium text-red-600 dark:text-red-400">
                Required: Please take a verification selfie before you can deploy
              </p>
              <div className="flex space-x-2">
                <Button 
                  shape="rounded" 
                  onClick={onStartCamera}
                  disabled={!walletConnected}
                  className="flex items-center"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 mr-2" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
                    />
                  </svg>
                  {walletConnected ? "Take with Camera" : "Connect Wallet First"}
                </Button>
                
                {/* Manual upload option */}
                <Button 
                  shape="rounded" 
                  variant="ghost"
                  disabled={!walletConnected}
                  onClick={onUploadSelfie}
                  className="flex items-center"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 mr-2" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" 
                    />
                  </svg>
                  Upload Photo
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Personal Details</h4>
            <div className="space-y-3">
              <div>
                <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</span>
                <span className="block text-base font-medium text-gray-900 dark:text-white">{extractedInfo.fullName}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</span>
                <span className="block text-base font-medium text-gray-900 dark:text-white">{extractedInfo.dateOfBirth}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Gender</span>
                <span className="block text-base font-medium text-gray-900 dark:text-white">{extractedInfo.gender}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">ID Number</span>
                <span className="block text-base font-medium text-gray-900 dark:text-white">{extractedInfo.idNumber}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">File Metadata</h4>
            <div className="space-y-3">
              <div>
                <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">File Type</span>
                <span className="block text-base font-medium text-gray-900 dark:text-white">{extractedInfo.metadata.fileType}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">File Size</span>
                <span className="block text-base font-medium text-gray-900 dark:text-white">{extractedInfo.metadata.fileSize}</span>
              </div>
              {extractedInfo.metadata.created && (
                <div>
                  <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Created</span>
                  <span className="block text-base font-medium text-gray-900 dark:text-white">{extractedInfo.metadata.created}</span>
                </div>
              )}
              {walletAddress && (
                <div>
                  <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Wallet Address</span>
                  <span className="block text-base font-medium text-gray-900 dark:text-white">
                    {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Raw OCR Text */}
        <div className="mb-6">
          <details className="cursor-pointer">
            <summary className="text-sm font-medium text-gray-500 dark:text-gray-400">View Raw OCR Text</summary>
            <div className="mt-2 max-h-60 overflow-auto rounded bg-gray-50 p-3 text-xs dark:bg-gray-700">
              <pre className="whitespace-pre-wrap break-words text-gray-700 dark:text-gray-300">
                {extractedInfo.rawText || 'No text data available'}
              </pre>
            </div>
          </details>
        </div>
        
        <div className="flex items-center justify-between">
          <Button 
            shape="rounded" 
            onClick={onDeployDID}
            disabled={!walletConnected || !selfieImage}
          >
            {!walletConnected 
              ? "Connect Wallet to Deploy" 
              : !selfieImage 
                ? "Take Verification Photo First" 
                : "Deploy DID"
            }
          </Button>
          <Button shape="rounded" variant="ghost" onClick={onResetImage}>
            Start Over
          </Button>
        </div>
      </div>
    </div>
  );
} 