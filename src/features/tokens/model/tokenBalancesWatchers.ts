import { watch, type WatchStopHandle } from 'vue';
import { useWalletSessionStore } from '@/features/wallet/model/walletSession.store';
import { useTokenBalancesStore } from './tokenBalances.store';

let unwatchAccount: WatchStopHandle | null = null;
let unwatchChainId: WatchStopHandle | null = null;
let unwatchStatus: WatchStopHandle | null = null;
let unwatchChainType: WatchStopHandle | null = null;

/**
 * Check if we should fetch balances based on wallet state
 */
function shouldFetchBalances(
  status: string,
  chainType: string | null,
  account: string | null
): boolean {
  return status === 'connected' && chainType === 'evm' && !!account;
}

/**
 * Start watching wallet account, chain, status, and chainType changes to auto-fetch token balances
 * Should be called from component onMounted
 */
export function startTokenBalancesWatchers() {
  const walletStore = useWalletSessionStore();
  const tokenBalancesStore = useTokenBalancesStore();

  // Watch account changes
  unwatchAccount = watch(
    () => walletStore.account,
    () => {
      if (
        shouldFetchBalances(
          walletStore.status,
          walletStore.chainType,
          walletStore.account
        )
      ) {
        tokenBalancesStore.fetchBalances({ isManual: false });
      } else {
        tokenBalancesStore.reset();
      }
    }
  );

  // Watch chain ID changes
  unwatchChainId = watch(
    () => walletStore.evmChainId,
    () => {
      if (
        shouldFetchBalances(
          walletStore.status,
          walletStore.chainType,
          walletStore.account
        )
      ) {
        tokenBalancesStore.fetchBalances({ isManual: false });
      } else {
        tokenBalancesStore.reset();
      }
    }
  );

  // Watch status changes (for disconnections)
  unwatchStatus = watch(
    () => walletStore.status,
    () => {
      if (
        shouldFetchBalances(
          walletStore.status,
          walletStore.chainType,
          walletStore.account
        )
      ) {
        tokenBalancesStore.fetchBalances({ isManual: false });
      } else {
        tokenBalancesStore.reset();
      }
    }
  );

  // Watch chainType changes (for switching from EVM to Solana)
  unwatchChainType = watch(
    () => walletStore.chainType,
    () => {
      if (
        shouldFetchBalances(
          walletStore.status,
          walletStore.chainType,
          walletStore.account
        )
      ) {
        tokenBalancesStore.fetchBalances({ isManual: false });
      } else {
        tokenBalancesStore.reset();
      }
    }
  );
}

/**
 * Stop watching wallet changes
 * Should be called from component onUnmounted
 */
export function stopTokenBalancesWatchers() {
  if (unwatchAccount) {
    unwatchAccount();
    unwatchAccount = null;
  }
  if (unwatchChainId) {
    unwatchChainId();
    unwatchChainId = null;
  }
  if (unwatchStatus) {
    unwatchStatus();
    unwatchStatus = null;
  }
  if (unwatchChainType) {
    unwatchChainType();
    unwatchChainType = null;
  }
}
