# Web3 Wallet Trial

Vue 3 + TypeScript + Tailwind v4 + Pinia + AppKit (EVM + Solana)

## Setup

1. Create `.env.local` file in the root directory:

   ```
   VITE_REOWN_PROJECT_ID=YOUR_PROJECT_ID
   ```

   Replace `YOUR_PROJECT_ID` with your Reown AppKit project ID (get it from https://cloud.reown.com).

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run development server:

   ```bash
   npm run dev
   ```

4. Open the app and click "Connect" - AppKit modal will appear:
   - **Desktop**: Connect via browser extension (MetaMask, WalletConnect, etc.)
   - **Mobile**: AppKit will automatically show QR code for wallet app connection

## Features

- ✅ Vue 3 + TypeScript (strict mode)
- ✅ Tailwind CSS v4
- ✅ Pinia state management
- ✅ Reown AppKit integration (EVM + Solana)
- ✅ Vue Query + Wagmi
- ✅ Production-ready UI components

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run typecheck` - Type check TypeScript
- `npm run lint` - Run ESLint
- `npm run format` - Check Prettier formatting
