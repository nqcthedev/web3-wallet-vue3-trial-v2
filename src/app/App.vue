<script setup lang="ts">
import { onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import MainLayout from './main-layout.vue';
import WalletDashboard from '@/pages/WalletDashboard.vue';
import { initToastInstance } from '@/shared/toast/toast';

// Initialize toast instance in component context (useToast() requires setup context)
onMounted(() => {
  const toast = useToast();
  initToastInstance(toast);
});
</script>

<template>
  <MainLayout>
    <WalletDashboard />
  </MainLayout>
</template>
