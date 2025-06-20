interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request?: (...args: any[]) => Promise<any>;
    on?: (event: string, callback: (...args: any[]) => void) => void;
    removeListener?: (event: string, callback: (...args: any[]) => void) => void;
    send?: (method: string, params?: any[]) => Promise<any>;
    selectedAddress?: string;
    chainId?: string;
    networkVersion?: string;
    enable?: () => Promise<string[]>;
  };
} 