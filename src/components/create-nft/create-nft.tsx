'use client';

import { useState, useEffect, useRef } from 'react';

import Button from '@/components/ui/button';
import InputLabel from '@/components/ui/input-label';
import { Ethereum } from '@/components/icons/ethereum';
import { Flow } from '@/components/icons/flow';
import { Warning } from '@/components/icons/warning';
import { Unlocked } from '@/components/icons/unlocked';
import Avatar from '@/components/ui/avatar';
import { Mistral } from '@mistralai/mistralai';
import DeploymentAnimation from '@/components/deployment-animation/deployment-animation';
import CreationProgress, { CreationStep } from '@/components/progress/creation-progress';
import { ethers } from 'ethers';
import { useWallet } from '@/lib/hooks/use-wallet';
import { ArrowUp } from '@/components/icons/arrow-up';
import Web3 from 'web3';

import { useDropzone } from 'react-dropzone';

//images
import AuthorImage from '@/assets/images/author.jpg';
import NFT1 from '@/assets/images/nft/nft-1.jpg';
import PriceType from '@/components/create-nft/price-types-props';
import cn from '@/utils/cn';

// Import types
import { IDInformation } from './types';

// Import components
import IdDocumentUploader from './IdDocumentUploader';
import IdInformationDisplay from './IdInformationDisplay';
import CameraCapture from './CameraCapture';

// Import services
import { 
  startCameraStream, 
  stopCameraStream, 
  captureImageFromVideo 
} from './CameraService';
import { extractIDInformationFromImage } from './OcrService';
import { mintDidToken, createDidMetadata } from './BlockchainService';

// Common ID patterns for extraction
const ID_PATTERNS = {
  // Name patterns (matches patterns like "Name: John Doe" or "NAME JOHN DOE" or "LN SHAHZAIB FN AHMAD")
  namePatterns: [
    /(?:name|full name|nome)[\s:]+([A-Za-z\s.-]+)/i, 
    /(?:mr\.|mrs\.|ms\.|miss)[\s]+([A-Za-z\s.-]+)/i,
    /(?:ln|last name)[\s]+([A-Za-z\s.-]+)[\s]+(?:fn|first name)[\s]+([A-Za-z\s.-]+)/i,
    /(?:fn|first name)[\s]+([A-Za-z\s.-]+)[\s]+(?:ln|last name)[\s]+([A-Za-z\s.-]+)/i,
  ],
  // DOB patterns (matches various date formats)
  dobPatterns: [
    /(?:dob|date of birth|birth date|born|nacimento)[\s:]+(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})/i,
    /(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})(?=\s*(?:dob|birth|born))/i,
    /(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})/,  // YYYY-MM-DD
    /dob\s+(\d{2}\/\d{2}\/\d{4})/i,  // DOB 10/07/1997
  ],
  // Gender patterns
  genderPatterns: [
    /(?:gender|sex|sexo)[\s:]+([MF]|Male|Female|Masculino|Feminino)/i,
    /\b(Male|Female|Masculino|Feminino|M|F)\b(?=\s*(?:gender|sex))/i,
    /sex\s+([MF])/i,  // SEX M
  ],
  // ID number patterns
  idNumberPatterns: [
    /(?:id|id number|license|no|number|documento|identidade)[\s:#]+([A-Z0-9-]+)/i,
    /(?:id|id number|license|no|number)[\s:#]+([A-Z0-9-]{6,12})/i,
    /dl\.\s+([A-Z0-9]+)/i,  // DL. W9802660
  ],
};
const web3 = new Web3('http://3.15.178.121:8030/rpc/ethrpc');
// NFT Contract Constants
const CONTRACT_ADDRESS = "0x66332e60b24BB4C729A2Be07Ab733C26242A5aAD";

// ✅ Only the mint function ABI
const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "tokenURI",
        "type": "string"
      }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// ✅ Placeholder Token URI - will be replaced with actual metadata
const TOKEN_URI = "ipfs://QmYoursHere/metadata.json";

// Define BlockchainOptions locally since it uses icon components
const BlockchainOptions = [
  {
    id: 1,
    name: 'Ethereum',
    value: 'ethereum',
    icon: <Ethereum />,
  },
  {
    id: 2,
    name: 'Flow',
    value: 'flow',
    icon: <Flow />,
  },
];

