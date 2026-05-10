# 🌟 Sokong - Proof of Early Support (Time Capsule)

> **"Sokong: The ultimate Web3 Consumer App bridging Creators and Supporters through immutable Time Capsules."**

## 🏆 Project Overview
Sokong is a decentralized donation platform built on Solana. It reimagines the relationship between digital creators and their fans by introducing the **"Proof of Early Support"** mechanism. When fans donate to a campaign, they aren't just sending SOL—they are minting an immutable, 3D holographic "Time Capsule" NFT containing a personalized message. 

## 🚀 The X-Factor: Time Capsule Gallery
Unlike traditional tipping platforms, Sokong restricts the "Time Capsule" NFT mint to the **First 10 Donors (Early Birds)** of a campaign. This creates high scarcity, social prestige, and turns a simple donation into a permanent digital collectible.

## 💻 Tech Stack
- **Frontend**: React + Vite (Glassmorphism UI)
- **Blockchain**: Solana Devnet
- **Smart Contracts**: Anchor Framework (Rust)
- **Tokens**: Metaplex Token Metadata CPIs
- **Wallet**: Phantom (`@solana/wallet-adapter`)

## 🛠 Installation & Local Setup

1. **Clone the Repository & Navigate to Client**
   ```bash
   git clone https://github.com/riko55743-hash/sokong-app.git
   cd sokong-app/client
   ```
   *Note: You MUST be inside the `client` directory for the npm commands to work.*

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```

4. **Wallet Setup**
   - Install the Phantom Wallet extension.
   - Switch to **Solana Devnet** in Developer Settings.
   - Obtain test SOL from the Solana Faucet.

## 📖 How it Works
1. **Creators** initialize their Vault and launch a Campaign.
2. **Supporters** discover the campaign and send SOL.
3. The Anchor program routes the SOL to the Creator and mints the Time Capsule NFT directly to the Supporter's wallet.
4. The NFT is displayed in the Supporter's **Time Capsule Gallery** using dynamic 3D CSS rendering.
