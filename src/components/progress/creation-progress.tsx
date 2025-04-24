import React from 'react';

export enum CreationStep {
  WALLET_CONNECTION = 0,
  IMAGE_SELECTION = 1,
  EXTRACTION = 2,
  VERIFICATION = 3,
  MINTING = 4,
  FINALIZATION = 5,
  COMPLETED = 6
}

interface CreationProgressProps {
  currentStep: CreationStep;
  overallProgress: number; // 0-100
}

const steps = [
  { step: CreationStep.WALLET_CONNECTION, label: 'Connect Wallet', progress: 10 },
  { step: CreationStep.IMAGE_SELECTION, label: 'Select ID', progress: 20 },
  { step: CreationStep.EXTRACTION, label: 'Extract Info', progress: 40 },
  { step: CreationStep.VERIFICATION, label: 'Verify', progress: 60 },
  { step: CreationStep.MINTING, label: 'Mint DID', progress: 80 },
  { step: CreationStep.FINALIZATION, label: 'Finalize', progress: 95 },
  { step: CreationStep.COMPLETED, label: 'Complete', progress: 100 }
];

export default function CreationProgress({ 
  currentStep, 
  overallProgress 
}: CreationProgressProps) {
  return (
    <div className="w-full">
      {/* Step indicators */}
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className="flex flex-col items-center"
          >
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-1
                ${currentStep >= step.step 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}
            >
              {currentStep > step.step ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span className={`text-xs ${currentStep >= step.step ? 'text-blue-600 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700 mb-4">
        <div 
          className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      {/* Current step label */}
      <div className="text-center text-sm text-gray-700 dark:text-gray-300">
        {currentStep < CreationStep.COMPLETED 
          ? `Step ${currentStep + 1} of ${steps.length}: ${steps[currentStep].label}` 
          : 'Digital Identity Created Successfully!'}
      </div>
    </div>
  );
} 