export default function CreateNFT() {
  const { address: walletAddress, isConnected, provider, connect } = useWallet();
  
  let [publish, setPublish] = useState(true);
  let [explicit, setExplicit] = useState(false);
  let [unlocked, setUnlocked] = useState(false);
  let [priceType, setPriceType] = useState('fixed');
  let [blockchain, setBlockChain] = useState(BlockchainOptions[0]);
  
  // ID document image state
  let [selectedIdImage, setSelectedIdImage] = useState<string | null>(null);
  let [selectedIdFile, setSelectedIdFile] = useState<File | null>(null);
  
  // Verification selfie image state
  let [selfieImage, setSelfieImage] = useState<string | null>(null);
  let [selfieFile, setSelfieFile] = useState<File | null>(null);
  
  let [extractedInfo, setExtractedInfo] = useState<IDInformation | null>(null);
  let [isLoading, setIsLoading] = useState(false);
  let [progressMessage, setProgressMessage] = useState('');
  let [ocrRawText, setOcrRawText] = useState('');
  let [ocrError, setOcrError] = useState<string | null>(null);
  let [deploymentStage, setDeploymentStage] = useState<string | null>(null);
  let [deploymentComplete, setDeploymentComplete] = useState(false);
  let [animationProgress, setAnimationProgress] = useState(0);
  let [walletConnected, setWalletConnected] = useState(false);
  let [mintStatus, setMintStatus] = useState<string | null>(null);
  let [txHash, setTxHash] = useState<string | null>(null);
  
  // Track creation steps progress
  let [currentStep, setCurrentStep] = useState<CreationStep>(CreationStep.WALLET_CONNECTION);
  let [overallProgress, setOverallProgress] = useState(0);

  let [showCamera, setShowCamera] = useState(false);
  let [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Update step and progress based on current application state
  useEffect(() => {
    if (isConnected) {
      if (currentStep === CreationStep.WALLET_CONNECTION) {
        setCurrentStep(CreationStep.IMAGE_SELECTION);
        setOverallProgress(10);
      }
      setWalletConnected(true);
    } else {
      setCurrentStep(CreationStep.WALLET_CONNECTION);
      setOverallProgress(0);
      setWalletConnected(false);
    }
  }, [isConnected, currentStep]);

  // Update step and progress when image is selected
  useEffect(() => {
    if (selectedIdImage && walletConnected) {
      if (currentStep === CreationStep.IMAGE_SELECTION) {
        setCurrentStep(CreationStep.EXTRACTION);
        setOverallProgress(20);
      }
    } else if (walletConnected) {
      setCurrentStep(CreationStep.IMAGE_SELECTION);
      setOverallProgress(10);
    }
  }, [selectedIdImage, walletConnected, currentStep]);

  // Update step and progress when info is extracted
  useEffect(() => {
    if (extractedInfo && walletConnected) {
      if (currentStep === CreationStep.EXTRACTION) {
        setCurrentStep(CreationStep.VERIFICATION);
        setOverallProgress(40);
      }
    } else if (selectedIdImage && walletConnected) {
      setCurrentStep(CreationStep.EXTRACTION);
      setOverallProgress(20);
    }
  }, [extractedInfo, selectedIdImage, walletConnected, currentStep]);

  // Update step and progress when deployment stage changes
  useEffect(() => {
    if (deploymentStage === 'verifying' && extractedInfo) {
      setCurrentStep(CreationStep.VERIFICATION);
      setOverallProgress(60);
    } else if (deploymentStage === 'minting' && extractedInfo) {
      setCurrentStep(CreationStep.MINTING);
      setOverallProgress(80);
    } else if (deploymentStage === 'finishing' && extractedInfo) {
      setCurrentStep(CreationStep.FINALIZATION);
      setOverallProgress(95);
    } else if (deploymentComplete && extractedInfo) {
      setCurrentStep(CreationStep.COMPLETED);
      setOverallProgress(100);
    }
  }, [deploymentStage, deploymentComplete, extractedInfo]);

  // Initialize camera
  const handleStartCamera = async () => {
    try {
      // First set showCamera to true to ensure video element is rendered
      setShowCamera(true);
      
      // Wait for the video element to be available in the DOM
      await new Promise(resolve => setTimeout(resolve, 100));
      ;
      // Check if video ref is available
      if (!videoRef.current) {
        console.error("Video element not available after rendering");
        throw new Error("Video element not found");
      }
      
      const stream = await startCameraStream();
      setCameraStream(stream);
      
      // Set video source
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log("Video element updated with camera stream");
      } else {
        console.error("Video ref is null after stream initialization");
        throw new Error("Video element not found after getting camera stream");
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      
      // Try to provide more specific error messages
      let errorMessage = "Could not access camera. Please check your browser permissions.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
      
      // Close camera UI if there was an error
      setShowCamera(false);
      
      // Add a fallback option to upload an image instead of using the camera
      handleUploadSelfie();
    }
  };
  
  // Stop camera stream
  const handleStopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    setCameraStream(null);
    setShowCamera(false);
  };
  
  // Capture image from camera
  const handleCaptureImage = async () => {
    
    if (!videoRef.current || !canvasRef.current) {
      console.error("Video or canvas ref is null");
      // alert("Camera capture failed. Please try again or upload a verification photo instead.");
      return;
    }
    
    try {
      // console.log("Attempting to capture image from video element");
      
      if (!videoRef.current.videoWidth || !videoRef.current.videoHeight) {
        console.error("Video dimensions not available. Video might not be ready.");
        // alert("Video stream is not ready yet. Please wait a moment and try again.");
        return;
      }
      
      const file = await captureImageFromVideo(videoRef.current, canvasRef.current);
      
      // Set the selfie file and create URL
      setSelfieFile(file);
      
      // Revoke previous URL if exists
      if (selfieImage) {
        URL.revokeObjectURL(selfieImage);
      }
      
      // Create and set new URL
      const imageUrl = URL.createObjectURL(file);
      setSelfieImage(imageUrl);
      console.log("Selfie image set successfully");
      
      // Close camera
      handleStopCamera();
    } catch (error) {
      console.error("Error capturing image:", error);
      alert("Failed to capture image. Please try again or upload a verification photo instead.");
      
      // Offer manual upload as fallback
      handleUploadSelfie();
    }
  };

  // Handle uploading a selfie manually instead of using the camera
  const handleUploadSelfie = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Revoke previous URL if exists
        if (selfieImage) {
          URL.revokeObjectURL(selfieImage);
        }
        
        const imageUrl = URL.createObjectURL(file);
        setSelfieFile(file);
        setSelfieImage(imageUrl);
      }
    };
    input.click();
  };

  // Reset selfie
  const handleResetSelfie = () => {
    if (selfieImage) {
      URL.revokeObjectURL(selfieImage);
    }
    setSelfieFile(null);
    setSelfieImage(null);
  };

  // Handle ID image selection
  const handleIdImageSelect = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setSelectedIdImage(imageUrl);
    setSelectedIdFile(file);
    setExtractedInfo(null);
    setOcrRawText('');
    setOcrError(null);
  };

  // Reset all images and data
  const handleResetImage = () => {
    if (selectedIdImage) {
      URL.revokeObjectURL(selectedIdImage);
    }
    if (selfieImage) {
      URL.revokeObjectURL(selfieImage);
    }
    setSelectedIdImage(null);
    setSelectedIdFile(null);
    setSelfieImage(null);
    setSelfieFile(null);
    setExtractedInfo(null);
    setOcrRawText('');
    setOcrError(null);
    setDeploymentStage(null);
    setDeploymentComplete(false);
    
    // Reset progress to appropriate step based on wallet connection
    if (walletConnected) {
      setCurrentStep(CreationStep.IMAGE_SELECTION);
      setOverallProgress(10);
    } else {
      setCurrentStep(CreationStep.WALLET_CONNECTION);
      setOverallProgress(0);
    }
  };

  // Extract ID information from the uploaded image
  const handleExtractIDInformation = async () => {
    if (!selectedIdFile || !selectedIdImage || !walletConnected) return;
    
    setIsLoading(true);
    setProgressMessage('Processing image...');
    setOcrError(null);
    
    try {
      // Update progress
      setCurrentStep(CreationStep.EXTRACTION);
      setOverallProgress(25);
      
      setProgressMessage('Uploading image and processing with OCR...');
      
      // Process the ID document through OCR
      const result = await extractIDInformationFromImage(selectedIdFile);
      
      setOcrRawText(result.rawText);
      setExtractedInfo(result.extractedInfo);
      
      // Update progress to completed extraction
      setOverallProgress(40);
    } catch (error) {
      console.error("Error extracting information:", error);
      setOcrError(error instanceof Error ? error.message : 'Unknown error occurred during OCR processing');
      
      // Reset progress
      if (selectedIdImage && walletConnected) {
        setCurrentStep(CreationStep.EXTRACTION);
        setOverallProgress(20);
      }
    } finally {
      setIsLoading(false);
      setProgressMessage('');
    }
  };

  // Deploy DID to blockchain
  const handleDeployDID = async () => {
    if (!walletConnected) {
      alert("Please connect your wallet to deploy your DID");
      return;
    }
    
    // Verify that both ID image and selfie are present
    if (!selectedIdImage || !selfieImage || !extractedInfo) {
      alert("Both ID document and verification selfie are required");
      return;
    }
    
    setDeploymentStage('verifying');
    setDeploymentComplete(false);
    setAnimationProgress(0);
    setMintStatus(null);
    setTxHash(null);
    
    // Update progress
    setCurrentStep(CreationStep.VERIFICATION);
    setOverallProgress(60);
    
    // First stage: Verifying ID
    const verifyingDuration = 3000;
    const verifyingStart = Date.now();
    const verifyingInterval = setInterval(() => {
      const elapsed = Date.now() - verifyingStart;
      const progress = Math.min(elapsed / verifyingDuration * 100, 100);
      setAnimationProgress(progress);
      if (progress >= 100) clearInterval(verifyingInterval);
    }, 50);
    
    await new Promise(resolve => setTimeout(resolve, verifyingDuration));
    clearInterval(verifyingInterval);
    
    // Second stage: Minting
    setDeploymentStage('minting');
    setAnimationProgress(0);
    
    // Update progress
    setCurrentStep(CreationStep.MINTING);
    setOverallProgress(80);
    
    try {
      // Actual minting process
      if (!walletAddress) {
        throw new Error("No wallet connected");
      }
      
      setMintStatus("Preparing transaction...");
      
      // In a real implementation, we would upload both images to IPFS
      // and create metadata with those URLs
      // For demonstration, we're using placeholder data
      const idImageUrl = "ipfs://placeholder-id-image";
      const selfieImageUrl = "ipfs://placeholder-selfie";
      
      // Create metadata for the DID token
      const metadata = createDidMetadata(
        extractedInfo, 
        idImageUrl, 
        selfieImageUrl, 
        walletAddress
      );
      
      setMintStatus("Minting in progress...");
      
      // Use the provider from the useWallet hook directly
     
      
      try {
        //don't remove this line 
        const provideer = new ethers.providers.Web3Provider(window.ethereum);//don't remove this line 
        // const signer = provider.getSigner();
    
        // Mint the token
        
        const { hash } = await mintDidToken(provideer, metadata);
        setMintStatus("Transaction submitted, waiting for confirmation...");
        setTxHash(hash);
       
            const receipt = await web3.eth.getTransactionReceipt(hash);
            if (!receipt) {
              throw new Error('Transaction not mined yet or hash is invalid.');
              
            }
            const mintEventABI = {
              anonymous: false,
              inputs: [
                { indexed: true, name: 'to', type: 'address' },
                { indexed: true, name: 'tokenId', type: 'uint256' },
                { indexed: false, name: 'tokenURI', type: 'string' }
              ],
              name: 'Mint',
              type: 'event'
            };
            
            const mintEventSig = web3.utils.sha3('Mint(address,uint256,string)');
        
            for (const log of receipt.logs) {
              if (log.topics[0] === mintEventSig) {
                const decoded = web3.eth.abi.decodeLog(
                  mintEventABI.inputs,
                  log.data,
                  log.topics.slice(1)
                );
                console.log('✅ Mint event found:\n', decoded);
                
              }
            }
        
            // throw new Error('❌ No Mint event found in this transaction.');
        
          
       
        
        // In a real app, we would wait for transaction confirmation
        setMintStatus("✅ Mint successful!");
        
        // Complete the minting animation
        const remainingTime = 2000; // Give some time to show success message
        const mintingStart = Date.now();
        const mintingInterval = setInterval(() => {
          const elapsed = Date.now() - mintingStart;
          const progress = Math.min(elapsed / remainingTime * 100, 100);
          setAnimationProgress(progress);
          if (progress >= 100) clearInterval(mintingInterval);
        }, 50);
        
        await new Promise(resolve => setTimeout(resolve, remainingTime));
        clearInterval(mintingInterval);
      } catch (err) {
        console.error("Contract interaction error:", err);
        throw err;
      }
      
    } catch (error) {
      console.error("Minting error:", error);
      setMintStatus(`❌ Mint failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      
      // Show error for a moment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Complete the animation anyway to move to the next stage
      setAnimationProgress(100);
    }
    
    // Final stage: Wrapping up
    setDeploymentStage('finishing');
    setAnimationProgress(0);
    
    // Update progress
    setCurrentStep(CreationStep.FINALIZATION);
    setOverallProgress(95);
    
    const finishingDuration = 3000;
    const finishingStart = Date.now();
    const finishingInterval = setInterval(() => {
      const elapsed = Date.now() - finishingStart;
      const progress = Math.min(elapsed / finishingDuration * 100, 100);
      setAnimationProgress(progress);
      if (progress >= 100) clearInterval(finishingInterval);
    }, 50);
    
    await new Promise(resolve => setTimeout(resolve, finishingDuration));
    clearInterval(finishingInterval);
    debugger
    // Complete
    setDeploymentComplete(true);
    
    // Update progress to completed
    setCurrentStep(CreationStep.COMPLETED);
    setOverallProgress(100);
    
    console.log("Deployed DID with information:", extractedInfo);
    console.log("Wallet address:", walletAddress);
    if (txHash) {
      console.log("Transaction hash:", txHash);
    }
  };

  // Cancel deployment process
  const handleCancelDeployment = () => {
    setDeploymentStage(null);
    setDeploymentComplete(false);
    
    // Reset progress to appropriate step
    if (extractedInfo && walletConnected) {
      setCurrentStep(CreationStep.VERIFICATION);
      setOverallProgress(40);
    }
  };

  // File upload functionality with react-dropzone
  const { getRootProps, getInputProps, isDragActive, isDragAccept } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setSelectedIdFile(file);
        setSelectedIdImage(URL.createObjectURL(file));
        setExtractedInfo(null);
        setOcrRawText('');
        setOcrError(null);
      }
    }
  });

  // Clean up any remaining handlers or listeners
  useEffect(() => {
    return () => {
      // Clean up camera stream when component unmounts
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
      
      // Clean up any object URLs we've created
      if (selfieImage) {
        URL.revokeObjectURL(selfieImage);
      }
      if (selectedIdImage) {
        URL.revokeObjectURL(selectedIdImage);
      }
    };
  }, [cameraStream, selfieImage, selectedIdImage]);

  return (
    <>
      {/* Full-screen animation overlay */}
      <DeploymentAnimation 
        deploymentStage={deploymentStage}
        deploymentComplete={deploymentComplete}
        animationProgress={animationProgress}
        onCancel={handleCancelDeployment}
        onReset={handleResetImage}
        mintStatus={mintStatus}
        txHash={txHash}
      />
      
      {/* Camera Capture Component */}
      <CameraCapture 
        showCamera={showCamera}
        cameraStream={cameraStream}
        onCapture={handleCaptureImage}
        onCancel={handleStopCamera}
        videoRef={videoRef}
        canvasRef={canvasRef}
      />
      
      <div className="mx-auto w-full sm:pt-0 lg:px-8 xl:px-10 2xl:px-0">
        <div className="mb-6 grid grid-cols-3 gap-12 sm:mb-10">
          <div className="col-span-3 flex items-center justify-between lg:col-span-2">
            <h2 className="text-lg font-medium uppercase tracking-wider text-gray-900 dark:text-white sm:text-2xl">
              Create Digital Identity
            </h2>
            <div className="flex items-center">
              {!isConnected ? (
                <Button 
                  shape="rounded" 
                  onClick={connect}
                >
                  Connect Wallet
                </Button>
              ) : (
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {walletAddress && `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Progress tracking */}
        <div className="mb-8">
          <CreationProgress 
            currentStep={currentStep}
            overallProgress={overallProgress}
          />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-3">
            {!selectedIdImage ? (
              <IdDocumentUploader
                selectedIdImage={selectedIdImage}
                isLoading={isLoading}
                walletConnected={walletConnected}
                progressMessage={progressMessage}
                ocrError={ocrError}
                onImageSelect={handleIdImageSelect}
                onResetImage={handleResetImage}
                onExtractInfo={handleExtractIDInformation}
              />
            ) : extractedInfo ? (
              <IdInformationDisplay
                extractedInfo={extractedInfo}
                selectedIdImage={selectedIdImage}
                selfieImage={selfieImage}
                walletConnected={walletConnected}
                walletAddress={walletAddress || undefined}
                onStartCamera={handleStartCamera}
                onResetImage={handleResetImage}
                onDeployDID={handleDeployDID}
                onUploadSelfie={handleUploadSelfie}
                onResetSelfie={handleResetSelfie}
              />
            ) : (
              <IdDocumentUploader
                selectedIdImage={selectedIdImage}
                isLoading={isLoading}
                walletConnected={walletConnected}
                progressMessage={progressMessage}
                ocrError={ocrError}
                onImageSelect={handleIdImageSelect}
                onResetImage={handleResetImage}
                onExtractInfo={handleExtractIDInformation}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
