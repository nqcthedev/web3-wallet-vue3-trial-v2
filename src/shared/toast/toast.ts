import type { ToastOptions } from 'vue-toastification';
import {
  getWalletToastMessage,
  WALLET_TOAST_KEYS,
  type WalletToastKey,
} from '@/messages/walletToasts';

/**
 * Shared toast instance that will be initialized after plugin registration
 * This allows us to use toast in Pinia stores (non-component contexts)
 */
let toastInstance: any = null;

/**
 * Initialize toast instance after plugin registration
 * This should be called from main.ts after app.use(Toast, {...})
 * @param toast - The toast instance from useToast() or app.config.globalProperties
 */
export function initToastInstance(toast: any): void {
  toastInstance = toast;
}

/**
 * Get toast instance
 * In Vue 3 with vue-toastification, we need to use useToast() composable
 * However, since this is used in Pinia stores (non-component context),
 * we use a shared instance that's initialized after plugin registration
 */
function getToast() {
  if (!toastInstance) {
    // Return a no-op function to prevent crashes
    return {
      success: () => {},
      error: () => {},
      info: () => {},
      warning: () => {},
    };
  }
  return toastInstance;
}

/**
 * Toast deduplication mechanism
 * Prevents duplicate toasts from appearing within a short time window (2 seconds)
 * This is important for user-action toasts to avoid spam, especially when
 * multiple event handlers might trigger the same toast.
 */
const toastDedupeMap = new Map<string, number>();
const DEDUPE_WINDOW_MS = 2000; // 2 seconds

/**
 * Clear dedupe cache for a key (used for testing or manual cleanup)
 */
function clearDedupeKey(key: string): void {
  toastDedupeMap.delete(key);
}

/**
 * Check if a toast with the given key was shown recently
 * @param key - Deduplication key
 * @returns true if toast was shown recently (within dedupe window)
 */
function wasShownRecently(key: string): boolean {
  const lastShown = toastDedupeMap.get(key);
  if (!lastShown) return false;

  const now = Date.now();
  const timeSinceLastShown = now - lastShown;

  // If within dedupe window, mark as shown recently
  if (timeSinceLastShown < DEDUPE_WINDOW_MS) {
    return true;
  }

  // Clean up old entries
  toastDedupeMap.delete(key);
  return false;
}

/**
 * Mark a toast key as shown (updates timestamp)
 */
function markAsShown(key: string): void {
  toastDedupeMap.set(key, Date.now());
}

/**
 * Show a toast only once within the dedupe window
 * Useful for user-action toasts that should not repeat immediately
 * @param key - Deduplication key (e.g., 'wallet_opening')
 * @param toastFn - Function that displays the toast
 */
export function toastOnce(key: string, toastFn: () => void): void {
  if (wasShownRecently(key)) {
    return; // Skip duplicate within dedupe window
  }

  markAsShown(key);
  toastFn();
}

/**
 * Show success toast with optional address snippet
 * @param messageKeyOrText - Wallet toast key or custom message
 * @param opts - Toast options
 */
export function toastSuccess(
  messageKeyOrText: WalletToastKey | string,
  opts?: ToastOptions
): void {
  // Check if messageKeyOrText is a valid WalletToastKey
  const isWalletKey =
    typeof messageKeyOrText === 'string' &&
    Object.values(WALLET_TOAST_KEYS).includes(
      messageKeyOrText as WalletToastKey
    );

  const message = isWalletKey
    ? getWalletToastMessage(messageKeyOrText as WalletToastKey)
    : messageKeyOrText;

  const toast = getToast();
  toast.success(message, {
    timeout: 3000,
    ...opts,
  });
}

/**
 * Show error toast
 * Used for real wallet connection/disconnection failures
 * @param messageKeyOrText - Wallet toast key or custom message
 * @param opts - Toast options
 */
export function toastError(
  messageKeyOrText: WalletToastKey | string,
  opts?: ToastOptions
): void {
  const isWalletKey =
    typeof messageKeyOrText === 'string' &&
    Object.values(WALLET_TOAST_KEYS).includes(
      messageKeyOrText as WalletToastKey
    );

  const message = isWalletKey
    ? getWalletToastMessage(messageKeyOrText as WalletToastKey)
    : messageKeyOrText;

  const toast = getToast();
  toast.error(message, {
    timeout: 4000,
    ...opts,
  });
}

/**
 * Show info toast
 * Used for user-initiated cancellations or informational messages
 * (Not errors, but user chose to cancel)
 * @param messageKeyOrText - Wallet toast key or custom message
 * @param opts - Toast options
 */
export function toastInfo(
  messageKeyOrText: WalletToastKey | string,
  opts?: ToastOptions
): void {
  const isWalletKey =
    typeof messageKeyOrText === 'string' &&
    Object.values(WALLET_TOAST_KEYS).includes(
      messageKeyOrText as WalletToastKey
    );

  const message = isWalletKey
    ? getWalletToastMessage(messageKeyOrText as WalletToastKey)
    : messageKeyOrText;

  const toast = getToast();
  toast.info(message, {
    timeout: 2500,
    ...opts,
  });
}

// Export dedupe utilities for testing if needed
export { clearDedupeKey, wasShownRecently };
