# Blockless Swap DApp

This project was built for the **Unite Defi** async hackathon (July 25 – August 6, 2025).

deployed link: [Blockless Pay](https://blockless.vercel.app/)

**Theme:** *Think beyond limits: shape boundless Web3*

---

## Overview

**Blockless Swap** is a decentralized application that simplifies cross-chain token swaps by enabling users to create and share pre-configured swap orders via a single link. When opened, this link displays a clean interface with **all supported wallet deeplinks**, including **MetaMask, Trust Wallet, Coinbase Wallet, Rabby, and more**, allowing the recipient to choose their preferred wallet and execute the swap instantly — even across chains.

Powered by **1inch Fusion+** and the **1inch Cross-Chain SDK**, Blockless Swap abstracts away the complexity of multi-chain transactions, making it effortless to request payments or delegate swaps in any EVM-compatible token, regardless of the user’s current holdings or wallet.

The goal? To make DeFi interactions as simple as clicking a link.

---

## Live Demo

**(A live demo will be available here)**

---

## Key Features

- ✅ **Intuitive Swap Order Creation**  
  Easily define your desired swap: source chain, token, amount, and recipient address — all in one form.

- 🔗 **Shareable Order Link with Wallet Selection**  
  Generate a single URL that, when opened, shows **all available wallet deeplinks**. Recipients can pick their wallet and proceed directly to approval — no app switching or manual input needed.

- 📲 **Smart Wallet Deeplink Support**  
  The order page automatically detects and displays deeplinks for popular wallets:
  - MetaMask
  - Trust Wallet
  - Coinbase Wallet
  - Rabby
  - SafePal
  - TokenPocket
  - And more  
  Scanning or clicking the correct link opens the transaction in the user’s wallet app with full swap details pre-filled.

- 🌐 **True Cross-Chain Swaps via 1inch**  
  Leverages the **1inch Cross-Chain SDK** to enable seamless swaps across EVM-compatible networks (e.g., Ethereum → Arbitrum, Polygon → Base). No need for the recipient to hold the source token — the swap happens as part of the transaction.

- 🧩 **Powered by 1inch Fusion+**  
  Ensures optimal pricing, MEV protection, and atomic execution of swaps, even across chains.

- 🖼️ **Dual QR Code Options**
  - **Universal QR Code**: Opens the order page with all wallet options.
  - **Wallet-Specific QR Codes**: Direct deeplink QRs for each wallet (e.g., scan with MetaMask → transaction opens instantly).

- 🌙 **Modern UI with Dark Mode**  
  Built with React, TypeScript, and Tailwind CSS for a responsive, accessible, and beautiful experience on any device.

- 🔌 **Seamless Wallet Integration**  
  Uses `wagmi` and `viem` for robust wallet connectivity and address auto-fill during order creation.

---

## How It Works

The flow is designed for maximum simplicity across two roles: the **order creator** and the **executor**.

### 1. **Create the Order**
- The user selects:
  - Source blockchain
  - Input token and amount
  - Recipient address (can auto-fill from connected wallet)
- The app uses 1inch APIs to validate and configure the swap.

### 2. **Generate & Share**
- Click “Generate Order” to create a unique, shareable link (e.g., `https://blocklessswap.app/order?id=abc123`)
- The app generates:
  - A **universal link** that opens a wallet selection interface
  - A **QR code** for easy mobile sharing
  - Optional: individual **wallet-specific QR codes** for direct deeplinking

### 3. **Execute the Swap**
- Recipient opens the link on mobile or desktop
- Sees a clean page listing **all compatible wallet deeplinks**
- Taps their wallet (e.g., "Open in MetaMask")
- Wallet opens with the **cross-chain swap pre-filled**
- User confirms the transaction — done!

> No need to visit a DApp, connect a wallet, or manually enter swap details.

---

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS (with dark mode support)
- **Web3 Libraries**:
  - `wagmi` & `viem`: Wallet connections and on-chain interactions
- **API Proxy**: Vercel rewrites (`vercel.json`) proxy 1inch API requests to avoid CORS issues to 1inch apis
- **QR Generation**: `qrcode.react` for dynamic QR code rendering
- **Deployment**: Optimized for Vercel (serverless functions + static hosting)

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- `pnpm` (recommended; project includes `pnpm-lock.yaml`)

> You can use `npm` or `yarn`, but `pnpm` ensures lockfile consistency.

### Installation

```bash
git clone https://github.com/your-repo/swap-dapp.git
cd swap-dapp
pnpm install
```


### project message:

Here's what our team is working on so far:

**Name**: blockless pay
**Description**: A link to pay anyone in any token, any chain. Just share a URL
          https://blockless.vercel.app/order?id=eyJmaWF0QW1vdW50Ijo4MCwiZmlhdEN1cnJlbmN5IjoiVVNEIiwiY2hhaW5zIjpbeyJuYW1lIjoiQXJiaXRydW0iLCJhZGRyZXNzIjoiMHhEMEY0MUZmNjJmMWU3RkVjMDVEMDE2NEFiZDcyQ0E2MGFjOWU5QUYzIiwiY2hhaW5JZCI6NDIxNjEsInRva2VucyI6W3sic3ltYm9sIjoiVVNEVCIsImFtb3VudCI6Ijc5LjkwNzQ1OCIsImluZm8iOnsic3ltYm9sIjoiVVNEVCIsImFkZHJlc3MiOiIweEZkMDg2YmM3Q2Q1YzQ4NWM1M0VmNjJiYzJiMTI1RTVDNDlhRmZmMjciLCJkZWNpbWFscyI6NiwiY2hhaW5JZCI6NDIxNjF9fSx7InN5bWJvbCI6IkVUSCIsImFtb3VudCI6IjAuMDIzMDMxIiwiaW5mbyI6eyJzeW1ib2wiOiJFVEgiLCJhZGRyZXNzIjoiMHg4MmFmNDk0NDdkOGEwN2UzYmQ5NWJkMGQ1NmYzNTI0MTUyM2ZiYWIxIiwiZGVjaW1hbHMiOjE4LCJjaGFpbklkIjo0MjE2MX19XX0seyJuYW1lIjoiQXZhbGFuY2hlIiwiYWRkcmVzcyI6IjB4RDBGNDFGZjYyZjFlN0ZFYzA1RDAxNjRBYmQ3MkNBNjBhYzllOUFGMyIsImNoYWluSWQiOjQzMTE0LCJ0b2tlbnMiOlt7InN5bWJvbCI6IlVTRFQiLCJhbW91bnQiOiI3OS45MDc0NTgiLCJpbmZvIjp7InN5bWJvbCI6IlVTRFQiLCJhZGRyZXNzIjoiMHg5NzAyMjMwYThhZGE0OWE0MDZmY2Q2ZjNjNTUwYzFhZmExYmVjMWJjIiwiZGVjaW1hbHMiOjYsImNoYWluSWQiOjQzMTE0fX1dfSx7Im5hbWUiOiJFdGhlcmV1bSIsImFkZHJlc3MiOiIweEQwRjQxRmY2MmYxZTdGRWMwNUQwMTY0QWJkNzJDQTYwYWM5ZTlBRjMiLCJjaGFpbklkIjoxLCJ0b2tlbnMiOlt7InN5bWJvbCI6IkRBSSIsImFtb3VudCI6Ijc5LjI2Nzg0MSIsImluZm8iOnsic3ltYm9sIjoiREFJIiwiYWRkcmVzcyI6IjB4NkIxNzU0NzRFODkwOTRDNDREYTk4Yjk1NEVlZGVBQzQ5NTI3MWQwRiIsImRlY2ltYWxzIjoxOCwiY2hhaW5JZCI6MX19LHsic3ltYm9sIjoiRVRIIiwiYW1vdW50IjoiMC4wMjMwMzEiLCJpbmZvIjp7InN5bWJvbCI6IkVUSCIsImFkZHJlc3MiOiIweGMwMmFhYTM5YjIyM2ZlOGQwYTBlNWM0ZjI3ZUFEOTA4M0M3NTZDYzIiLCJkZWNpbWFscyI6MTgsImNoYWluSWQiOjF9fV19XX0=
                
**Github**: https://github.com/dujar/blockless 
**Idea**: Cross-chain payments aren’t entirely broken, but they are fragmented, risky, and not user-friendly — making crypto inconvenient for mainstream, everyday payments
**Blockers**: time

Public URL: https://ethglobal.com/showcase/blockless-wvy54 