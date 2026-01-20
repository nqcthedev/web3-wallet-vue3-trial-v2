<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import { useTokenBalancesStore } from '../model/tokenBalances.store';
import { startTokenBalancesWatchers, stopTokenBalancesWatchers } from '../model/tokenBalancesWatchers';
import { useWalletSessionStore } from '@/features/wallet/model/walletSession.store';
import { getChainName } from '@/config/chains';
import { formatAddress } from '@/shared/utils/format';

const walletStore = useWalletSessionStore();
const tokenBalancesStore = useTokenBalancesStore();

// Start watchers on mount, stop on unmount
onMounted(() => {
  startTokenBalancesWatchers();
  // Initial fetch if connected
  if (walletStore.status === 'connected' && walletStore.chainType === 'evm') {
    tokenBalancesStore.fetchBalances({ isManual: false });
  }
});

onUnmounted(() => {
  stopTokenBalancesWatchers();
});

const handleRefresh = async () => {
  await tokenBalancesStore.fetchBalances({ isManual: true });
};

const handleRetry = async () => {
  await tokenBalancesStore.fetchBalances({ isManual: true });
};

const chainName = computed(() => {
  if (!walletStore.evmChainId) return '';
  return getChainName(walletStore.evmChainId);
});

const subtitle = computed(() => {
  const chain = chainName.value;
  const address = walletStore.account
    ? formatAddress(walletStore.account)
    : '';
  if (!chain && !address) return '';
  if (!chain) return address;
  if (!address) return chain;
  return `${chain} • ${address}`;
});

const isLoading = computed(() => tokenBalancesStore.status === 'loading');
</script>

<template>
  <Card>
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-white">EVM Balances</h2>
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
        v-if="tokenBalancesStore.status === 'error'"
        class="rounded-lg border border-red-500/30 bg-red-500/10 p-3"
      >
        <div class="flex items-center justify-between">
          <p class="text-sm text-red-300">
            {{ tokenBalancesStore.errorMessage || 'Failed to fetch balances' }}
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

      <!-- Native Balance -->
      <div class="flex items-center justify-between border-b border-slate-700/50 pb-3">
        <span class="text-sm font-medium text-slate-300">Native</span>
        <span
          v-if="isLoading"
          class="h-5 w-20 animate-pulse rounded bg-slate-700"
        ></span>
        <span v-else-if="tokenBalancesStore.status === 'error'" class="text-sm text-slate-400">
          N/A
        </span>
        <span
          v-else-if="tokenBalancesStore.native.value !== null"
          class="text-sm text-white"
        >
          {{ tokenBalancesStore.native.value }}
        </span>
        <span v-else class="text-sm text-slate-500">—</span>
      </div>

      <!-- ERC-20 Tokens -->
      <div v-if="tokenBalancesStore.tokens.length === 0" class="text-center text-sm text-slate-400">
        No preset tokens configured for this network yet.
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="(token, index) in tokenBalancesStore.tokens"
          :key="token.address"
          class="flex items-center justify-between"
        >
          <span class="text-sm font-medium text-slate-300">
            {{ token.symbol }}
          </span>
          <div class="flex items-center gap-2">
            <span
              v-if="token.status === 'loading'"
              class="h-5 w-20 animate-pulse rounded bg-slate-700"
            ></span>
            <span
              v-else-if="token.status === 'success' && token.value !== null"
              class="text-sm text-white"
            >
              {{ token.value }}
            </span>
            <span
              v-else-if="token.status === 'error'"
              class="text-sm text-slate-400"
              :title="token.error"
            >
              N/A
            </span>
            <span v-else class="text-sm text-slate-500">—</span>
          </div>
        </div>
      </div>

      <!-- Last Updated -->
      <div
        v-if="tokenBalancesStore.lastUpdated"
        class="pt-2 text-xs text-slate-500"
      >
        Updated: {{ tokenBalancesStore.lastUpdated.toLocaleTimeString() }}
      </div>
    </div>
  </Card>
</template>
