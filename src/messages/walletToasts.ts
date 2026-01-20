/**
 * Wallet toast message registry
 * Centralized message strings for wallet-related toast notifications
 */

export const WALLET_TOAST_KEYS = {
  WALLET_CONNECTING: 'WALLET_CONNECTING',
  WALLET_CONNECTED: 'WALLET_CONNECTED',
  WALLET_CONNECT_CANCELLED: 'WALLET_CONNECT_CANCELLED',
  WALLET_DISCONNECTED: 'WALLET_DISCONNECTED',
  WALLET_CONNECT_FAILED: 'WALLET_CONNECT_FAILED',
  WALLET_DISCONNECT_FAILED: 'WALLET_DISCONNECT_FAILED',
} as const;

export type WalletToastKey =
  (typeof WALLET_TOAST_KEYS)[keyof typeof WALLET_TOAST_KEYS];

/**
 * Get wallet toast message by key
 * @param key - Toast message key
 * @returns Formatted message string
 */
export function getWalletToastMessage(key: WalletToastKey): string {
  const messages: Record<WalletToastKey, string> = {
    WALLET_CONNECTING: 'Opening wallet…',
    WALLET_CONNECTED: 'Wallet connected',
    WALLET_CONNECT_CANCELLED: 'Connection cancelled',
    WALLET_DISCONNECTED: 'Wallet disconnected',
    WALLET_CONNECT_FAILED: 'Failed to connect wallet. Please try again.',
    WALLET_DISCONNECT_FAILED: 'Failed to disconnect wallet. Please try again.',
  };

  return messages[key];
}
