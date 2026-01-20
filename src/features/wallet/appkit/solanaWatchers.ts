export function startSolanaWatchers(): () => void {
  // Solana watchers are handled via AppKit subscriptions in watchers.ts
  // No polling needed - AppKit subscriptions handle state changes
  return () => {
    // Cleanup function (no-op for now)
  };
}

export function stopSolanaWatchers() {
  // Cleanup function (no-op for now)
}
