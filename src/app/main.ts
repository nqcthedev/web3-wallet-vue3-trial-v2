import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';
import { WagmiPlugin } from '@wagmi/vue';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import App from './App.vue';
import '@/shared/styles/main.css';
import { initAppKit, getWagmiConfig } from '@/features/wallet/appkit/appkit';
import { startWalletWatchers } from '@/features/wallet/appkit/watchers';
import { useWalletSessionStore } from '@/features/wallet/model/walletSession.store';
import { initToastInstance } from '@/shared/toast/toast';

// Initialize AppKit before creating the app
initAppKit();
const wagmiConfig = getWagmiConfig();

// Create Vue Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(VueQueryPlugin, { queryClient });
app.use(WagmiPlugin, { config: wagmiConfig });

// Configure toast notifications
// Position: top-right for better visibility
// Timeout: 2500-3500ms gives users enough time to read without being intrusive
app.use(Toast, {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnHover: true,
  hideProgressBar: false,
  newestOnTop: true,
  transition: 'Vue-Toastification__bounce',
  maxToasts: 3, // Limit to 3 toasts to avoid UI clutter
  draggable: true,
  draggablePercent: 0.6,
});

// Initialize shared toast instance for use in Pinia stores
// Access toast from app instance after plugin registration
// vue-toastification v2 stores the toast instance in app.config.globalProperties
// We'll initialize it after mount when the app is fully set up

// Initialize wallet watchers and sync initial state
const walletStore = useWalletSessionStore();
walletStore.syncFromProviders('init');
startWalletWatchers();

app.mount('#app');

// Initialize toast instance after mount so it's available in stores
// Access via getCurrentInstance() in a component or directly from app
// For now, we'll use app.config.globalProperties which vue-toastification populates
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toastInstance = (app.config.globalProperties as any).$toast;
if (toastInstance) {
  initToastInstance(toastInstance);
}
