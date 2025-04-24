import { Mistral } from '@mistralai/mistralai';
import { processOCRResult } from './utils';
import { IDInformation } from './types';

/**
 * Uploads an image to Pinata IPFS and returns the URL
 */
export const uploadImageToPinata = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const pinataResponse = await fetch('/api/pinata', {
    method: 'POST',
    body: formData,
  });
  
  if (!pinataResponse.ok) {
    throw new Error('Failed to upload image to Pinata');
  }
  
  const pinataData = await pinataResponse.json();
  return pinataData.url;
};

/**
 * Performs OCR on an image URL using Mistral AI
 */
export const performOcrWithMistral = async (imageUrl: string): Promise<string> => {
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
    
    return extractedText;
  } else {
    throw new Error('No text was extracted from the image');
  }
};

/**
 * Process an ID document image through the complete OCR pipeline
 */
export const extractIDInformationFromImage = async (file: File): Promise<{
  extractedInfo: IDInformation;
  rawText: string;
}> => {
  // Upload the image to Pinata
  const imageUrl = await uploadImageToPinata(file);
  
  // Perform OCR on the image
  const extractedText = await performOcrWithMistral(imageUrl);
  
  // Process the extracted text to find ID information
  const processedData = processOCRResult(extractedText, file);
  
  return {
    extractedInfo: processedData,
    rawText: extractedText
  };
}; 