<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import { useSolanaBalancesStore } from '../model/solanaBalances.store';
import {
  startSolanaBalancesWatchers,
  stopSolanaBalancesWatchers,
} from '../model/solanaBalancesWatchers';
import { useWalletSessionStore } from '@/features/wallet/model/walletSession.store';
import { formatAddress } from '@/shared/utils/format';
import { getSolanaNetworkName } from '@/shared/utils/solana';

const walletStore = useWalletSessionStore();
const solanaBalancesStore = useSolanaBalancesStore();

// Start watchers on mount, stop on unmount
onMounted(() => {
  startSolanaBalancesWatchers();
  // Initial fetch if connected
  if (walletStore.status === 'connected' && walletStore.chainType === 'solana') {
    solanaBalancesStore.fetchSolBalance({ isManual: false });
  }
});

onUnmounted(() => {
  stopSolanaBalancesWatchers();
});

const handleRefresh = async () => {
  await solanaBalancesStore.fetchSolBalance({ isManual: true });
};

const handleRetry = async () => {
  await solanaBalancesStore.fetchSolBalance({ isManual: true });
};

const networkName = computed(() => {
  if (!walletStore.solanaNetwork) return '';
  return getSolanaNetworkName(walletStore.solanaNetwork);
});

const subtitle = computed(() => {
  const network = networkName.value;
  const address = walletStore.account ? formatAddress(walletStore.account) : '';
  if (!network && !address) return '';
  if (!network) return address;
  if (!address) return network;
  return `${network} • ${address}`;
});

const isLoading = computed(() => solanaBalancesStore.sol.status === 'loading');
</script>

<template>
  <Card>
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-white">Solana Balances</h2>
          <p v-if="subtitle" class="mt-1 text-sm text-slate-400">
            {{ subtitle }}
          </p>
        </div>
        <Button
          :disabled="isLoading"
          :loading="isLoading"
          size="sm"
          @click="handleRefresh"
        >
          Refresh
        </Button>
      </div>
    </template>

    <div class="space-y-4">
      <!-- Error Banner -->
      <div
        v-if="solanaBalancesStore.sol.status === 'error'"
        class="rounded-lg border border-red-500/30 bg-red-500/10 p-3"
      >
        <div class="flex items-center justify-between">
          <p class="text-sm text-red-300">
            {{ solanaBalancesStore.sol.errorMessage || 'Failed to fetch SOL balance' }}
          </p>
          <Button
            variant="ghost"
            size="sm"
            @click="handleRetry"
          >
            Retry
          </Button>
        </div>
      </div>

      <!-- SOL Balance -->
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-slate-300">SOL Balance</span>
        <span
          v-if="isLoading"
          class="h-5 w-20 animate-pulse rounded bg-slate-700"
        ></span>
        <span
          v-else-if="solanaBalancesStore.sol.status === 'error'"
          class="text-sm text-slate-400"
        >
          N/A
        </span>
        <span
          v-else-if="solanaBalancesStore.sol.value !== null"
          class="text-sm text-white"
        >
          {{ solanaBalancesStore.sol.value }}
        </span>
        <span v-else class="text-sm text-slate-500">—</span>
      </div>

      <!-- Last Updated -->
      <div
        v-if="solanaBalancesStore.lastUpdated"
        class="pt-2 text-xs text-slate-500"
      >
        Updated: {{ solanaBalancesStore.lastUpdated.toLocaleTimeString() }}
      </div>
    </div>
  </Card>
</template>
