import React, { useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { SokongWalletButton } from './SokongWalletButton';

export const Landing = ({ onEnter }) => {
    const { publicKey } = useWallet();

    useEffect(() => {
        if (publicKey) {
            onEnter('connected');
        }
    }, [publicKey, onEnter]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '600px', margin: '0 auto', gap: '2rem' }}>
            <div>
                <h1 style={{ fontSize: '3.5rem', margin: '0 0 1rem 0', fontWeight: 800 }}>
                    <span className="text-gradient">Sokong</span>
                </h1>
                <p style={{ color: '#aaa', fontSize: '1.2rem', lineHeight: '1.6' }}>
                    Proof of Early Support. Leave your mark in the Time Capsule and back your favorite creators on Solana.
                </p>
            </div>

            <div className="glass" style={{ padding: '2.5rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
                <SokongWalletButton style={{ width: '100%', justifyContent: 'center', background: 'var(--sol-purple)' }} />
            </div>
        </div>
    );
};
