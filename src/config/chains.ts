/**
 * Chain configuration for EVM networks
 * Maps chain IDs to human-readable names
 */

export type EvmChainId = number;

/**
 * Get human-readable name for a given chain ID
 * @param chainId - The chain ID to look up
 * @returns The chain name or "Unknown Chain" if not found
 */
export function getChainName(chainId: number): string {
  const chainMap: Record<number, string> = {
    1: 'Ethereum Mainnet',
    5: 'Sepolia',
    56: 'BNB Smart Chain',
    97: 'BNB Smart Chain Testnet',
    137: 'Polygon',
    80001: 'Polygon Amoy',
    43114: 'Avalanche',
    43113: 'Avalanche Fuji',
    42161: 'Arbitrum One',
    421614: 'Arbitrum Sepolia',
    10: 'Optimism',
    11155420: 'Optimism Sepolia',
    8453: 'Base',
    84532: 'Base Sepolia',
  };

  return chainMap[chainId] || 'Unknown Chain';
}
