import { defineStore } from 'pinia';
import { getPublicClient } from '@wagmi/core';
import { getBalance, readContract } from 'viem/actions';
import { getWagmiConfig } from '@/features/wallet/appkit/appkit';
import { useWalletSessionStore } from '@/features/wallet/model/walletSession.store';
import { getPresetTokens } from '@/config/tokens';
import { formatTokenAmount } from '@/shared/utils/format';
import { erc20Abi } from './erc20';
import { toastSuccess, toastError } from '@/shared/toast/toast';

export type BalanceStatus = 'idle' | 'loading' | 'success' | 'error';

interface TokenBalance {
  symbol: string;
  address: string;
  value: string | null;
  status: BalanceStatus;
  error?: string;
}

interface TokenBalancesState {
  status: BalanceStatus;
  native: {
    value: string | null;
  };
  tokens: TokenBalance[];
  lastUpdated: Date | null;
  errorMessage: string | null;
}

export const useTokenBalancesStore = defineStore('tokenBalances', {
  state: (): TokenBalancesState => ({
    status: 'idle',
    native: {
      value: null,
    },
    tokens: [],
    lastUpdated: null,
    errorMessage: null,
  }),

  actions: {
    reset() {
      this.status = 'idle';
      this.native.value = null;
      this.tokens = [];
      this.lastUpdated = null;
      this.errorMessage = null;
    },

    async fetchBalances({ isManual = false }: { isManual?: boolean } = {}) {
      const walletStore = useWalletSessionStore();

      // Guard: Only fetch if connected and EVM chain
      if (
        walletStore.status !== 'connected' ||
        walletStore.chainType !== 'evm' ||
        !walletStore.account ||
        !walletStore.evmChainId
      ) {
        this.reset();
        return;
      }

      const address = walletStore.account as `0x${string}`;
      const chainId = walletStore.evmChainId;

      this.status = 'loading';
      this.errorMessage = null;

      try {
        const wagmiConfig = getWagmiConfig();
        const publicClient = getPublicClient(wagmiConfig, { chainId });

        if (!publicClient) {
          throw new Error('Public client not available for chain');
        }

        // Fetch native balance
        const nativeBalance = await getBalance(publicClient, {
          address,
        });

        // Format native balance (18 decimals for ETH)
        this.native.value = formatTokenAmount(nativeBalance, 18);

        // Fetch preset tokens
        const presetTokens = getPresetTokens(chainId);
        this.tokens = presetTokens.map((token) => ({
          symbol: token.symbol,
          address: token.address,
          value: null,
          status: 'loading' as BalanceStatus,
        }));

        // Fetch ERC-20 balances
        // Use Promise.allSettled to fetch all tokens in parallel, similar to reference implementation
        await Promise.allSettled(
          presetTokens.map(async (token, index) => {
            try {
              // Get decimals from config or fetch from contract
              let decimals = token.decimals;

              // If decimals not in config, fetch both balance and decimals in parallel (like reference)
              if (!decimals) {
                // Fetch balance and decimals in parallel (matching reference implementation)
                const [balanceResult, decimalsResult] = await Promise.all([
                  readContract(publicClient, {
                    address: token.address,
                    abi: erc20Abi,
                    functionName: 'balanceOf',
                    args: [address],
                  }),
                  readContract(publicClient, {
                    address: token.address,
                    abi: erc20Abi,
                    functionName: 'decimals',
                  }),
                ]);

                decimals = Number(decimalsResult);

                // Format balance with max 6 decimals (matching reference implementation)
                const tokenBalance = this.tokens[index];
                if (tokenBalance) {
                  tokenBalance.value = formatTokenAmount(
                    balanceResult as bigint,
                    decimals
                  );
                  tokenBalance.status = 'success';
                }
              } else {
                // Decimals already known, just fetch balance
                const balance = await readContract(publicClient, {
                  address: token.address,
                  abi: erc20Abi,
                  functionName: 'balanceOf',
                  args: [address],
                });

                // Format balance with max 6 decimals (matching reference implementation)
                const tokenBalance = this.tokens[index];
                if (tokenBalance) {
                  tokenBalance.value = formatTokenAmount(
                    balance as bigint,
                    decimals
                  );
                  tokenBalance.status = 'success';
                }
              }
            } catch (error) {
              // Mark individual token as error, but continue with others
              const tokenBalance = this.tokens[index];
              if (tokenBalance) {
                tokenBalance.status = 'error';
               
                tokenBalance.error =
                  error instanceof Error ? error.message : 'Failed to fetch balance';
              }
            }
          })
        );

        this.status = 'success';
        this.lastUpdated = new Date();

        // Show toast for manual refreshes
        if (isManual) {
          toastSuccess('Balances updated');
        }
      } catch (error) {
        this.status = 'error';
        this.errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to fetch balances. Please try again.';

        // Show toast for manual refreshes on error
        if (isManual) {
          toastError('Failed to fetch balances');
        }
      }
    },
  },
});
