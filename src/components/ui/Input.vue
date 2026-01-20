<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: string;
  placeholder?: string;
  error?: string | null;
  hint?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  error: null,
  hint: null,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const inputClasses = computed(() => {
  const base =
    'w-full rounded-lg border bg-slate-800/50 px-4 py-3 text-white placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900';
  const stateClasses = props.error
    ? 'border-red-500/50 focus:ring-red-500'
    : 'border-slate-700/50 focus:border-blue-500/50 focus:ring-blue-500';
  return `${base} ${stateClasses}`;
});
</script>

<template>
  <div class="w-full">
    <input
      :value="inputValue"
      :placeholder="placeholder"
      :class="inputClasses"
      @input="inputValue = ($event.target as HTMLInputElement).value"
    />
    <p v-if="error" class="mt-1.5 text-sm text-red-400">{{ error }}</p>
    <p v-else-if="hint" class="mt-1.5 text-sm text-slate-400">{{ hint }}</p>
  </div>
</template>
