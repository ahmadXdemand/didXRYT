import React from 'react';
import Button from '@/components/ui/button';

interface DeploymentAnimationProps {
  deploymentStage: string | null;
  deploymentComplete: boolean;
  animationProgress: number;
  onCancel: () => void;
  onReset: () => void;
}

// Helper function to generate a random transaction hash
const generateRandomTxHash = () => {
  const characters = '0123456789abcdef';
  let result = '0x';
  for (let i = 0; i < 64; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result.substring(0, 10) + '...' + result.substring(result.length - 8);
};

export default function DeploymentAnimation({
  deploymentStage,
  deploymentComplete,
  animationProgress,
  onCancel,
  onReset
}: DeploymentAnimationProps) {
  if (!deploymentStage) return null;

  // Verification stage content
  const renderVerifyingContent = () => (
    <>
      <div className="animate-pulse mb-6">
        <svg className="mx-auto w-24 h-24 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="relative w-64 h-3 mx-auto mb-8 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
        <div 
          className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${animationProgress}%` }}
        ></div>
      </div>
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verifying ID</h3>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Ensuring your identity document is valid and secure...
        </p>
      </div>
      <div className="flex justify-center space-x-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-2 w-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
        ))}
      </div>
    </>
  );

  // Minting stage content
  const renderMintingContent = () => (
    <>
      <div className="relative mb-6">
        <svg className="mx-auto w-24 h-24 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <div className="w-32 h-32 border-t-4 border-b-4 border-purple-500 rounded-full animate-spin"></div>
        </div>
      </div>
      <div className="relative w-64 h-3 mx-auto mb-8 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
        <div 
          className="absolute top-0 left-0 h-full bg-purple-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${animationProgress}%` }}
        ></div>
      </div>
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Minting Your DID</h3>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Creating your unique digital identity on the blockchain...
        </p>
      </div>
      <div className="flex flex-wrap justify-center max-w-md mx-auto">
        {Array.from({length: 8}).map((_, i) => (
          <div 
            key={i} 
            className="m-1 w-8 h-8 bg-purple-500 rounded-md opacity-0"
            style={{
              animation: `fadeInOut 2s infinite`,
              animationDelay: `${i * 0.2}s`
            }}
          ></div>
        ))}
      </div>
    </>
  );

  // Finishing stage content
  const renderFinishingContent = () => (
    <>
      <div className="mb-6 relative">
        <svg className="mx-auto w-24 h-24 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 bg-green-100 rounded-full animate-ping"></div>
        </div>
      </div>
      <div className="relative w-64 h-3 mx-auto mb-8 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
        <div 
          className="absolute top-0 left-0 h-full bg-green-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${animationProgress}%` }}
        ></div>
      </div>
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Finalizing Your DID</h3>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Securing your digital identity and preparing it for use...
        </p>
      </div>
      <div className="flex justify-center">
        <div className="relative w-16 h-16">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute inset-0 border-2 border-green-500 rounded-full"
              style={{
                transform: `rotate(${i * 45}deg)`,
                animation: `pulse 1.5s infinite`,
                animationDelay: `${i * 0.2}s`,
                opacity: 0.7
              }}
            ></div>
          ))}
        </div>
      </div>
    </>
  );

  // Completion stage content
  const renderCompletionContent = () => (
    <>
      <div className="mb-6 transform transition-all duration-500 scale-100 animate-bounce">
        <svg className="mx-auto w-24 h-24 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">DID Successfully Deployed!</h3>
        <p className="text-gray-600 dark:text-gray-300 text-xl mb-6">
          Your digital identity is now securely stored on the blockchain.
        </p>
        <Button 
          shape="rounded" 
          variant="solid" 
          size="large"
          className="animate-pulse"
          onClick={onReset}
        >
          Create Another DID
        </Button>
      </div>
      <div className="flex justify-center mt-4">
        <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Transaction ID: {generateRandomTxHash()}</span>
        </div>
      </div>
    </>
  );

  // Return the full animation component
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-95 dark:bg-opacity-95 transition-all duration-300">
      <div className="max-w-2xl w-full p-8">
        {deploymentStage === 'verifying' && renderVerifyingContent()}
        {deploymentStage === 'minting' && renderMintingContent()}
        {deploymentStage === 'finishing' && renderFinishingContent()}
        {deploymentComplete && renderCompletionContent()}
        
        {!deploymentComplete && (
          <button 
            onClick={onCancel}
            className="mt-8 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 flex items-center justify-center mx-auto"
          >
            <svg className="w-5 h-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
} 