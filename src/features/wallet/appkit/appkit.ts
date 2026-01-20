import { createAppKit } from '@reown/appkit/vue';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import {
  mainnet,
  sepolia,
  bsc,
  bscTestnet,
  polygon,
  polygonAmoy,
  avalanche,
  avalancheFuji,
  arbitrum,
  arbitrumSepolia,
  optimism,
  optimismSepolia,
  base,
  baseSepolia,
} from '@reown/appkit/networks';
import {
  mainnet as mainnetWagmi,
  sepolia as sepoliaWagmi,
  bsc as bscWagmi,
  bscTestnet as bscTestnetWagmi,
  polygon as polygonWagmi,
  polygonAmoy as polygonAmoyWagmi,
  avalanche as avalancheWagmi,
  avalancheFuji as avalancheFujiWagmi,
  arbitrum as arbitrumWagmi,
  arbitrumSepolia as arbitrumSepoliaWagmi,
  optimism as optimismWagmi,
  optimismSepolia as optimismSepoliaWagmi,
  base as baseWagmi,
  baseSepolia as baseSepoliaWagmi,
} from 'wagmi/chains';
import { http } from 'wagmi';

let appKitInstance: ReturnType<typeof createAppKit> | null = null;
let wagmiAdapterInstance: WagmiAdapter | null = null;

function getProjectId(): string {
  const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;
  if (!projectId || projectId.trim() === '') {
    throw new Error(
      'Missing VITE_REOWN_PROJECT_ID. Create .env.local based on .env.example'
    );
  }
  return projectId;
}

export function initAppKit() {
  if (appKitInstance) {
    return appKitInstance;
  }

  const projectId = getProjectId();

  // EVM Networks - All popular chains like in wallet extensions
  const evmNetworks = [
    mainnet, // Ethereum Mainnet
    sepolia, // Ethereum Testnet
    bsc, // BSC Mainnet
    bscTestnet, // BSC Testnet
    polygon, // Polygon Mainnet
    polygonAmoy, // Polygon Testnet
    avalanche, // Avalanche Mainnet
    avalancheFuji, // Avalanche Testnet
    arbitrum, // Arbitrum One
    arbitrumSepolia, // Arbitrum Testnet
    optimism, // Optimism Mainnet
    optimismSepolia, // Optimism Testnet
    base, // Base Mainnet
    baseSepolia, // Base Testnet
  ];

  // Wagmi chains for transport configuration
  const wagmiChains = [
    mainnetWagmi,
    sepoliaWagmi,
    bscWagmi,
    bscTestnetWagmi,
    polygonWagmi,
    polygonAmoyWagmi,
    avalancheWagmi,
    avalancheFujiWagmi,
    arbitrumWagmi,
    arbitrumSepoliaWagmi,
    optimismWagmi,
    optimismSepoliaWagmi,
    baseWagmi,
    baseSepoliaWagmi,
  ];

  // EVM Configuration - WagmiAdapter creates wagmiConfig internally
  // Type assertion needed because wagmi chains type may not perfectly match expected type
  wagmiAdapterInstance = new WagmiAdapter({
    networks: evmNetworks,
    projectId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chains: wagmiChains as any,
    transports: Object.fromEntries(
      wagmiChains.map((chain) => [chain.id, http()])
    ),
    multiInjectedProviderDiscovery: true, // Enable automatic wallet detection
  });

  // Solana Configuration - All Solana networks
  // Note: SolanaAdapter constructor may accept networks option but type definition doesn't reflect it
  const solanaAdapter = new SolanaAdapter({
    projectId,
    networks: ['mainnet-beta', 'devnet', 'testnet'],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  // Create AppKit instance with all networks
  // Type assertion needed because evmNetworks type may not perfectly match expected AppKitNetwork array type
  appKitInstance = createAppKit({
    adapters: [wagmiAdapterInstance, solanaAdapter],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    networks: evmNetworks as any, // All EVM networks
    projectId,
    metadata: {
      name: 'Web3 Wallet Trial',
      description: 'Vue 3 + AppKit Wallet Integration',
      url:
        typeof globalThis !== 'undefined' && 'location' in globalThis
          ? globalThis.location.origin
          : '',
      icons: [
        typeof globalThis !== 'undefined' && 'location' in globalThis
          ? `${globalThis.location.origin}/vite.svg`
          : '',
      ],
    },
    features: {
      analytics: true,
      email: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socials: [] as any,
      emailShowWallets: true,
    },
    showWallets: true, // Show installed wallets at the top of modal
  });

  // Sync connectors after AppKit creation to detect installed wallets
  // This ensures AppKit modal shows installed wallets (MetaMask, Phantom, etc.) at the top
  wagmiAdapterInstance.syncConnectors().catch(() => {
    // Ignore sync errors
  });

  return appKitInstance;
}

export function getAppKit() {
  if (!appKitInstance) {
    throw new Error(
      'AppKit not initialized. Call initAppKit() before using getAppKit().'
    );
  }
  return appKitInstance;
}

// Export wagmiConfig for use in main.ts - retrieved from adapter
export function getWagmiConfig() {
  if (!wagmiAdapterInstance) {
    throw new Error('WagmiAdapter not initialized. Call initAppKit() first.');
  }
  return wagmiAdapterInstance.wagmiConfig;
}

// Force sync connectors to refresh wallet state (useful for mobile WalletConnect)
export async function forceSyncConnectors() {
  if (!wagmiAdapterInstance) {
    throw new Error('WagmiAdapter not initialized. Call initAppKit() first.');
  }
  await wagmiAdapterInstance.syncConnectors();
}
