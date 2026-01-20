<script setup lang="ts">
import { computed } from 'vue';
import WalletConnectCard from '@/features/wallet/ui/WalletConnectCard.vue';
import TokenBalancesCard from '@/features/tokens/ui/TokenBalancesCard.vue';
import PhantomBalancesCard from '@/features/solana/ui/PhantomBalancesCard.vue';
import { useWalletSessionStore } from '@/features/wallet/model/walletSession.store';

const walletStore = useWalletSessionStore();

// Computed property for conditional rendering
const shouldShowDashboard = computed(() => {
  return walletStore.status === 'connected' && walletStore.chainType !== null;
});

const chainType = computed(() => walletStore.chainType);
</script>

<template>
  <div class="space-y-6">
    <!-- Wallet Connect Card -->
    <WalletConnectCard />

    <!-- Conditional Dashboard Section -->
    <div v-if="!shouldShowDashboard" class="text-center text-sm text-slate-400">
      Connect a wallet to continue.
    </div>

    <div v-else>
      <!-- EVM Section -->
      <TokenBalancesCard v-if="chainType === 'evm'" />

      <!-- Solana Section -->
      <PhantomBalancesCard v-else-if="chainType === 'solana'" />

      <!-- Fallback for unsupported chain types -->
      <div v-else class="text-center text-sm text-slate-400">
        Unsupported chain type.
      </div>
    </div>
  </div>
</template>
