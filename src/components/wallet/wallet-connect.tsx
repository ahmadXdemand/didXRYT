import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Button from '@/components/ui/button';

interface WalletConnectProps {
  onWalletChange: (connected: boolean, address: string | null) => void;
}

export default function WalletConnect({ onWalletChange }: WalletConnectProps) {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
            debugger
        //   const provider = new ethers.providers.Web3Provider(window.ethereum);
        //   const accounts = await provider.listAccounts();
          
        //   if (accounts.length > 0) {
        //     setAccount(accounts[0]);
        //     onWalletChange(true, accounts[0]);
        //   } else {
        //     onWalletChange(false, null);
        //   }
        } catch (err) {
          console.error("Error checking wallet connection:", err);
          onWalletChange(false, null);
        }
      }
    };

    checkConnection();
    
    // Setup event listeners for account changes
    if (typeof window.ethereum !== 'undefined') {
//       window.ethereum.on('accountsChanged', (accounts: string[]) => {
//         if (accounts.length > 0) {
//           setAccount(accounts[0]);
//           onWalletChange(true, accounts[0]);
//         } else {
//           setAccount(null);
//           onWalletChange(false, null);
//         }
//       });
//     }
//   }, [onWalletChange]);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      setIsConnecting(true);
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []); // Popup MetaMask
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        onWalletChange(true, address);
      } catch (err) {
        console.error("User denied wallet connection", err);
        onWalletChange(false, null);
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert("MetaMask not detected. Please install the extension first.");
      onWalletChange(false, null);
    }
  };

  return (
    <Button 
      shape="rounded"
      onClick={connectWallet}
      disabled={isConnecting}
      className="text-sm"
    >
      {isConnecting 
        ? "Connecting..." 
        : account 
          ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` 
          : "Connect Wallet"
      }
    </Button>
  );
} 