import React from 'react';
import Button from '@/components/ui/button';

interface DeploymentAnimationProps {
  deploymentStage: string | null;
  deploymentComplete: boolean;
  animationProgress: number;
  onCancel: () => void;
  onReset: () => void;
  mintStatus?: string | null;
  txHash?: string | null;
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
  onReset,
  mintStatus,
  txHash
}: DeploymentAnimationProps) {
  if (!deploymentStage && !deploymentComplete) {
    return null;
  }

  // Maps each stage to a display title and description
  const stageInfo = {
    verifying: {
      title: 'Verifying Information',
      description: 'Validating your ID information...'
    },
    minting: {
      title: 'Minting Your Digital Identity',
      description: mintStatus || 'Creating your DID on the blockchain...'
    },
    finishing: {
      title: 'Finalizing',
      description: 'Setting up your digital identity...'
    }
  };

  const currentStage = deploymentStage ? stageInfo[deploymentStage as keyof typeof stageInfo] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800">
        {deploymentComplete ? (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Digital Identity Created!</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Your Digital Identity has been successfully created and is now available.
            </p>
            {mintStatus && (
              <div className="mb-4 rounded bg-gray-50 p-3 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                <p>{mintStatus}</p>
              </div>
            )}
            {txHash && (
              <div className="mb-6">
                <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">Transaction Hash:</p>
                <a 
                  href={`https://etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate rounded bg-gray-50 p-2 text-xs text-blue-600 hover:text-blue-800 dark:bg-gray-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {txHash}
                </a>
              </div>
            )}
            <Button shape="rounded" onClick={onReset} className="w-full">
              Create Another DID
            </Button>
          </div>
        ) : (
          <div>
            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
              {currentStage?.title}
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              {currentStage?.description}
            </p>
            
            {/* Status display for minting stage */}
            {deploymentStage === 'minting' && mintStatus && (
              <div className="mb-4 rounded bg-gray-50 p-3 text-sm text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                <p>{mintStatus}</p>
                {txHash && (
                  <div className="mt-2">
                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Transaction Hash:</p>
                    <a 
                      href={`https://etherscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {txHash}
                    </a>
                  </div>
                )}
              </div>
            )}
            
            {/* Progress bar */}
            <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300 ease-out"
                style={{ width: `${animationProgress}%` }}
              ></div>
            </div>
            
            <Button shape="rounded" variant="ghost" onClick={onCancel} className="w-full">
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 