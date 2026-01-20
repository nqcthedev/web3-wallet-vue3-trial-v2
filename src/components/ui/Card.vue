<script setup lang="ts"></script>

<template>
  <div
    class="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 shadow-xl backdrop-blur-sm"
  >
    <div v-if="$slots.header" class="mb-4 border-b border-slate-700/50 pb-4">
      <slot name="header" />
    </div>
    <slot />
  </div>
</template>
