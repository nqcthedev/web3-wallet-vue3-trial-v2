<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  disabled?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
});

const emits = defineEmits<{
  click: [event: MouseEvent];
}>();

const isPressed = ref(false);

const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) {
    event.preventDefault();
    return;
  }
  emits('click', event);
};

const handleTouchStart = () => {
  isPressed.value = true;
};

const handleTouchEnd = () => {
  setTimeout(() => {
    isPressed.value = false;
  }, 150);
};

const buttonClasses = computed(() => {
  const base =
    'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation select-none cursor-pointer relative z-10';

  // Active/Pressed state - stronger visual feedback
  const activeState =
    isPressed.value || props.loading
      ? 'scale-95 opacity-80'
      : 'active:scale-95 active:opacity-80';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-[2.5rem] min-w-[3rem]', // Increased min-height/width for mobile tap area
    md: 'px-4 py-2.5 text-base min-h-[2.75rem]',
  };

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600 focus:ring-blue-500 shadow-lg shadow-blue-500/25',
    ghost:
      'bg-slate-800/50 text-slate-200 border border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600 focus:ring-slate-500',
    danger:
      'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 focus:ring-red-500 shadow-lg shadow-red-500/25',
  };

  return `${base} ${activeState} ${sizeClasses[props.size]} ${variantClasses[props.variant]}`;
});
</script>

<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchEnd"
  >
    <span v-if="loading" class="mr-2 inline-block">
      <svg
        class="h-4 w-4 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </span>
    <slot />
  </button>
</template>
