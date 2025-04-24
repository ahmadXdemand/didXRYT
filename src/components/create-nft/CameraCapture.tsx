'use client';

import { useRef, useEffect, useState } from 'react';
import Button from '@/components/ui/button';

interface CameraCaptureProps {
  showCamera: boolean;
  cameraStream: MediaStream | null;
  onCapture: () => void;
  onCancel: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export default function CameraCapture({
  showCamera,
  cameraStream,
  onCapture,
  onCancel,
  videoRef,
  canvasRef
}: CameraCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const captureInProgress = useRef(false);
  
  // Set video source when camera stream is available
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, videoRef]);
  
  // Clean up camera stream on component unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);
  
  // Handle the countdown for photo capture
  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      // Only trigger the capture if it's not already in progress
      if (!captureInProgress.current) {
        captureInProgress.current = true;
        setIsCapturing(true);
        
        // Visual flash effect
        setTimeout(() => {
          setIsCapturing(false);
          onCapture();
          // Reset the flag after capture is complete
          setTimeout(() => {
            captureInProgress.current = false;
          }, 500);
        }, 300);
      }
    }
  }, [countdown, onCapture]);
  
  // Start capture with countdown
  const handleStartCapture = () => {
    // Prevent starting a new capture if one is in progress
    if (captureInProgress.current || countdown !== null) return;
    setCountdown(3); // Start a 3-second countdown
  };
  
  if (!showCamera) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative flex flex-col max-w-3xl w-full rounded-lg overflow-hidden bg-gray-900 shadow-xl">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex justify-between items-center">
          <h3 className="text-white font-medium">Take Verification Photo</h3>
          <button 
            onClick={onCancel}
            className="text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {/* Camera view */}
        <div className="relative aspect-video bg-black">
          <video 
            ref={videoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Flash overlay when capturing */}
          {isCapturing && (
            <div className="absolute inset-0 bg-white animate-flash"></div>
          )}
          
          {/* Countdown overlay */}
          {countdown !== null && countdown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-white text-7xl font-bold">{countdown}</span>
            </div>
          )}
          
          {/* Camera guide overlay */}
          <div className="absolute inset-0 pointer-events-none border-4 border-dashed border-white/30 m-8 rounded-full"></div>
        </div>
        
        {/* Controls */}
        <div className="flex justify-between p-4 bg-gray-800">
          <Button 
            shape="rounded" 
            variant="ghost"
            onClick={onCancel}
            className="text-white"
          >
            Cancel
          </Button>
          
          <Button 
            shape="circle"
            onClick={handleStartCapture}
            disabled={countdown !== null}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center rounded-full border-4 border-white"
          >
            <span className="w-10 h-10 rounded-full bg-red-500"></span>
          </Button>
          
          <div className="w-20"></div> {/* Spacer to center the capture button */}
        </div>
      </div>
    </div>
  );
} 