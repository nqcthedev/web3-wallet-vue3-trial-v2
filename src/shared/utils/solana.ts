/**
 * Solana utility functions
 */

import type { SolanaNetwork } from '@/features/wallet/model/walletSession.store';

/**
 * Get RPC endpoint URL for a Solana network
 * @param network - Solana network identifier
 * @returns RPC endpoint URL string
 */
export function getSolanaRpcEndpoint(network: SolanaNetwork): string {
  switch (network) {
    case 'mainnet-beta':
      return 'https://api.mainnet-beta.solana.com';
    case 'devnet':
      return 'https://api.devnet.solana.com';
    case 'testnet':
      return 'https://api.testnet.solana.com';
    default:
      // Default to mainnet if network is null or unknown
      return 'https://api.mainnet-beta.solana.com';
  }
}

/**
 * Convert lamports to SOL string
 * Similar to formatTokenAmount for EVM tokens: max 6 decimals, trim trailing zeros
 * @param lamports - Balance in lamports (1 SOL = 1,000,000,000 lamports)
 * @returns Formatted SOL string (e.g., "1234.567890" or "0")
 */
export function lamportsToSol(lamports: number | bigint): string {
  const lamportsBigInt = typeof lamports === 'bigint' ? lamports : BigInt(lamports);
  const LAMPORTS_PER_SOL = 1_000_000_000n;

  if (lamportsBigInt === 0n) return '0';

  // Convert lamports to SOL with 9 decimal places
  const wholePart = lamportsBigInt / LAMPORTS_PER_SOL;
  const fractionalPart = lamportsBigInt % LAMPORTS_PER_SOL;

  // Format fractional part with leading zeros if needed
  const fractionalStr = fractionalPart.toString().padStart(9, '0');

  // Take up to 6 decimals (or less if needed)
  const maxDecimals = Math.min(6, 9);
  let fractionalDisplay = fractionalStr.slice(0, maxDecimals);

  // Trim trailing zeros
  fractionalDisplay = fractionalDisplay.replace(/0+$/, '');

  // Return formatted string
  if (fractionalDisplay === '') {
    return wholePart.toString();
  }

  return `${wholePart.toString()}.${fractionalDisplay}`;
}

/**
 * Get human-readable network name for Solana
 * @param network - Solana network identifier
 * @returns Human-readable network name or empty string
 */
export function getSolanaNetworkName(network: SolanaNetwork): string {
  switch (network) {
    case 'mainnet-beta':
      return 'Mainnet';
    case 'devnet':
      return 'Devnet';
    case 'testnet':
      return 'Testnet';
    default:
      return '';
  }
}
