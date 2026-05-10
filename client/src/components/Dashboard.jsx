import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { getProgram, sendSokongDonation, fetchTimeCapsules, initializeState, checkIfInitialized, CREATOR_VAULT_ADDRESS } from '../services/blockchain';
import { TimeCapsuleCard } from './TimeCapsuleCard';

export const Dashboard = () => {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [gallery, setGallery] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [isInitialized, setIsInitialized] = useState(true);

    useEffect(() => {
        if (wallet.connected) {
            loadGallery();
        }
    }, [wallet.connected, connection]);

    const loadGallery = async () => {
        setIsFetching(true);
        const program = getProgram(connection, wallet);
        
        const initStatus = await checkIfInitialized(program);
        setIsInitialized(initStatus);

        if (initStatus) {
            const records = await fetchTimeCapsules(program);
            setGallery(records);
        } else {
            setGallery([]);
        }
        setIsFetching(false);
    };

    const handleInitialize = async () => {
        if (!wallet.connected) return alert("Please connect wallet first!");
        try {
            setLoading(true);
            const program = getProgram(connection, wallet);
            const tx = await initializeState(program);
            
            setIsInitialized(true);
            if (tx === "ALREADY_INITIALIZED") {
                alert("Vault is already initialized on-chain! Unlocking the donation gateway...");
            } else {
                alert(`Vault Initialized Successfully! TX: ${tx}`);
            }
            await loadGallery();
        } catch (err) {
            console.error(err);
            const errorMsg = err.message ? err.message.toLowerCase() : '';
            if (errorMsg.includes('insufficient lamports')) {
                alert("Initialization failed: Your Phantom wallet lacks Devnet SOL to fund the state account creation.");
            } else if (errorMsg.includes('accountnotfound') || errorMsg.includes('not exist') || errorMsg.includes('program not found') || errorMsg.includes('virtual account')) {
                alert("Initialization failed: The Smart Contract is NOT deployed to Devnet yet! The network rejected the transaction because Program ID 9cv9sfA... has no code. Please deploy your contract first.");
            } else {
                alert(`Initialization failed. See developer console for raw details. Error: ${err.message || 'Unknown'}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDonate = async (e) => {
        e.preventDefault();
        if (!wallet.connected) {
            alert("Please connect your Phantom/Solflare wallet first!");
            return;
        }
        if (!amount || !message) {
            alert("Please enter both amount and message!");
            return;
        }

        try {
            setLoading(true);
            const program = getProgram(connection, wallet);
            const tx = await sendSokongDonation(program, parseFloat(amount), message);
            alert(`Donation successful! TX: ${tx}`);
            
            // Re-fetch real on-chain data
            await loadGallery();
            
            setAmount('');
            setMessage('');
        } catch (err) {
            console.error(err);
            const errorMsg = err.message ? err.message.toLowerCase() : '';
            if (errorMsg.includes('not exist') || errorMsg.includes('program not found')) {
                alert("Transaction failed: The Smart Contract is NOT deployed to Devnet yet! Please run `anchor deploy`.");
            } else {
                alert("Transaction failed or rejected by wallet. Ensure the Vault is Initialized first. See console for details.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            <header className="header glass" style={{ marginBottom: '2rem' }}>
                <div className="logo"><span className="text-gradient">Sokong</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontFamily: 'monospace', color: '#aaa' }}>
                    </span>
                    <WalletMultiButton style={{ background: 'var(--sol-purple)' }} />
                </div>
            </header>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div className="glass" style={{ flex: '1', minWidth: '300px', padding: '2rem', height: 'fit-content' }}>
                    <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Support Creator</h2>
                    <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                        Vault: <span style={{ color: 'var(--sol-green)', fontFamily: 'monospace' }}>
                            {CREATOR_VAULT_ADDRESS.slice(0, 8)}...{CREATOR_VAULT_ADDRESS.slice(-8)}
                        </span>
                    </p>
                    <form onSubmit={handleDonate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Amount (SOL)</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                placeholder="0.5" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Time Capsule Message</label>
                            <textarea 
                                placeholder="Leave your mark... (max 200 chars)" 
                                maxLength={200}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#666', marginTop: '0.3rem' }}>
                                {message.length}/200
                            </div>
                        </div>
                        
                        {!isInitialized && (
                            <div style={{ padding: '10px', background: 'rgba(255, 0, 0, 0.1)', color: '#ff6b6b', border: '1px solid rgba(255, 0, 0, 0.3)', borderRadius: '8px', fontSize: '0.85rem' }}>
                                ⚠️ The Creator Vault is not initialized on-chain yet! Please use the Admin Tools below to bootstrap the vault before donating.
                            </div>
                        )}

                        <button type="submit" className="btn-primary" disabled={loading || !wallet.connected || !isInitialized} style={{ marginTop: '1rem', opacity: (!isInitialized ? 0.5 : 1) }}>
                            {loading ? 'Confirming...' : 'Send Sokong'}
                        </button>
                    </form>

                    <div style={{ marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <p style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem' }}>Admin Tools (Run once per deployment)</p>
                        <button onClick={handleInitialize} className="btn-secondary" disabled={loading || !wallet.connected} style={{ fontSize: '0.8rem', padding: '8px 16px' }}>
                            Initialize Vault State
                        </button>
                    </div>
                </div>

                <div style={{ flex: '2', minWidth: '400px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: 0 }}>Time Capsule Gallery</h2>
                        {isFetching && <span style={{ color: 'var(--sol-purple)', fontSize: '0.9rem' }}>Fetching live data...</span>}
                    </div>
                    
                    {!wallet.connected ? (
                        <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
                            Please connect your wallet to view live on-chain Time Capsules.
                        </div>
                    ) : gallery.length === 0 && !isFetching ? (
                        <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
                            No Time Capsules found yet. Be the first to leave your mark!
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                            {gallery.map((record, idx) => (
                                <TimeCapsuleCard key={idx} record={record} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
