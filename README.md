# Blockless Swap DApp

This project was built for the **Unite Defi** async hackathon (July 25 – August 6, 2025).

**Theme:** *Think beyond limits: shape boundless Web3*

---

## Overview

`Blockless Swap` is a decentralized application designed to simplify cross-chain token swaps. It allows users to create pre-configured swap orders and share them as a simple link or QR code. The person receiving the link can then execute the swap seamlessly from their own wallet.

The application leverages the power of **1inch Fusion+** for secure and efficient swaps and supports wallet-specific **deeplinks** for an even smoother mobile experience. The primary goal is to abstract away the complexity of swaps, making it easy to request payment or send instructions for a transaction across different blockchain networks.

## Live Demo

**(A live demo will be available here)**

## Key Features

-   **Intuitive Swap Order Creation**: Easily define your swap by selecting the blockchain, token, amount, and recipient address.

-   **Shareable Swap Links**: Generate a unique URL for your swap order that can be shared with anyone. When opened, it pre-fills the swap details for execution.

-   **Advanced QR Code Generation**:
    -   **Generic Swap Link QR**: A standard QR code that opens the swap page with pre-filled parameters. Ideal for sharing publicly or when the receiver's wallet is unknown.
    -   **Wallet Deeplink QRs**: Specialized QR codes for popular wallets like MetaMask, Trust Wallet, Coinbase Wallet, Rabby, and more. Scanning these with the respective wallet app initiates the transaction directly, streamlining the payment process.

-   **Cross-Chain Capability**: Powered by the 1inch Network, the DApp is designed to support a wide range of EVM-compatible blockchains.

-   **Seamless Wallet Integration**: Uses `wagmi` and `viem` to connect to various wallets, allowing users to auto-fill their recipient address or connect to execute a swap.

-   **Modern UI/UX**: A clean, responsive interface built with React and Tailwind CSS, featuring both light and dark modes to suit user preference.

## How It Works

The user flow is designed to be simple and split between two main actors: the creator of the order and the executor.

1.  **Create**: On the landing page, a user fills out the form with the desired swap details (e.g., "I want someone to send 1.5 ETH on Ethereum to address `0x...`").
2.  **Generate**: The user clicks "Generate" to create a unique swap order.
3.  **Share**: The app presents two ways to share the order:
    -   A **shareable link/QR code**: Anyone with this link can open the swap interface with all details pre-filled. This is perfect for paying someone in a token they might not currently hold.
    -   **Wallet deeplink QR codes**: These are specific to mobile wallets. If the person executing the swap uses MetaMask on their phone, they can scan the MetaMask QR code to open the transaction confirmation screen directly in their app.
4.  **Execute**: The recipient scans the QR code or opens the link, connects their own wallet, and confirms the transaction to complete the swap.

## Tech Stack

-   **Frontend**: React, TypeScript, Vite
-   **Styling**: Tailwind CSS
-   **Web3 Integration**:
    -   `wagmi` & `viem`: For wallet connections and blockchain interactions.
    -   `@1inch/cross-chain-sdk`: The core engine for fetching swap data and executing trades via 1inch Fusion+.
-   **API Proxy**: The Vercel configuration (`vercel.json`) includes a rewrite to proxy requests to the 1inch API, avoiding potential CORS issues.
-   **Deployment**: Ready for deployment on Vercel.

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

-   Node.js (v18 or later recommended)
-   `pnpm` package manager (you can use `npm` or `yarn` as well, but this project uses a `pnpm-lock.yaml` file)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-repo/swap-dapp.git
    cd swap-dapp
    ```

2.  Install dependencies:
    ```bash
    pnpm install
    ```

### Running the Development Server

To start the local development server:

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) (or the port specified by Vite) in your browser.

### Building for Production

To create a production-ready build:

```bash
pnpm build
```

This command builds the frontend application and prepares any serverless functions. The output is generated in the `dist/` directory, ready for deployment.
