<script setup lang="ts">
import { computed, ref } from 'vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import { useWalletSessionStore } from '@/features/wallet/model/walletSession.store';
import { formatAddress } from '@/shared/utils/format';
import { isMobileUA } from '@/shared/utils/device';

const walletStore = useWalletSessionStore();
const isMobile = isMobileUA();
const isRefreshing = ref(false);

const handleConnect = async () => {
  await walletStore.openConnectModal();
};

const handleDisconnect = async () => {
  await walletStore.disconnect();
};

const handleRetry = async () => {
  await walletStore.openConnectModal();
};

const handleRefresh = async () => {
  if (isRefreshing.value) return;

  try {
    isRefreshing.value = true;
    await walletStore.syncFromProviders('manual');

    // Add small delay so user sees feedback
    await new Promise((resolve) => setTimeout(resolve, 300));
  } finally {
    isRefreshing.value = false;
  }
};

const handleSwitchNetwork = async () => {
  await walletStore.switchNetwork();
};

const handleSwitchAccount = async () => {
  await walletStore.switchAccount();
};

const formattedAddress = computed(() => {
  if (!walletStore.account) return '';
  return formatAddress(walletStore.account);
});

const chainInfo = computed(() => {
  if (walletStore.chainType === 'evm') {
    return `Chain ID: ${walletStore.evmChainId}`;
  } else if (walletStore.chainType === 'solana') {
    const networkName = walletStore.solanaNetwork
      ? walletStore.solanaNetwork.replace('-', ' ').replace('beta', 'Beta')
      : '';
    return networkName ? `Network: ${networkName}` : 'Network: Unknown';
  }
  return '';
});

const chainTypeDisplay = computed(() => {
  if (!walletStore.chainType) return '';
  return walletStore.chainType.toUpperCase();
});

const statusBadgeClass = computed(() => {
  switch (walletStore.status) {
    case 'connected':
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    case 'connecting':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'error':
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    default:
      return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  }
});
</script>

<template>
  <Card>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-semibold text-white">Connect Wallet</h2>
        <span
          :class="[
            'rounded-full border px-2.5 py-1 text-xs font-medium uppercase',
            statusBadgeClass,
          ]"
        >
          {{ walletStore.status }}
        </span>
      </div>
    </template>
    <div class="space-y-4">
      <template v-if="walletStore.status === 'connected'">
        <div class="space-y-2 rounded-lg bg-slate-900/50 p-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-400">Chain Type:</span>
            <span
              class="rounded-full bg-blue-500/20 px-2.5 py-1 text-xs font-medium text-blue-300 uppercase"
            >
              {{ chainTypeDisplay }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-400">Address:</span>
            <span class="font-mono text-sm font-medium text-blue-400">
              {{ formattedAddress }}
            </span>
          </div>
          <div v-if="chainInfo" class="flex items-center justify-between">
            <span class="text-sm text-slate-400">Network:</span>
            <span class="text-sm font-medium text-white">{{ chainInfo }}</span>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <Button
            variant="danger"
            @click="handleDisconnect"
            class="min-w-0 flex-1"
          >
            Disconnect
          </Button>
          <Button
            v-if="walletStore.status === 'connected'"
            variant="ghost"
            @click="handleSwitchAccount"
            size="sm"
            class="min-w-0 flex-1"
          >
            👤 Switch Account
          </Button>
          <Button
            v-if="
              walletStore.status === 'connected' &&
              walletStore.chainType === 'evm'
            "
            variant="ghost"
            @click="handleSwitchNetwork"
            size="sm"
            class="min-w-0 flex-1"
          >
            🔀 Switch Network
          </Button>
          <Button
            v-if="isMobile"
            variant="ghost"
            @click="handleRefresh"
            size="sm"
            :loading="isRefreshing"
            class="min-w-0 flex-1"
          >
            {{ isRefreshing ? 'Refreshing...' : '🔄 Refresh' }}
          </Button>
        </div>
        <div
          v-if="isMobile"
          class="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3"
        >
          <p class="text-xs text-yellow-300">
            ⚠️ Mobile Wallet: If you change account/network in MetaMask app, click
            "Refresh" or reload the page to update the UI.
          </p>
        </div>
      </template>

      <template v-else>
        <Button
          @click="handleConnect"
          :disabled="walletStore.status === 'connecting'"
        >
          {{
            walletStore.status === 'connecting' ? 'Connecting...' : 'Connect'
          }}
        </Button>
        <div
          v-if="isMobile"
          class="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3"
        >
          <p class="mb-2 text-xs font-medium text-blue-300">
            📱 Mobile Connection Guide:
          </p>
          <ol class="ml-4 list-decimal space-y-1 text-xs text-blue-200/80">
            <li>Click "Connect" → Modal will open</li>
            <li>
              <strong>Scroll up</strong> to find
              <strong>"WalletConnect"</strong> (has QR Code icon)
            </li>
            <li>
              Or use <strong>"Search Wallet"</strong> to find WalletConnect
            </li>
            <li>Select WalletConnect → <strong>QR Code will display</strong></li>
            <li>Scan QR Code with your wallet app</li>
          </ol>
          <p class="mt-2 text-xs text-yellow-300">
            ⚠️ QR code only displays AFTER selecting wallet, not automatically!
          </p>
        </div>
      </template>

      <div
        v-if="walletStore.lastError"
        class="rounded-lg border border-red-500/30 bg-red-500/20 p-3"
      >
        <p class="mb-2 text-sm text-red-300">{{ walletStore.lastError }}</p>
        <Button variant="ghost" size="sm" @click="handleRetry"> Retry </Button>
      </div>
    </div>
  </Card>
</template>
