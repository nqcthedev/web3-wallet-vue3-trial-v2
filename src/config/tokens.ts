/**
 * Preset token configuration for EVM chains
 * Supports null tokens per chain to test handling of unavailable tokens
 */

export type TokenKey = 'USDC' | 'USDT' | 'DAI' | 'WETH' | 'WMATIC' | 'BUSD';

export interface TokenConfig {
  address: `0x${string}`;
  symbol: TokenKey;
  name: string;
  decimals?: number; // Optional - will fetch from contract if not provided
}

/**
 * Token address map by chainId (decimal)
 * Token may be unavailable per network - set address to null if not available on that chain
 */
export const TOKEN_MAP: Record<number, Partial<Record<TokenKey, TokenConfig | null>>> = {
  // Ethereum Mainnet (1)
  1: {
    USDC: {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    },
    USDT: {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
    },
    DAI: {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      // decimals: undefined - test fetch from contract
    },
    WETH: {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      // decimals: undefined - test fetch from contract
    },
  },
  // Ethereum Sepolia (11155111)
  11155111: {
    USDC: null, // Not configured for Sepolia testnet
    USDT: null,
  },
  // Polygon (137)
  137: {
    USDC: {
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    },
    USDT: {
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
    },
    WMATIC: {
      address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
      symbol: 'WMATIC',
      name: 'Wrapped Matic',
      // decimals: undefined - test fetch from contract
    },
  },
  // BNB Smart Chain (56)
  56: {
    USDT: {
      address: '0x55d398326f99059fF775485246999027B3197955',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 18,
    },
    BUSD: {
      address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      symbol: 'BUSD',
      name: 'Binance USD',
      decimals: 18,
    },
    USDC: null, // Not configured for BNB mainnet
  },
  // BNB Smart Chain Testnet (97)
  97: {
    USDT: {
      address: '0x222D12d538b7FB8B17723322aF40379D51C70372',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 18,
    },
    USDC: {
      address: '0xb32B8625D2708FC7E7041BE4169EB188eeea3c14',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 18,
    },
  },
  // Avalanche (43114)
  43114: {
    USDC: {
      address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    },
    USDT: {
      address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
    },
  },
  // Arbitrum One (42161)
  42161: {
    USDC: {
      address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    },
    USDT: {
      address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
    },
  },
  // Optimism (10)
  10: {
    USDC: {
      address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    },
    USDT: {
      address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
    },
  },
  // Base (8453)
  8453: {
    USDC: {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    },
    USDT: null, // Not configured for Base mainnet
  },
  // Base Sepolia (84532)
  84532: {
    USDC: null, // Not configured for Base Sepolia
    USDT: null,
  },
};

/**
 * Get token address for a specific chainId and token symbol
 * @param symbol - Token symbol (USDC, USDT, etc.)
 * @param chainId - Chain ID (decimal)
 * @returns Token address or null if not available on that chain
 */
export function getTokenAddress(symbol: TokenKey, chainId: number | null): string | null {
  if (!chainId) return null;
  const tokenConfig = TOKEN_MAP[chainId]?.[symbol];
  return tokenConfig?.address ?? null;
}

/**
 * Get full token config for a specific chainId and token symbol
 * @param chainId - Chain ID (decimal)
 * @param symbol - Token symbol (USDC, USDT, etc.)
 * @returns Token config or null if not available on that chain
 */
export function getTokenConfig(chainId: number | null, symbol: TokenKey): TokenConfig | null {
  if (!chainId) return null;
  const tokenConfig = TOKEN_MAP[chainId]?.[symbol];
  return tokenConfig ?? null;
}

/**
 * Legacy interface for backward compatibility
 * @deprecated Use TokenConfig instead
 */
export interface PresetToken {
  symbol: string;
  address: `0x${string}`;
  decimals?: number;
}

/**
 * Get preset tokens for a given chain ID
 * Filters out null tokens and converts to PresetToken format
 * @param chainId - The chain ID to get tokens for
 * @returns Array of preset tokens (null tokens are filtered out), or empty array if chain not supported
 */
export function getPresetTokens(chainId: number): PresetToken[] {
  const chainTokens = TOKEN_MAP[chainId];
  if (!chainTokens) {
    return [];
  }

  // Filter out null tokens and convert to PresetToken format
  return Object.values(chainTokens)
    .filter((token): token is TokenConfig => token !== null)
    .map((token) => ({
      symbol: token.symbol,
      address: token.address,
      decimals: token.decimals,
    }));
}
