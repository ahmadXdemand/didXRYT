import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  provider: any;
  connect: () => Promise<void>;
}

export function useWallet() {
  const [walletState, setWalletState] = useState<Omit<WalletState, 'connect'>>({
    address: null,
    isConnected: false,
    provider: null
  });

  const connect = async () => {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Get updated provider and accounts
        const provider = new ethers.providers.Web3Provider(window.ethereum as ethers.providers.ExternalProvider);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          setWalletState({
            address: accounts[0],
            isConnected: true,
            provider
          });
        }
      } catch (err) {
        console.error("Error connecting wallet:", err);
      }
    } else {
      console.warn("Ethereum provider not found");
    }
  };

  useEffect(() => {
    const initWallet = async () => {
      if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum as ethers.providers.ExternalProvider);
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            setWalletState({
              address: accounts[0],
              isConnected: true,
              provider
            });
          }
        } catch (err) {
          console.error("Error initializing wallet:", err);
        }
      }
    };

    initWallet();
    
    // Setup event listeners for account changes
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined' && window.ethereum.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletState(prev => ({
            ...prev,
            address: accounts[0],
            isConnected: true
          }));
        } else {
          setWalletState(prev => ({
            ...prev,
            address: null,
            isConnected: false
          }));
        }
      };
      
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      // Cleanup function
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
    
    return undefined;
  }, []);

  return { ...walletState, connect };
} 