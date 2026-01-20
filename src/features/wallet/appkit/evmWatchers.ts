import { getWagmiConfig } from './appkit';
import { useWalletSessionStore } from '../model/walletSession.store';
import { watchAccount, watchChainId } from '@wagmi/core';

let stopWatchers: (() => void) | null = null;
let watchAccountUnwatch: (() => void) | null = null;
let watchChainIdUnwatch: (() => void) | null = null;

export function startEVMWatchers(): () => void {
  if (stopWatchers) {
    return stopWatchers;
  }

  const wagmiConfig = getWagmiConfig();
  const walletStore = useWalletSessionStore();

  // Use Wagmi core watchers instead of Vue composables for better reliability
  // Listen to all account events: connect, disconnect, and change
  watchAccountUnwatch = watchAccount(wagmiConfig, {
    onChange() {
      walletStore.syncFromProviders('event');
    },
  });

  watchChainIdUnwatch = watchChainId(wagmiConfig, {
    onChange() {
      walletStore.syncFromProviders('event');
    },
  });

  // Combined cleanup
  stopWatchers = () => {
    if (watchAccountUnwatch) {
      watchAccountUnwatch();
      watchAccountUnwatch = null;
    }
    if (watchChainIdUnwatch) {
      watchChainIdUnwatch();
      watchChainIdUnwatch = null;
    }
    stopWatchers = null;
  };

  return stopWatchers;
}

export function stopEVMWatchers() {
  if (stopWatchers) {
    stopWatchers();
    stopWatchers = null;
  }
}
