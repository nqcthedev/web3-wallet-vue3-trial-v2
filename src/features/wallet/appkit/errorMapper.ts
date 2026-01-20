/**
 * Wallet error mapper
 * Maps wallet connection/disconnection errors to user-friendly messages
 * Distinguishes between user cancellations (info) and real failures (error)
 */

export type WalletErrorType = 'cancelled' | 'error';

export interface MappedWalletError {
  type: WalletErrorType;
  messageKey: string;
}

/**
 * Map wallet connection/disconnection error to appropriate toast type and message
 * User cancellations should show as info (not scary red), real failures as error
 * @param err - Error object from wallet operation
 * @returns Mapped error with type and message key
 */
export function mapWalletConnectError(err: unknown): MappedWalletError {
  // Convert error to string for pattern matching
  const errorMessage =
    err instanceof Error
      ? err.message.toLowerCase()
      : String(err).toLowerCase();

  // Common cancellation patterns
  // User actively rejected or closed the connection modal
  const cancellationPatterns = [
    'user rejected',
    'user rejected request',
    'user cancelled',
    'user denied',
    'cancelled',
    'rejected',
    'denied',
    'closed',
    'modal closed',
    'connection cancelled',
    'user closed',
    '4001', // MetaMask user rejection error code
    'user_rejected',
  ];

  // Check if error matches cancellation pattern
  const isCancelled = cancellationPatterns.some((pattern) =>
    errorMessage.includes(pattern)
  );

  if (isCancelled) {
    return {
      type: 'cancelled',
      messageKey: 'WALLET_CONNECT_CANCELLED',
    };
  }

  // All other errors are treated as real failures
  return {
    type: 'error',
    messageKey: 'WALLET_CONNECT_FAILED',
  };
}

/**
 * Map wallet disconnection error to appropriate toast type and message
 * @param err - Error object from wallet disconnection
 * @returns Mapped error with type and message key
 */
export function mapWalletDisconnectError(err: unknown): MappedWalletError {
  // Disconnection errors are typically real failures (rarely user cancellation)
  return {
    type: 'error',
    messageKey: 'WALLET_DISCONNECT_FAILED',
  };
}
