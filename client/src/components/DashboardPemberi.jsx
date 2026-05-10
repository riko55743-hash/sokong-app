import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { SokongWalletButton } from './SokongWalletButton';
import { useAuth } from '../context/AuthContext';
import { getProgram, sendSokongDonation } from '../services/blockchain';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGift, faHeart, faMagnifyingGlass, faStar, faGamepad, faTheaterMasks, faMusic, faTimes, faComment, faRocket, faHandPointLeft, faUser, faUsers, faCoins, faBook, faServer, faPen, faCheck, faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import { toast } from 'react-hot-toast';
import '../styles/DashboardPemberi.css';

export const DashboardPemberi = ({ onSwitchRole }) => {
    const { user, logout, getUsersRegistry, updateProfile } = useAuth();
    const { connected } = useWallet();
    const wallet = useWallet();
    const { connection } = useConnection();

    const [campaigns, setCampaigns] = useState([]);
    const [donations, setDonations] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [donationAmount, setDonationAmount] = useState('');
    const [donationMessage, setDonationMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [loading, setLoading] = useState(false);

    const [activeTab, setActiveTab] = useState('explore');
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        username: user?.username || '',
        name: user?.name || user?.username || '',
        email: user?.email || '',
        photoUrl: user?.photoUrl || '',
    });

    useEffect(() => {
        if (activeTab === 'explore') {
            const registry = getUsersRegistry();
            const categoryIconMap = {
                gaming: faGamepad, variety: faTheaterMasks, musik: faMusic, edukasi: faBook,
                defi: faCoins, gamefi: faGamepad, 'rwa (real world assets)': faBook,
                'consumer apps': faUsers, infrastructure: faServer, 'nft/digital collectibles': faStar, daos: faUsers
            };

            const allCampaigns = [];
            registry.forEach(u => {
                if (Array.isArray(u?.campaigns)) {
                    u.campaigns.forEach(camp => {
                        allCampaigns.push({
                            ...camp,
                            creatorUsername: u.username,
                            creatorName: u.name,
                            creatorWallet: u.walletAddress,
                            avatarIcon: categoryIconMap[camp.category?.toLowerCase()] || faStar
                        });
                    });
                }
            });
            setCampaigns(allCampaigns);
        }
    }, [activeTab, getUsersRegistry]);

    const handleProfileInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = () => {
        if (!profileData.username || profileData.username.trim() === '') {
            return toast.error("Username tidak boleh kosong.");
        }
        try {
            updateProfile({ username: profileData.username.trim(), name: profileData.name, email: profileData.email, photoUrl: profileData.photoUrl });
            setIsEditingProfile(false);
            toast.success('Profil berhasil disimpan!');
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleLogout = async () => {
        if (wallet) {
            await wallet.disconnect();
        }
    };

    const handleDonate = async (e) => {
        e.preventDefault();
        if (!connected) {
            toast.error('Hubungkan wallet Solana kamu dulu!');
            return;
        }
        if (!donationAmount || !selectedCampaign) {
            toast.error('Pilih campaign dan masukkan jumlah donasi!');
            return;
        }
        if (!selectedCampaign.creatorWallet) {
            toast.error('Creator ini belum menghubungkan Wallet mereka, jadi belum bisa menerima donasi!');
            return;
        }

        try {
            setLoading(true);
            const program = getProgram(connection, wallet);

            // Pass the dynamic creator wallet address here!
            const tx = await sendSokongDonation(program, parseFloat(donationAmount), donationMessage, selectedCampaign.creatorWallet);

            toast.success(`Donasi ${donationAmount} SOL ke @${selectedCampaign.creatorUsername} berhasil!\nTX: ${tx}`);

            // Sync with Creator's Registry Profile
            const registry = getUsersRegistry();
            const creatorIndex = registry.findIndex(u => u.username === selectedCampaign.creatorUsername);
            if (creatorIndex !== -1) {
                const creatorProfile = registry[creatorIndex];
                if (!creatorProfile.donations) creatorProfile.donations = [];

                const campIndex = creatorProfile.campaigns?.findIndex(c => c.id === selectedCampaign.id);
                const currentDonors = campIndex !== -1 && creatorProfile.campaigns ? (creatorProfile.campaigns[campIndex].donors || 0) : 0;
                const isEarlyBird = currentDonors < 10;

                creatorProfile.donations.unshift({
                    id: Date.now(),
                    campaignId: selectedCampaign.id,
                    campaignTitle: selectedCampaign.title,
                    donor: user.username,
                    donorName: user.name || user.username,
                    amount: parseFloat(donationAmount),
                    message: donationMessage,
                    date: new Date().toLocaleDateString('id-ID'),
                    txHash: tx,
                    isEarlyBird: isEarlyBird,
                    nftMinted: true
                });

                // Update campaign raised amount
                if (campIndex !== -1 && creatorProfile.campaigns) {
                    creatorProfile.campaigns[campIndex].raised = (creatorProfile.campaigns[campIndex].raised || 0) + parseFloat(donationAmount);
                    creatorProfile.campaigns[campIndex].donors = (creatorProfile.campaigns[campIndex].donors || 0) + 1;
                }

                localStorage.setItem("sokong_users_registry", JSON.stringify(registry));
            }

            setDonations([...donations, {
                id: Date.now(),
                campaignId: selectedCampaign.id,
                streamer: selectedCampaign.creatorUsername,
                amount: donationAmount,
                message: donationMessage,
                date: new Date().toLocaleDateString('id-ID'),
                txHash: tx
            }]);

            setDonationAmount('');
            setDonationMessage('');
            setSelectedCampaign(null);
        } catch (err) {
            console.error(err);
            const errorMsg = err.message ? err.message.toLowerCase() : '';
            if (errorMsg.includes('not exist') || errorMsg.includes('program not found')) {
                toast.error('Transaksi gagal: Smart Contract belum di-deploy atau Vault Creator belum diinisialisasi.');
            } else if (errorMsg.includes('insufficient')) {
                toast.error('Transaksi gagal: Saldo SOL kamu tidak cukup untuk donasi.');
            } else {
                toast.error('Transaksi gagal atau ditolak dompet. Coba lagi atau lihat console untuk detail.');
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredCampaigns = campaigns.filter(c => {
        if (!c.isLive) return false;
        if (c.creatorUsername === user?.username) return false;

        const matchSearch = searchQuery === '' ||
            (c.creatorUsername || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.title || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchSearch;
    }).sort((a, b) => (b.raised || 0) - (a.raised || 0) || b.id - a.id).slice(0, 5);

    return (
        <div className="dashboard-pemberi">
            <header className="dashboard-header pemberi-header glass">
                <div className="header-left">
                    <div className="logo"><span className="text-gradient">Sokong</span></div>
                    <span className="user-role"><FontAwesomeIcon icon={faGift} /> Supporter</span>
                </div>
                <div className="header-right">
                    <span className="user-name"><FontAwesomeIcon icon={faUser} /> @{user?.username}</span>
                    <SokongWalletButton style={{ background: 'var(--sol-green)', color: '#000' }} />
                    <button onClick={onSwitchRole} className="btn-switch-role">Switch Role</button>
                    <button onClick={handleLogout} className="btn-logout">Logout</button>
                </div>
            </header>

            <main className="dashboard-content">
                <div className="search-hero">
                    <h1 className="search-title">
                        Support <span className="text-gradient">Creator</span> Favoritmu
                    </h1>
                    <p className="search-subtitle">Kirim donasi SOL langsung ke wallet creator pilihanmu secara on-chain</p>

                    <div className={`search-bar-wrapper ${searchFocused ? 'focused' : ''}`}>
                        <span className="search-icon"><FontAwesomeIcon icon={faMagnifyingGlass} /></span>
                        <input
                            type="text"
                            className="search-bar"
                            placeholder="Search creator username or campaign title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                        />
                        {searchQuery && (
                            <button className="search-clear" onClick={() => setSearchQuery('')}><FontAwesomeIcon icon={faTimes} /></button>
                        )}
                    </div>

                </div>

                <div className="dp-tabs" style={{ padding: '0 2rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <button onClick={() => setActiveTab('explore')} style={{ background: 'transparent', border: 'none', borderBottom: activeTab === 'explore' ? '2px solid var(--sol-green)' : '2px solid transparent', color: activeTab === 'explore' ? '#fff' : 'rgba(255,255,255,0.45)', padding: '0.75rem 1.25rem', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}><FontAwesomeIcon icon={faMagnifyingGlass} /> Explore</button>
                    <button onClick={() => setActiveTab('gallery')} style={{ background: 'transparent', border: 'none', borderBottom: activeTab === 'gallery' ? '2px solid var(--sol-green)' : '2px solid transparent', color: activeTab === 'gallery' ? '#fff' : 'rgba(255,255,255,0.45)', padding: '0.75rem 1.25rem', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}><FontAwesomeIcon icon={faStar} /> Time Capsule Gallery</button>
                    <button onClick={() => setActiveTab('profile')} style={{ background: 'transparent', border: 'none', borderBottom: activeTab === 'profile' ? '2px solid var(--sol-green)' : '2px solid transparent', color: activeTab === 'profile' ? '#fff' : 'rgba(255,255,255,0.45)', padding: '0.75rem 1.25rem', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}>⚙️ Profil Saya</button>
                </div>

                {activeTab === 'explore' && (
                    <div className="dashboard-layout">
                        <section className="campaigns-section">
                            <div className="section-header">
                                <h2>
                                    {searchQuery ? `Hasil pencarian "${searchQuery}"` : 'Top Supported Campaigns'}
                                </h2>
                            </div>

                            <div className="campaigns-list">
                                {filteredCampaigns.length === 0 ? (
                                    <div className="empty-state glass">
                                        <div className="empty-icon"><FontAwesomeIcon icon={faMagnifyingGlass} /></div>
                                        <p>Belum ada campaign yang dibuat oleh Creator di platform ini.</p>
                                    </div>
                                ) : (
                                    filteredCampaigns.map(campaign => (
                                        <div
                                            key={campaign.id}
                                            className={`campaign-item glass ${selectedCampaign?.id === campaign.id ? 'selected' : ''}`}
                                            onClick={() => setSelectedCampaign(campaign)}
                                        >
                                            <div className="campaign-avatar">
                                                <FontAwesomeIcon icon={campaign.avatarIcon} />
                                            </div>
                                            <div className="campaign-info">
                                                <div className="campaign-title-row" style={{ alignItems: 'flex-start' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>{campaign.creatorName || campaign.creatorUsername}</h3>
                                                        <span style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '2px' }}>@{campaign.creatorUsername}</span>
                                                    </div>
                                                    <span className={`platform-badge ${(campaign.platform || '').toLowerCase()}`}>
                                                        {campaign.platform || 'Unknown'}
                                                    </span>
                                                </div>
                                                <p className="campaign-desc"><strong>{campaign.title}</strong>: {campaign.description}</p>
                                                <div className="campaign-meta">
                                                    <span className="meta-item"><FontAwesomeIcon icon={faCoins} /> {campaign.raised || 0} / {campaign.targetAmount} SOL</span>
                                                    <span className={`meta-item category ${campaign.category}`}>{campaign.category}</span>
                                                    {!campaign.creatorWallet && <span style={{ color: '#ff4757', fontSize: '0.8rem' }}> (Wallet belum connect)</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        <aside className="donation-panel">
                            {selectedCampaign ? (
                                <div className="donation-card glass">
                                    <h3>Kirim Donasi ke</h3>
                                    <div className="selected-campaign-info">
                                        <div className="streamer-avatar-lg"><FontAwesomeIcon icon={selectedCampaign.avatarIcon} /></div>
                                        <div>
                                            <p className="streamer-name-lg" style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold' }}>{selectedCampaign.creatorName || selectedCampaign.creatorUsername}</p>
                                            <p style={{ color: '#aaa', fontSize: '0.9rem', margin: '4px 0 8px 0' }}>@{selectedCampaign.creatorUsername}</p>
                                            <small>{selectedCampaign.platform} · {selectedCampaign.title}</small>
                                        </div>
                                    </div>

                                    {!connected && (
                                        <div className="wallet-warning">
                                            Hubungkan wallet dulu untuk donasi
                                            <SokongWalletButton style={{ width: '100%', marginTop: '8px', justifyContent: 'center', background: 'var(--sol-green)', color: '#000' }} />
                                        </div>
                                    )}

                                    <form onSubmit={handleDonate}>
                                        <div className="form-group">
                                            <label>Jumlah Donasi (SOL)</label>
                                            <div className="quick-amounts">
                                                {['0.1', '0.5', '1', '2'].map(amt => (
                                                    <button
                                                        key={amt}
                                                        type="button"
                                                        className={`quick-amt ${donationAmount === amt ? 'active' : ''}`}
                                                        onClick={() => setDonationAmount(amt)}
                                                    >
                                                        {amt} SOL
                                                    </button>
                                                ))}
                                            </div>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                placeholder="atau masukkan jumlah..."
                                                value={donationAmount}
                                                onChange={(e) => setDonationAmount(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label><FontAwesomeIcon icon={faComment} /> Pesan Time Capsule</label>
                                            <textarea
                                                placeholder="Tulis pesan semangatmu yang akan disimpan di blockchain..."
                                                rows="3"
                                                maxLength="200"
                                                value={donationMessage}
                                                onChange={(e) => setDonationMessage(e.target.value)}
                                            />
                                            <small style={{ color: 'rgba(255,255,255,0.4)' }}>{donationMessage.length}/200</small>
                                        </div>

                                        <button type="submit" className="btn-primary donate-btn" disabled={!connected || loading}>
                                            {loading ? 'Mengirim...' : <><FontAwesomeIcon icon={faRocket} /> Kirim {donationAmount ? `${donationAmount} SOL` : 'Donasi'}</>}
                                        </button>
                                    </form>

                                    <button className="btn-cancel" onClick={() => setSelectedCampaign(null)}>Batal</button>
                                </div>
                            ) : (
                                <div className="donation-card glass empty">
                                    <div className="empty-icon"><FontAwesomeIcon icon={faHandPointLeft} /></div>
                                    <p>Pilih campaign untuk mulai berdonasi</p>
                                </div>
                            )}
                        </aside>
                    </div>
                )}

                {activeTab === 'gallery' && (() => {
                    const myGallery = [];
                    const registry = getUsersRegistry();
                    registry.forEach(creator => {
                        if (creator.donations) {
                            creator.donations.forEach(d => {
                                if (d.donor === user.username && d.nftMinted) {
                                    myGallery.push({ ...d, creatorName: creator.name || creator.username, creatorAvatar: creator.username[0].toUpperCase() });
                                }
                            });
                        }
                    });

                    return (
                        <div className="dashboard-layout" style={{ display: 'block', maxWidth: '1000px', margin: '0 auto' }}>
                            <div className="section-header"><h2><FontAwesomeIcon icon={faStar} /> Galeri Time Capsule Saya</h2></div>
                            {myGallery.length === 0 ? (
                                <div className="empty-state glass">
                                    <div className="empty-icon"><FontAwesomeIcon icon={faBoxOpen} /></div>
                                    <p>Kamu belum memiliki Sertifikat Digital Abadi. Mulai donasi untuk menjadi Early Bird!</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
                                    {myGallery.sort((a, b) => b.id - a.id).map((nft) => (
                                        <div key={nft.id} className="flip-card">
                                            <div className="flip-card-inner">
                                                <div className="flip-card-front">
                                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--sol-purple), var(--sol-green))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', color: '#fff', marginBottom: '1rem' }}>
                                                        {nft.creatorAvatar}
                                                    </div>
                                                    <h3 style={{ margin: '0 0 5px 0', fontSize: '1.3rem' }}>{nft.creatorName}</h3>
                                                    <p style={{ margin: 0, color: '#aaa', fontSize: '0.9rem' }}>{nft.campaignTitle || 'Sokong Campaign'}</p>
                                                    {nft.isEarlyBird && <div className="early-bird-badge">Early Bird Supporter</div>}
                                                </div>
                                                <div className="flip-card-back">
                                                    <h4 style={{ color: 'var(--sol-green)', marginBottom: '10px' }}>Pesan Abadi:</h4>
                                                    <p style={{ fontStyle: 'italic', color: '#ddd', fontSize: '1rem', marginBottom: '15px', lineHeight: '1.4' }}>"{nft.message}"</p>
                                                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', width: '100%', fontSize: '0.8rem', color: '#aaa', textAlign: 'left' }}>
                                                        <p style={{ margin: '0 0 5px 0' }}><strong>Tgl:</strong> {nft.date}</p>
                                                        <p style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><strong>TX:</strong> {nft.txHash.slice(0, 12)}...</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })()}

                {activeTab === 'profile' && (
                    <div className="dashboard-layout" style={{ display: 'block', maxWidth: '800px', margin: '0 auto' }}>
                        <div className="section-header"><h2>Profil Saya</h2></div>
                        <div className="donation-card glass" style={{ padding: '2rem' }}>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label>Username (Unik) <span style={{ color: '#ff4757' }}>*</span></label>
                                {isEditingProfile ? (
                                    <input type="text" name="username" value={profileData.username} onChange={handleProfileInputChange} placeholder="username_unik" required />
                                ) : (<p style={{ padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)', margin: 0, fontSize: '1.1rem' }}>@{profileData.username}</p>)}
                            </div>

                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label>Nama / Display Name</label>
                                {isEditingProfile ? (
                                    <input type="text" name="name" value={profileData.name} onChange={handleProfileInputChange} placeholder="Nama tayangan kamu..." />
                                ) : (<p style={{ padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)', margin: 0, fontSize: '1.1rem' }}>{profileData.name || '-'}</p>)}
                            </div>

                            <div className="form-group" style={{ marginBottom: '2rem' }}>
                                <label>Wallet Solana Aktif</label>
                                <div><SokongWalletButton style={{ background: 'var(--sol-green)', color: '#000' }} /></div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {isEditingProfile ? (
                                    <>
                                        <button className="btn-primary" onClick={handleSaveProfile} style={{ flex: 1 }}><FontAwesomeIcon icon={faCheck} /> Simpan</button>
                                        <button className="btn-cancel" onClick={() => setIsEditingProfile(false)} style={{ flex: 1, marginTop: 0 }}><FontAwesomeIcon icon={faTimes} /> Batal</button>
                                    </>
                                ) : (
                                    <button className="btn-primary" onClick={() => setIsEditingProfile(true)} style={{ flex: 1 }}><FontAwesomeIcon icon={faPen} /> Edit Profil</button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};