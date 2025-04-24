'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Button from '@/components/ui/button';
import { ArrowUp } from '@/components/icons/arrow-up';
import { Warning } from '@/components/icons/warning';
import InputLabel from '@/components/ui/input-label';

interface IdDocumentUploaderProps {
  selectedIdImage: string | null;
  isLoading: boolean;
  walletConnected: boolean;
  progressMessage: string;
  ocrError: string | null;
  onImageSelect: (file: File) => void;
  onResetImage: () => void;
  onExtractInfo: () => void;
}

export default function IdDocumentUploader({
  selectedIdImage,
  isLoading,
  walletConnected,
  progressMessage,
  ocrError,
  onImageSelect,
  onResetImage,
  onExtractInfo
}: IdDocumentUploaderProps) {
  
  // File upload functionality with react-dropzone
  const { getRootProps, getInputProps, isDragActive, isDragAccept } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        onImageSelect(file);
      }
    }
  });

  if (!selectedIdImage) {
    return (
      <div className="mb-8">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[200px] ${
            isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
          } ${isDragAccept ? 'border-green-500' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="mb-4 text-gray-400">
            <ArrowUp className="mx-auto h-12 w-12" />
          </div>
          <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
            Drag & drop an ID document here, or click to select
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Supported formats: JPEG, PNG
          </p>
        </div>
      </div>
    );
  }
  
  // Display the uploaded image and controls
  return (
    <div className="mb-8 flex flex-col">
      <InputLabel title="Selected ID Document" />
      <div className="mb-4 w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <img 
          src={selectedIdImage} 
          alt="ID Document" 
          className="w-full object-contain" 
          style={{ maxHeight: '400px' }}
        />
      </div>
      
      {!walletConnected && (
        <div className="mb-4 rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <Warning className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Connect your wallet to extract ID information and create your digital identity.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {ocrError && (
        <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-400">{ocrError}</p>
        </div>
      )}
      
      <div className="flex gap-4">
        <Button 
          shape="rounded" 
          onClick={onExtractInfo}
          disabled={isLoading || !walletConnected}
        >
          {isLoading 
            ? progressMessage || "Processing..." 
            : !walletConnected 
              ? "Connect Wallet First" 
              : "Extract Information"
          }
        </Button>
        <Button shape="rounded" variant="ghost" onClick={onResetImage}>
          Reselect Image
        </Button>
      </div>
    </div>
  );
} 