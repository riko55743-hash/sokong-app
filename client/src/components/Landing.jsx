import React, { useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import { SokongWalletButton } from './SokongWalletButton';

export const Landing = ({ onEnter }) => {
    const { publicKey } = useWallet();
    const { language } = useLanguage();
    const t = (key) => translations[language][key] || key;

    useEffect(() => {
        if (publicKey) {
            onEnter('connected');
        }
    }, [publicKey, onEnter]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '600px', margin: '0 auto', gap: '2rem' }}>
            <div>
                <h1 style={{ fontSize: '3.5rem', margin: '0 0 1rem 0', fontWeight: 800 }}>
                    <span className="text-gradient">{t('sokong')}</span>
                </h1>
                <p style={{ color: '#aaa', fontSize: '1.2rem', lineHeight: '1.6' }}>
                    {t('proofOfEarlySupport')}
                </p>
            </div>

            <div className="glass" style={{ padding: '2.5rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
                <SokongWalletButton style={{ width: '100%', justifyContent: 'center', background: 'var(--sol-purple)' }} />
            </div>
        </div>
    );
};
