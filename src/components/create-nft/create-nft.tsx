'use client';

import { useState } from 'react';
import { Transition } from '@/components/ui/transition';
import { Listbox } from '@/components/ui/listbox';
import Image from '@/components/ui/image';
import Button from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import Input from '@/components/ui/forms/input';
import Textarea from '@/components/ui/forms/textarea';
import InputLabel from '@/components/ui/input-label';
import ToggleBar from '@/components/ui/toggle-bar';
import { ChevronDown } from '@/components/icons/chevron-down';
import { Ethereum } from '@/components/icons/ethereum';
import { Flow } from '@/components/icons/flow';
import { Warning } from '@/components/icons/warning';
import { Unlocked } from '@/components/icons/unlocked';
import Avatar from '@/components/ui/avatar';
import { Mistral } from '@mistralai/mistralai';
import DeploymentAnimation from '@/components/deployment-animation/deployment-animation';

//images
import AuthorImage from '@/assets/images/author.jpg';
import NFT1 from '@/assets/images/nft/nft-1.jpg';
import PriceType from '@/components/create-nft/price-types-props';
import cn from '@/utils/cn';

// ID Information interface
interface IDInformation {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  idNumber: string;
  metadata: {
    fileType: string;
    fileSize: string;
    dimensions?: string;
    created?: string;
  };
  rawText?: string;
}

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

