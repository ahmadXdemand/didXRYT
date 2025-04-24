import { IDInformation, ID_PATTERNS } from './types';

/**
 * Formats file size from bytes to human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Extracts metadata from a file object
 */
export const extractMetadata = (file: File) => {
  const metadata = {
    fileType: file.type,
    fileSize: formatFileSize(file.size),
    created: new Date(file.lastModified).toLocaleString(),
  };
  return metadata;
};

/**
 * Extracts information based on regex pattern from text
 */
export const extractPatternFromText = (text: string, patterns: RegExp[]): string => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return '';
};

/**
 * Process OCR text result to extract structured ID information
 */
export const processOCRResult = (text: string, selectedIdFile: File): IDInformation => {
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

  if (!selectedIdFile) {
    throw new Error("No file selected");
  }

  return {
    fullName,
    dateOfBirth,
    gender,
    idNumber,
    metadata: extractMetadata(selectedIdFile),
    rawText: text
  };
}; 