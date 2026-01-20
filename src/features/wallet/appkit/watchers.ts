import { startEVMWatchers, stopEVMWatchers } from './evmWatchers';
import { startSolanaWatchers, stopSolanaWatchers } from './solanaWatchers';
import { getAppKit } from './appkit';
import { useWalletSessionStore } from '../model/walletSession.store';

let isStarted = false;
let cleanupFunctions: (() => void)[] = [];
let appKitUnsubscribe: (() => void) | null = null;

export async function startWalletWatchers() {
  if (isStarted) {
    return;
  }

  // Start EVM watchers
  const evmCleanup = startEVMWatchers();
  cleanupFunctions.push(evmCleanup);

  // Start Solana watchers
  const solanaCleanup = startSolanaWatchers();
  cleanupFunctions.push(solanaCleanup);

  // Subscribe to AppKit account changes (important for mobile wallet account switching)
  const appKit = getAppKit();
  const walletStore = useWalletSessionStore();

  // Subscribe to AppKit state changes to detect account/network changes
  // This is crucial when user switches account in mobile wallet app
  appKitUnsubscribe = appKit.subscribeState((state) => {
    // Sync when accounts or network changes
    // Type assertion needed because AppKit state has dynamic properties
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stateAny = state as any;
    if (stateAny.connected && stateAny.accounts && stateAny.accounts.length > 0) {
      walletStore.syncFromProviders('event');
    }
  });

  // Subscribe to account changes for real-time updates (desktop + mobile)
  appKit.subscribeAccount((accountState) => {
    if (accountState) {
      walletStore.syncFromProviders('event');
    }
  });

  // Subscribe to connections changes (important for WalletConnect mobile)
  // This catches when session updates from mobile wallet
  const unsubscribeConnections = appKit.subscribeConnections(() => {
    walletStore.syncFromProviders('event');
  });
  cleanupFunctions.push(unsubscribeConnections);

  // Listen to window focus/visibility changes (important for mobile)
  // When user switches account in wallet app and comes back, window regains focus
  const handleVisibilityChange = () => {
    const doc =
      typeof globalThis !== 'undefined' && 'document' in globalThis
        ? globalThis.document
        : null;
    if (
      doc &&
      'hidden' in doc &&
      !(doc as { hidden?: boolean }).hidden &&
      walletStore.status === 'connected'
    ) {
      // Delay slightly to allow wallet app to update state
      setTimeout(() => {
        walletStore.syncFromProviders('event');
      }, 500);
    }
  };

  const handleWindowFocus = () => {
    if (walletStore.status === 'connected') {
      setTimeout(() => {
        walletStore.syncFromProviders('event');
      }, 500);
    }
  };

  // Add event listeners for mobile app switching
  if (
    typeof globalThis !== 'undefined' &&
    'window' in globalThis &&
    'document' in globalThis
  ) {
    globalThis.document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );
    globalThis.window.addEventListener('focus', handleWindowFocus);
    cleanupFunctions.push(() => {
      globalThis.document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );
      globalThis.window.removeEventListener('focus', handleWindowFocus);
    });
  }

  isStarted = true;
}

export function stopWalletWatchers() {
  if (!isStarted) {
    return;
  }

  // Unsubscribe from AppKit state
  if (appKitUnsubscribe) {
    appKitUnsubscribe();
    appKitUnsubscribe = null;
  }

  // Call all cleanup functions
  cleanupFunctions.forEach((cleanup) => cleanup());
  cleanupFunctions = [];

  // Also call explicit stop functions
  stopEVMWatchers();
  stopSolanaWatchers();

  isStarted = false;
}
