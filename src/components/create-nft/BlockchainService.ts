import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, TOKEN_URI } from './types';

/**
 * Mint a new DID token as an NFT
 */
export const mintDidToken = async (
  provider: ethers.providers.Web3Provider,
  tokenMetadata?: string
): Promise<{ hash: string }> => {
  try {
    // Use the provider from the useWallet hook
    if (!provider) {
      throw new Error("Provider not available");
    }

    const CONTRACT_ABII = [
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
    
    
    // Create contract instance
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS, 
      CONTRACT_ABII, 
      provider.getSigner()
    );
    
    // Default to placeholder URI if none provided
    const actualTokenURI =  TOKEN_URI;
    
    // Call the mint function
    const tx = await contract.mint(actualTokenURI);
    debugger
    return { hash: tx.hash };
  } catch (error) {
    console.error("Contract interaction error:", error);
    throw error;
  }
};

/**
 * Create metadata for the DID token
 */
export const createDidMetadata = (
  idInfo: any,
  idImageUrl: string,
  selfieImageUrl: string,
  walletAddress: string
) => {
  // In a real application, you would create proper metadata
  // following a standard format like ERC-721 metadata schema
  return JSON.stringify({
    name: `Digital Identity for ${idInfo.fullName}`,
    description: "Digital Identity Document NFT",
    image: selfieImageUrl,
    attributes: [
      {
        trait_type: "Full Name",
        value: idInfo.fullName
      },
      {
        trait_type: "Date of Birth",
        value: idInfo.dateOfBirth
      },
      {
        trait_type: "Gender",
        value: idInfo.gender
      },
      {
        trait_type: "ID Number",
        value: idInfo.idNumber
      },
      {
        trait_type: "Wallet",
        value: walletAddress
      }
    ],
    id_document: idImageUrl
  });
}; 