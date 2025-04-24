import { useState, useEffect } from 'react';
import Button from '@/components/ui/button';
import TrashIcon from '@/components/icons/trash';
import { LaptopIcon, ClockIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/outline';
import cn from 'classnames';

export type MintStatus = 'idle' | 'processing' | 'success' | 'failed';

export interface DeploymentAnimationProps {
  mintStatus: MintStatus;
  txHash?: string;
  onReset?: () => void;
  className?: string;
}

export default function DeploymentAnimation({
  mintStatus,
  txHash,
  onReset,
  className,
}: DeploymentAnimationProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (mintStatus === 'processing') {
      // Simulate progress
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 1;
          if (newProgress >= 90) {
            clearInterval(interval);
            return 90; // Cap at 90% until completion
          }
          return newProgress;
        });
      }, 300);
    } else if (mintStatus === 'success') {
      setProgress(100);
    } else if (mintStatus === 'failed') {
      // Keep progress where it was
    } else {
      setProgress(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mintStatus]);

  return (
    <div className={cn('flex flex-col items-center text-center', className)}>
      <div className="relative w-full max-w-[280px] h-[280px] mb-6">
        {/* Circular progress indicator */}
        <div className="absolute top-0 left-0 w-full h-full">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              strokeWidth="5"
              stroke="#111827"
              className="opacity-10"
            />
            {progress > 0 && (
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                strokeWidth="5"
                stroke={mintStatus === 'failed' ? '#EF4444' : '#3B82F6'}
                strokeLinecap="round"
                strokeDasharray={`${progress * 2.83} 283`}
                strokeDashoffset="0"
                transform="rotate(-90 50 50)"
              />
            )}
          </svg>
        </div>

        {/* Center icon */}
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          {mintStatus === 'idle' && (
            <LaptopIcon className="w-24 h-24 text-gray-400" />
          )}
          {mintStatus === 'processing' && (
            <ClockIcon className="w-24 h-24 text-blue-500 animate-pulse" />
          )}
          {mintStatus === 'success' && (
            <CheckCircleIcon className="w-24 h-24 text-green-500" />
          )}
          {mintStatus === 'failed' && (
            <ExclamationCircleIcon className="w-24 h-24 text-red-500" />
          )}
        </div>
      </div>

      {/* Status text */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">
          {mintStatus === 'idle' && 'Ready to Deploy'}
          {mintStatus === 'processing' && 'Deploying Digital Identity...'}
          {mintStatus === 'success' && 'Digital Identity Deployed!'}
          {mintStatus === 'failed' && 'Deployment Failed'}
        </h3>
        <p className="text-gray-500">
          {mintStatus === 'idle' && 'Click the button below to start the deployment process.'}
          {mintStatus === 'processing' && `Progress: ${progress}%`}
          {mintStatus === 'success' && 'Your digital identity has been successfully deployed to the blockchain.'}
          {mintStatus === 'failed' && 'There was an error while deploying your digital identity. Please try again.'}
        </p>
      </div>

      {/* Transaction hash display */}
      {txHash && mintStatus === 'success' && (
        <div className="mb-6 w-full max-w-md">
          <div className="bg-gray-100 rounded-lg p-3 flex items-center break-all">
            <span className="text-xs text-gray-700 truncate">
              {txHash}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Transaction Hash</p>
        </div>
      )}

      {/* Actions */}
      {mintStatus !== 'processing' && (
        <div className="flex gap-4">
          {onReset && (
            <Button shape="rounded" variant="solid" color="gray" onClick={onReset}>
              <TrashIcon className="mr-2" />
              Reset
            </Button>
          )}
          {mintStatus === 'success' && (
            <Button shape="rounded" variant="solid" color="primary">
              View on Explorer
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 