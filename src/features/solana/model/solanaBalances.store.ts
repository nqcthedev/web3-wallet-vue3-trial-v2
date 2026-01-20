import { defineStore } from 'pinia';
import { Connection, PublicKey } from '@solana/web3.js';
import { useWalletSessionStore } from '@/features/wallet/model/walletSession.store';
import { getSolanaRpcEndpoint, lamportsToSol } from '@/shared/utils/solana';
import { toastSuccess, toastError } from '@/shared/toast/toast';

export type BalanceStatus = 'idle' | 'loading' | 'success' | 'error';

interface SolanaBalancesState {
  sol: {
    status: BalanceStatus;
    value: string | null;
    errorMessage: string | null;
  };
  lastUpdated: Date | null;
}

export const useSolanaBalancesStore = defineStore('solanaBalances', {
  state: (): SolanaBalancesState => ({
    sol: {
      status: 'idle',
      value: null,
      errorMessage: null,
    },
    lastUpdated: null,
  }),

  actions: {
    reset() {
      this.sol.status = 'idle';
      this.sol.value = null;
      this.sol.errorMessage = null;
      this.lastUpdated = null;
    },

    async fetchSolBalance({ isManual = false }: { isManual?: boolean } = {}) {
      const walletStore = useWalletSessionStore();

      // Guard: Only fetch if connected and Solana chain
      if (
        walletStore.status !== 'connected' ||
        walletStore.chainType !== 'solana' ||
        !walletStore.account ||
        !walletStore.solanaNetwork
      ) {
        this.reset();
        return;
      }

      const account = walletStore.account;
      const network = walletStore.solanaNetwork;

      this.sol.status = 'loading';
      this.sol.errorMessage = null;

      try {
        // Get RPC endpoint for the network
        const rpcEndpoint = getSolanaRpcEndpoint(network);

        // Create Solana connection
        const connection = new Connection(rpcEndpoint, 'confirmed');

        // Validate and create PublicKey from account address
        let publicKey: PublicKey;
        try {
          publicKey = new PublicKey(account);
        } catch (error) {
          throw new Error(`Invalid Solana address: ${account}`);
        }

        // Fetch balance in lamports
        const balanceLamports = await connection.getBalance(publicKey);

        // Convert lamports to SOL string
        this.sol.value = lamportsToSol(balanceLamports);
        this.sol.status = 'success';
        this.lastUpdated = new Date();

        // Show toast for manual refreshes
        if (isManual) {
          toastSuccess('SOL balance updated');
        }
      } catch (error) {
        this.sol.status = 'error';
        this.sol.errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to fetch SOL balance. Please try again.';

        // Show toast for manual refreshes on error
        if (isManual) {
          toastError('Failed to fetch SOL balance');
        }
      }
    },
  },
});
