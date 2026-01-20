<script setup lang="ts"></script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
  >
    <!-- Header -->
    <header
      class="sticky top-0 z-50 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-lg"
    >
      <div class="mx-auto max-w-7xl px-4 py-4">
        <h1 class="text-xl font-bold text-white">Web3 Wallet Trial</h1>
      </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto max-w-7xl px-4 py-8">
      <slot />
    </main>
  </div>
</template>
