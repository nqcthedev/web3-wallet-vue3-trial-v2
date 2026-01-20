import { defineStore } from 'pinia';
import {
  getAppKit,
  getWagmiConfig,
  forceSyncConnectors,
} from '../appkit/appkit';
import { getAccount, getChainId, reconnect } from '@wagmi/core';
import {
  toastSuccess,
  toastError,
} from '@/shared/toast/toast';
import {
  WALLET_TOAST_KEYS,
} from '@/messages/walletToasts';
import {
  mapWalletDisconnectError,
} from '../appkit/errorMapper';

export type WalletStatus = 'idle' | 'connecting' | 'connected' | 'error';
export type ChainType = 'evm' | 'solana';
export type WalletSource = 'appkit';

export type SolanaNetwork = 'mainnet-beta' | 'devnet' | 'testnet' | null;

interface WalletSessionState {
  source: WalletSource;
  status: WalletStatus;
  chainType: ChainType | null;
  account: string | null;

  // EVM
  evmChainId: number | null;

  // Solana
  solanaNetwork: SolanaNetwork;

  lastError: string | null;
  epoch: number; // increments on every meaningful change
  lastUpdatedAt: number | null;
  lastConnectedChainType: ChainType | null; // tie-breaker when both connected
}

export const useWalletSessionStore = defineStore('walletSession', {
  state: (): WalletSessionState => ({
    source: 'appkit',
    status: 'idle',
    chainType: null,
    account: null,
    evmChainId: null,
    solanaNetwork: null,
    lastError: null,
    epoch: 0,
    lastUpdatedAt: null,
    lastConnectedChainType: null,
  }),

  actions: {
    async openConnectModal() {
      try {
        this.status = 'connecting';
        this.lastError = null;

        // Open modal without showing toast
        // Toast will only be shown after successful connection
        const appKit = getAppKit();

        await appKit.open();

        // Wait a bit for modal to close and state to sync
        await new Promise((resolve) => setTimeout(resolve, 500));
        await this.syncFromProviders('connect');

        // No toast needed - AppKit modal provides all feedback
        // Connection success/failure is handled by the modal itself
      } catch (error) {
        this.status = 'error';
        this.lastError =
          error instanceof Error ? error.message : 'Connection failed';

        // No toast on error - AppKit modal handles error display
      }
    },

    async disconnect() {
      try {
        const appKit = getAppKit();
        await appKit.disconnect();

        this.resetSession();

        // Show success toast when user explicitly disconnects
        toastSuccess(WALLET_TOAST_KEYS.WALLET_DISCONNECTED);
      } catch (error) {
        this.status = 'error';
        this.lastError =
          error instanceof Error ? error.message : 'Disconnect failed';

        // Map disconnection error (typically real failures, rarely cancellations)
        const mappedError = mapWalletDisconnectError(error);
        toastError(mappedError.messageKey);
      }
    },

    async switchAccount() {
      try {
        this.lastError = null;

        const appKit = getAppKit();

        // Open AppKit modal - AppKit will automatically show option to switch account
        // When connected, user can click on account to switch
        await appKit.open();

        // Wait for modal to close and sync state
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Sync state after account switch
        await this.syncFromProviders('event');
      } catch (error) {
        this.status = 'error';
        this.lastError =
          error instanceof Error ? error.message : 'Failed to switch account';

      }
    },

    async switchNetwork() {
      try {
        this.lastError = null;

        const appKit = getAppKit();
        const wagmiConfig = getWagmiConfig();


        // Subscribe to modal state to detect when modal closes
        let modalClosed = false;
        const unsubscribeModal = appKit.subscribeState((state) => {
          // Modal closes when open === false
          if (!state.open && !modalClosed) {
            modalClosed = true;
          }
        });

        // Open AppKit modal with Networks view to let user select network
        await appKit.open({ view: 'Networks' });

        // Wait for modal to close (user has selected network or closed modal)
        // Poll to check modal state, timeout after 30 seconds
        const startTime = Date.now();
        while (!modalClosed && Date.now() - startTime < 30000) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Unsubscribe modal state
        unsubscribeModal();

        // Wait additional time for network switch to complete (especially important for mobile)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Force sync state with logic similar to manual refresh
        try {
          // Force sync connectors
          await forceSyncConnectors();

          // Wait for state to sync
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Reconnect to force refresh state from provider
          const currentAccount = getAccount(wagmiConfig);
          if (currentAccount.isConnected) {
            try {
              await reconnect(wagmiConfig);
            } catch {
              // Ignore reconnect errors
            }
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        } catch {
          // Ignore sync errors
        }

        // Sync state after network switch
        await this.syncFromProviders('event');

        // Poll one more time to ensure state is updated
        await new Promise((resolve) => setTimeout(resolve, 500));
        await this.syncFromProviders('event');

        // Ensure status is still connected (not disconnected)
        if (this.status !== 'connected' || !this.account) {
          // If disconnected, try to reconnect
          await this.syncFromProviders('event');
        }
      } catch (error) {
        this.status = 'error';
        this.lastError =
          error instanceof Error ? error.message : 'Failed to switch network';

      }
    },

    async syncFromProviders(reason: 'init' | 'connect' | 'event' | 'manual') {
      try {
        const appKit = getAppKit();
        // Type assertion needed because AppKit state has dynamic properties not fully typed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let session = appKit.getState() as any;

        const wagmiConfig = getWagmiConfig();

        // For manual refresh (especially after returning from mobile app),
        // try multiple approaches to force refresh state
        if (reason === 'manual') {
          try {
            // Step 1: Force sync connectors
            await forceSyncConnectors();

            // Step 2: If connected, try to reconnect to refresh state
            const currentAccount = getAccount(wagmiConfig);
            if (currentAccount.isConnected && currentAccount.connector) {
              try {
                // Reconnect will force provider to refresh state from WalletConnect session
                // Note: reconnect() doesn't need parameters, will automatically reconnect active connector
                await reconnect(wagmiConfig);
              } catch {
                // Reconnect may fail if already connected - that's okay
              }
            }

            // Step 3: Wait for state to sync
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Step 4: Re-read all states
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            session = appKit.getState() as any;
          } catch {
            // Continue anyway - might still work with current state
          }
        }

        // Read AppKit state (more reliable for WalletConnect mobile)
        // session is PublicStateControllerState - access properties directly

        // Read EVM accounts from AppKit state (more reliable for mobile)
        // Note: session.accounts might be empty array initially, but WalletConnect
        // should populate it after force sync and delay
        const appKitAccounts = session.accounts || [];
        const appKitEVMAccount = appKitAccounts.find(
          (acc: string | { address?: string; chainId?: string }) => {
            if (typeof acc === 'string') {
              return acc.startsWith('0x'); // EVM address
            }
            // Check if it's an EVM account based on chainId or address format
            const addr = acc.address || '';
            return addr.startsWith('0x');
          }
        );

        // Also read from Wagmi - this should be fresh after reconnect
        const evmAccountState = getAccount(wagmiConfig);
        const evmChainIdValue = getChainId(wagmiConfig);

        // Prefer Wagmi account if connected (more reliable after reconnect)
        // Fallback to AppKit account if Wagmi doesn't have it
        let evmAccount: string | null = null;
        if (evmAccountState.isConnected && evmAccountState.address) {
          evmAccount = evmAccountState.address;
        } else if (appKitEVMAccount) {
          evmAccount =
            typeof appKitEVMAccount === 'string'
              ? appKitEVMAccount
              : appKitEVMAccount.address || null;
        }

        const evmConnected =
          !!evmAccount ||
          (evmAccountState.isConnected && !!evmAccountState.address);

        // Read Solana state from AppKit
        const selectedNetworkId = session.selectedNetworkId || '';
        const isSolanaNetworkSelected = selectedNetworkId.startsWith('solana:');

        // Filter Solana accounts (base58 addresses, not EVM 0x addresses)
        const allAccounts = session.accounts || [];
        const solanaAccounts = allAccounts.filter((acc: string | { address?: string }) => {
          const address = typeof acc === 'string' ? acc : acc?.address || '';
          // Solana addresses are base58 encoded (typically 32-44 chars), not starting with '0x'
          return address && !address.startsWith('0x') && address.length >= 32;
        });

        // Determine if Solana is connected
        const isSolanaConnected =
          isSolanaNetworkSelected && solanaAccounts.length > 0;
        const solanaAccount = isSolanaConnected
          ? typeof solanaAccounts[0] === 'string'
            ? solanaAccounts[0]
            : solanaAccounts[0]?.address || null
          : null;



        let solanaNetworkValue: SolanaNetwork = null;
        if (isSolanaConnected && selectedNetworkId) {
          if (selectedNetworkId.includes('devnet')) {
            solanaNetworkValue = 'devnet';
          } else if (selectedNetworkId.includes('testnet')) {
            solanaNetworkValue = 'testnet';
          } else {
            solanaNetworkValue = 'mainnet-beta';
          }
        }

        // Determine active chainType
        let activeChainType: ChainType | null = null;

        if (evmConnected && isSolanaConnected) {
          // Both connected - use lastConnectedChainType as tie-breaker
          activeChainType = this.lastConnectedChainType || 'evm';
        } else if (evmConnected) {
          activeChainType = 'evm';
        } else if (isSolanaConnected) {
          activeChainType = 'solana';
        }

        // Get the new account address for comparison
        const newAccount =
          activeChainType === 'evm'
            ? evmAccount
            : activeChainType === 'solana'
              ? typeof solanaAccount === 'string'
                ? solanaAccount
                : solanaAccount?.address || null
              : null;

        // Check if state changed - explicitly compare account addresses
        const accountChanged =
          this.account !== newAccount &&
          // Only consider it changed if both are non-null (actual account switch)
          // or if one is null and other is not (connect/disconnect)
          (this.account !== null || newAccount !== null);

        const stateChanged =
          this.chainType !== activeChainType ||
          accountChanged ||
          this.evmChainId !== evmChainIdValue ||
          this.solanaNetwork !== solanaNetworkValue ||
          this.status !== (activeChainType ? 'connected' : 'idle');


        if (stateChanged) {
          this.chainType = activeChainType;

          if (activeChainType === 'evm') {
            this.account = evmAccount;
            this.evmChainId = evmChainIdValue;
            this.solanaNetwork = null;
            if (evmConnected) {
              this.lastConnectedChainType = 'evm';
            }
          } else if (activeChainType === 'solana') {
            this.account =
              typeof solanaAccount === 'string'
                ? solanaAccount
                : solanaAccount?.address || null;
            this.solanaNetwork = solanaNetworkValue;
            this.evmChainId = null;
            if (isSolanaConnected) {
              this.lastConnectedChainType = 'solana';
            }
          } else {
            // Not connected
            this.account = null;
            this.evmChainId = null;
            this.solanaNetwork = null;
          }

          this.status = activeChainType ? 'connected' : 'idle';
          this.lastUpdatedAt = Date.now();

          // Bump epoch on meaningful changes
          if (reason !== 'init' || this.epoch === 0) {
            this.bumpEpoch();
          }
        }
      } catch (error) {
        this.status = 'error';
        this.lastError =
          error instanceof Error ? error.message : 'Failed to sync state';
      }
    },

    resetSession() {
      this.status = 'idle';
      this.chainType = null;
      this.account = null;
      this.evmChainId = null;
      this.solanaNetwork = null;
      this.lastError = null;
      this.lastUpdatedAt = Date.now();
      this.bumpEpoch();
    },

    bumpEpoch() {
      this.epoch += 1;
    },
  },
});
