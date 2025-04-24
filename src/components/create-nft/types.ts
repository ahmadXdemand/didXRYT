// ID Information interface
export interface IDInformation {
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

export interface BlockchainOption {
  id: number;
  name: string;
  value: string;
  icon: string;
}

// Common ID patterns for extraction
export const ID_PATTERNS = {
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

// NFT Contract Constants
export const CONTRACT_ADDRESS = "0x66332e60b24BB4C729A2Be07Ab733C26242A5aAD";

// ✅ Only the mint function ABI
export const CONTRACT_ABI = [
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
export const TOKEN_URI = "https://drive.google.com/file/d/1bgB-FTOSPVZaVTse-6U6wwpTpyy9NYph/view?usp=sharing"; 