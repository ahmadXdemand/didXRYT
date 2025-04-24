import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { arbitrum, mainnet } from '@reown/appkit/networks';

// Set a valid project ID from WalletConnect dashboard
// You can get one at https://cloud.walletconnect.com/
export const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID'; // Replace this with your actual project ID

export const wagmiMetaData = {
  name: 'Criptic DApp',
  description: 'Criptic Web3 DApp',
  url: 'https://criptic.example.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

// Configure the adapter to use only injected providers (MetaMask) and disable WalletConnect
export const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet, arbitrum],
  options: {
    // Disable WalletConnect completely
    walletConnectOptions: null,
    // Only use injected providers like MetaMask
    connectorsOptions: {
      // Include only injected connector
      includeConnectors: ['injected'],
      // Explicitly exclude WalletConnect connectors
      excludeConnectors: ['walletConnect', 'coinbaseWallet', 'safe'],
    }
  }
});
