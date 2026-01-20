import { watch, type WatchStopHandle } from 'vue';
import { useWalletSessionStore } from '@/features/wallet/model/walletSession.store';
import { useSolanaBalancesStore } from './solanaBalances.store';

let unwatchAccount: WatchStopHandle | null = null;
let unwatchNetwork: WatchStopHandle | null = null;
let unwatchStatus: WatchStopHandle | null = null;
let unwatchChainType: WatchStopHandle | null = null;

/**
 * Check if we should fetch Solana balances based on wallet state
 */
function shouldFetchSolBalance(
  status: string,
  chainType: string | null,
  account: string | null,
  solanaNetwork: string | null
): boolean {
  return (
    status === 'connected' &&
    chainType === 'solana' &&
    !!account &&
    !!solanaNetwork
  );
}

/**
 * Start watching wallet account, network, status, and chainType changes to auto-fetch Solana balances
 * Should be called from component onMounted
 */
export function startSolanaBalancesWatchers() {
  const walletStore = useWalletSessionStore();
  const solanaBalancesStore = useSolanaBalancesStore();

  // Watch account changes
  unwatchAccount = watch(
    () => walletStore.account,
    () => {
      if (
        shouldFetchSolBalance(
          walletStore.status,
          walletStore.chainType,
          walletStore.account,
          walletStore.solanaNetwork
        )
      ) {
        solanaBalancesStore.fetchSolBalance({ isManual: false });
      } else {
        solanaBalancesStore.reset();
      }
    }
  );

  // Watch Solana network changes
  unwatchNetwork = watch(
    () => walletStore.solanaNetwork,
    () => {
      if (
        shouldFetchSolBalance(
          walletStore.status,
          walletStore.chainType,
          walletStore.account,
          walletStore.solanaNetwork
        )
      ) {
        solanaBalancesStore.fetchSolBalance({ isManual: false });
      } else {
        solanaBalancesStore.reset();
      }
    }
  );

  // Watch status changes (for disconnections)
  unwatchStatus = watch(
    () => walletStore.status,
    () => {
      if (
        shouldFetchSolBalance(
          walletStore.status,
          walletStore.chainType,
          walletStore.account,
          walletStore.solanaNetwork
        )
      ) {
        solanaBalancesStore.fetchSolBalance({ isManual: false });
      } else {
        solanaBalancesStore.reset();
      }
    }
  );

  // Watch chainType changes (for switching from Solana to EVM)
  unwatchChainType = watch(
    () => walletStore.chainType,
    () => {
      if (
        shouldFetchSolBalance(
          walletStore.status,
          walletStore.chainType,
          walletStore.account,
          walletStore.solanaNetwork
        )
      ) {
        solanaBalancesStore.fetchSolBalance({ isManual: false });
      } else {
        solanaBalancesStore.reset();
      }
    }
  );
}

/**
 * Stop watching wallet changes
 * Should be called from component onUnmounted
 */
export function stopSolanaBalancesWatchers() {
  if (unwatchAccount) {
    unwatchAccount();
    unwatchAccount = null;
  }
  if (unwatchNetwork) {
    unwatchNetwork();
    unwatchNetwork = null;
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