export default function CreateNFT() {
  let [publish, setPublish] = useState(true);
  let [explicit, setExplicit] = useState(false);
  let [unlocked, setUnlocked] = useState(false);
  let [priceType, setPriceType] = useState('fixed');
  let [blockchain, setBlockChain] = useState(BlockchainOptions[0]);
  let [selectedImage, setSelectedImage] = useState<string | null>(null);
  let [selectedFile, setSelectedFile] = useState<File | null>(null);
  let [extractedInfo, setExtractedInfo] = useState<IDInformation | null>(null);
  let [isLoading, setIsLoading] = useState(false);
  let [progressMessage, setProgressMessage] = useState('');
  let [ocrRawText, setOcrRawText] = useState('');
  let [ocrError, setOcrError] = useState<string | null>(null);
  let [deploymentStage, setDeploymentStage] = useState<string | null>(null);
  let [deploymentComplete, setDeploymentComplete] = useState(false);
  let [animationProgress, setAnimationProgress] = useState(0);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setSelectedFile(file);
      setExtractedInfo(null);
      setOcrRawText('');
      setOcrError(null);
    }
  };

  const handleResetImage = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    setSelectedImage(null);
    setSelectedFile(null);
    setExtractedInfo(null);
    setOcrRawText('');
    setOcrError(null);
    setDeploymentStage(null);
    setDeploymentComplete(false);
  };

  const extractMetadata = (file: File) => {
    const metadata = {
      fileType: file.type,
      fileSize: formatFileSize(file.size),
      created: new Date(file.lastModified).toLocaleString(),
    };
    return metadata;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const extractPatternFromText = (text: string, patterns: RegExp[]): string => {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return '';
  };

  const processOCRResult = (text: string): IDInformation => {
    // Extract information using regex patterns
    let fullName = extractPatternFromText(text, ID_PATTERNS.namePatterns) || 'Not detected';
    
    // Special handling for name patterns that capture first and last name separately
    const nameMatch = text.match(/(?:ln|last name)[\s]+([A-Za-z\s.-]+)[\s]+(?:fn|first name)[\s]+([A-Za-z\s.-]+)/i) || 
                     text.match(/(?:fn|first name)[\s]+([A-Za-z\s.-]+)[\s]+(?:ln|last name)[\s]+([A-Za-z\s.-]+)/i);
    
    if (nameMatch && nameMatch[1] && nameMatch[2]) {
      // If we have a match with first and last name separately, combine them
      if (nameMatch[0].toLowerCase().includes('ln')) {
        // Format: LN LastName FN FirstName
        fullName = `${nameMatch[2]} ${nameMatch[1]}`;
      } else {
        // Format: FN FirstName LN LastName
        fullName = `${nameMatch[1]} ${nameMatch[2]}`;
      }
    }
    
    const dateOfBirth = extractPatternFromText(text, ID_PATTERNS.dobPatterns) || 'Not detected';
    const gender = extractPatternFromText(text, ID_PATTERNS.genderPatterns) || 'Not detected';
    const idNumber = extractPatternFromText(text, ID_PATTERNS.idNumberPatterns) || 'Not detected';

    if (!selectedFile) {
      throw new Error("No file selected");
    }

    return {
      fullName,
      dateOfBirth,
      gender,
      idNumber,
      metadata: extractMetadata(selectedFile),
      rawText: text
    };
  };

  const extractIDInformation = async () => {
    if (!selectedFile || !selectedImage) return;
    
    setIsLoading(true);
    setProgressMessage('Processing image...');
    setOcrError(null);
    
    try {
      // Upload the image to Pinata
      setProgressMessage('Uploading image to IPFS via Pinata...');
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const pinataResponse = await fetch('/api/pinata', {
        method: 'POST',
        body: formData,
      });
      
      if (!pinataResponse.ok) {
        throw new Error('Failed to upload image to Pinata');
      }
      
      const pinataData = await pinataResponse.json();
      const imageUrl = pinataData.url;
      
      setProgressMessage('Sending image to Mistral OCR service...');
      
      // Initialize Mistral client
      const apiKey = "immlxcv2yiyweZ74qNNN0xXe4vqY37FE";
      const client = new Mistral({apiKey: apiKey});
      
      // Call the Mistral OCR API
      const ocrResponse = await client.ocr.process({
        model: "mistral-ocr-latest",
        document: {
          type: "image_url",
          imageUrl: imageUrl,
        }
      });
      
      setProgressMessage('Processing OCR results...');
      
      // Extract text from the OCR result based on the actual response format
      const ocrData = ocrResponse as any;
      
      // Check if we have pages with markdown content
      if (ocrData.pages && ocrData.pages.length > 0 && ocrData.pages[0].markdown) {
        // Extract text from markdown format
        const markdownText = ocrData.pages[0].markdown;
        
        // Convert markdown to plain text by removing markdown syntax
        const extractedText = markdownText
          .replace(/#{1,6}\s/g, '') // Remove headers
          .replace(/\*\*/g, '') // Remove bold
          .replace(/\*/g, '') // Remove italic
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace links with text
          .replace(/\n+/g, '\n') // Normalize newlines
          .trim();
        
        setOcrRawText(extractedText);
        
        // Process the extracted text to find ID information
        const processedData = processOCRResult(extractedText);
        setExtractedInfo(processedData);
      } else {
        throw new Error('No text was extracted from the image');
      }
      
    } catch (error) {
      console.error("Error extracting information:", error);
      setOcrError(error instanceof Error ? error.message : 'Unknown error occurred during OCR processing');
    } finally {
      setIsLoading(false);
      setProgressMessage('');
    }
  };

  const handleDeployDID = async () => {
    setDeploymentStage('verifying');
    setDeploymentComplete(false);
    setAnimationProgress(0);
    
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
    
    const mintingDuration = 4000;
    const mintingStart = Date.now();
    const mintingInterval = setInterval(() => {
      const elapsed = Date.now() - mintingStart;
      const progress = Math.min(elapsed / mintingDuration * 100, 100);
      setAnimationProgress(progress);
      if (progress >= 100) clearInterval(mintingInterval);
    }, 50);
    
    await new Promise(resolve => setTimeout(resolve, mintingDuration));
    clearInterval(mintingInterval);
    
    // Final stage: Wrapping up
    setDeploymentStage('finishing');
    setAnimationProgress(0);
    
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
    
    // Complete
    setDeploymentComplete(true);
    console.log("Deploying DID with information:", extractedInfo);
  };

  const handleCancelDeployment = () => {
    setDeploymentStage(null);
    setDeploymentComplete(false);
  };

  return (
    <>
      {/* Full-screen animation overlay */}
      <DeploymentAnimation 
        deploymentStage={deploymentStage}
        deploymentComplete={deploymentComplete}
        animationProgress={animationProgress}
        onCancel={handleCancelDeployment}
        onReset={handleResetImage}
      />
      
      <div className="mx-auto w-full sm:pt-0 lg:px-8 xl:px-10 2xl:px-0">
        <div className="mb-6 grid grid-cols-3 gap-12 sm:mb-10">
          <div className="col-span-3 flex items-center justify-between lg:col-span-2">
            <h2 className="text-lg font-medium uppercase tracking-wider text-gray-900 dark:text-white sm:text-2xl">
              Create Digital Identity
            </h2>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-3">
            {!selectedImage ? (
              <div className="mb-8">
                <InputLabel title="Upload ID Document" important />
                <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                  Upload a driver's license, passport, or other government-issued ID
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-gray-100 file:text-gray-700
                    hover:file:bg-gray-200 dark:file:bg-gray-700 dark:file:text-gray-200
                    dark:hover:file:bg-gray-600"
                />
              </div>
            ) : extractedInfo ? (
              <div className="mb-8">
                <div className="mb-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Extracted ID Information</h3>
                  
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
                    <Button shape="rounded" onClick={handleDeployDID}>
                      Deploy DID
                    </Button>
                    <Button shape="rounded" variant="ghost" onClick={handleResetImage}>
                      Start Over
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8 flex flex-col">
                <InputLabel title="Selected ID Document" />
                <div className="mb-4 w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                  <img 
                    src={selectedImage} 
                    alt="ID Document" 
                    className="w-full object-contain" 
                    style={{ maxHeight: '400px' }}
                  />
                </div>
                {ocrError && (
                  <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                    <p className="text-sm text-red-700 dark:text-red-400">{ocrError}</p>
                  </div>
                )}
                <div className="flex gap-4">
                  <Button 
                    shape="rounded" 
                    onClick={extractIDInformation}
                    disabled={isLoading}
                  >
                    {isLoading ? progressMessage || "Processing..." : "Extract Information"}
                  </Button>
                  <Button shape="rounded" variant="ghost" onClick={handleResetImage}>
                    Reselect Image
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
