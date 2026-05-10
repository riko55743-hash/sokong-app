import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const SokongWalletButton = ({ style }) => {
    return (
        <WalletMultiButton style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            borderRadius: '8px',
            padding: '10px 20px',
            height: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.2s',
            ...style
        }} />
    );
};
