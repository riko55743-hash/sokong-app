// src/components/DashboardPenerima.jsx
import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { SokongWalletButton } from './SokongWalletButton';
import { SearchableDropdown } from './SearchableDropdown';
import { useAuth } from '../context/AuthContext';
import { getProgram, initializeState, checkIfInitialized } from '../services/blockchain';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins, faGift, faClipboard, faCircle, faUsers, faMicrophone, faHandshakeAngle, faExclamationTriangle, faGamepad, faTheaterMasks, faMusic, faBook, faTimes, faStar, faRocket, faStop, faTrash, faPen, faCheck, faServer } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';
import '../styles/DashboardPenerima.css';

export const DashboardPenerima = ({ onSwitchRole }) => {
    const { user, logout, updateProfile } = useAuth();
    const { connected, publicKey } = useWallet();
    const wallet = useWallet();
    const { connection } = useConnection();

    const [isInitialized, setIsInitialized] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [initLoading, setInitLoading] = useState(false);

    const [campaigns, setCampaigns] = useState(Array.isArray(user?.campaigns) ? user.campaigns : []);
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState('campaigns');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        targetAmount: '',
        category: 'DeFi',
        customCategory: '',
        platform: 'Blinks',
        customPlatform: '',
        streamUrl: '',
    });

    const [donations, setDonations] = useState(Array.isArray(user?.donations) ? user.donations : []);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        username: user?.username || '',
        name: user?.name || user?.username || '',
        email: user?.email || '',
        photoUrl: user?.photoUrl || '',
    });

    const totalRaised = campaigns.reduce((sum, c) => sum + (c.raised || 0), 0);
    const totalDonors = campaigns.reduce((sum, c) => sum + (c.donors || 0), 0);
    const totalCampaigns = campaigns.length;

    useEffect(() => {
        if (connected && wallet) {
            const checkInit = async () => {
                setIsChecking(true);
                try {
                    const program = getProgram(connection, wallet);
                    const status = await checkIfInitialized(program);
                    setIsInitialized(status);
                } catch (err) {
                    console.error(err);
                } finally {
                    setIsChecking(false);
                }
            };
            checkInit();
        }
    }, [connected, connection, wallet]);

    const handleInitialize = async () => {
        if (!connected) return toast.error("Please connect wallet first!");
        try {
            setInitLoading(true);
            const program = getProgram(connection, wallet);
            const result = await initializeState(program);
            if (result === "ALREADY_INITIALIZED") {
                toast('Vault is already initialized on Devnet!', { icon: 'ℹ️' });
                setIsInitialized(true);
            } else {
                toast.success(`Initialization Success! TX: ${result}`);
                setIsInitialized(true);
            }
        } catch (error) {
            toast.error(`Initialization failed. See console. ${error.message}`);
            console.error(error);
        } finally {
            setInitLoading(false);
        }
    };

    const handleLogout = async () => {
        if (wallet) {
            await wallet.disconnect();
        }
    };

    const handleCreateCampaign = (e) => {
        e.preventDefault();
        const newCampaign = {
            ...formData,
            platform: formData.platform === 'Other' ? formData.customPlatform : formData.platform,
            category: formData.category === 'Other' ? formData.customCategory : formData.category,
            id: Date.now(),
            raised: 0,
            donors: 0,
            isLive: false,
            createdAt: new Date().toLocaleDateString('id-ID'),
        };
        const updatedCampaigns = [...campaigns, newCampaign];
        setCampaigns(updatedCampaigns);
        updateProfile({ campaigns: updatedCampaigns });
        setFormData({ title: '', description: '', targetAmount: '', category: 'DeFi', customCategory: '', platform: 'Blinks', customPlatform: '', streamUrl: '' });
        setShowForm(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggleLive = (id) => {
        const updated = campaigns.map(c => c.id === id ? { ...c, isLive: !c.isLive } : c);
        setCampaigns(updated);
        updateProfile({ campaigns: updated });
    };

    const handleDeleteCampaign = (id) => {
        if (window.confirm('Hapus campaign ini?')) {
            const updated = campaigns.filter(c => c.id !== id);
            setCampaigns(updated);
            updateProfile({ campaigns: updated });
        }
    };

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

    const categoryIcon = {
        gaming: faGamepad, variety: faTheaterMasks, musik: faMusic, edukasi: faBook,
        defi: faCoins, gamefi: faGamepad, 'rwa (real world assets)': faBook,
        'consumer apps': faUsers, infrastructure: faServer, 'nft/digital collectibles': faStar, daos: faUsers
    };

    const getIconForCategory = (cat) => {
        return categoryIcon[(cat || '').toLowerCase()] || faStar;
    };

    return (
        <div className="dashboard-penerima">
            <header className="dp-header glass">
                <div className="dp-header-left">
                    <div className="dp-logo"><span className="text-gradient">Sokong</span></div>
                    <span className="dp-role-badge"><FontAwesomeIcon icon={faHandshakeAngle} /> Creator</span>
                </div>
                <div className="dp-header-right">
                    <span className="dp-username"><FontAwesomeIcon icon={faUsers} /> @{user?.username}</span>
                    <SokongWalletButton style={{ background: 'var(--sol-purple)' }} />
                    <button onClick={onSwitchRole} className="dp-btn-switch">Switch Role</button>
                    <button onClick={handleLogout} className="dp-btn-logout">Logout</button>
                </div>
            </header>

            <main className="dp-main">
                {!connected ? (
                    <div className="dp-wallet-warning glass" style={{ textAlign: 'center', padding: '40px' }}>
                        <FontAwesomeIcon icon={faExclamationTriangle} size="3x" style={{ color: 'var(--sol-green)', marginBottom: '20px' }} />
                        <h2>Akses Diblokir</h2>
                        <p style={{ marginBottom: '20px' }}>Silakan hubungkan Wallet Phantom Anda untuk mengakses Dashboard Creator.</p>
                        <SokongWalletButton style={{ background: 'var(--sol-purple)', margin: '0 auto' }} />
                    </div>
                ) : (
                    <>
                        {/* Vault Initialization Check */}
                        {!isInitialized && !isChecking && (
                            <div className="dp-wallet-warning glass" style={{ borderLeft: '4px solid #ff4757' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    <div>
                                        <h3 style={{ color: '#ff4757', marginBottom: '8px' }}><FontAwesomeIcon icon={faServer} /> Vault Belum Diinisialisasi</h3>
                                        <p style={{ fontSize: '0.9rem', color: '#ccc' }}>Anda harus menginisialisasi Vault State di jaringan Solana Devnet agar dapat menerima donasi.</p>
                                    </div>
                                    <button onClick={handleInitialize} disabled={initLoading} className="btn-primary" style={{ background: '#ff4757', boxShadow: 'none' }}>
                                        {initLoading ? "Processing..." : "Initialize Vault State"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Stats */}
                        <div className="dp-stats-row">
                            <div className="dp-stat-card glass">
                                <span className="dp-stat-icon"><FontAwesomeIcon icon={faCoins} /></span>
                                <div>
                                    <p className="dp-stat-label">Total Terkumpul</p>
                                    <p className="dp-stat-value text-gradient">{totalRaised.toFixed(2)} SOL</p>
                                </div>
                            </div>
                            <div className="dp-stat-card glass">
                                <span className="dp-stat-icon"><FontAwesomeIcon icon={faGift} /></span>
                                <div>
                                    <p className="dp-stat-label">Total Supporter</p>
                                    <p className="dp-stat-value">{totalDonors}</p>
                                </div>
                            </div>
                            <div className="dp-stat-card glass">
                                <span className="dp-stat-icon"><FontAwesomeIcon icon={faClipboard} /></span>
                                <div>
                                    <p className="dp-stat-label">Campaign Aktif</p>
                                    <p className="dp-stat-value">{totalCampaigns}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="dp-tabs">
                            <button className={`dp-tab ${activeTab === 'campaigns' ? 'active' : ''}`} onClick={() => setActiveTab('campaigns')}><FontAwesomeIcon icon={faClipboard} /> Campaign Saya</button>
                            <button className={`dp-tab ${activeTab === 'donations' ? 'active' : ''}`} onClick={() => setActiveTab('donations')}><FontAwesomeIcon icon={faGift} /> Donasi Masuk</button>
                            <button className={`dp-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>⚙️ Profil Saya</button>
                        </div>

                        {/* Tab: Campaigns */}
                        {activeTab === 'campaigns' && (
                            <div className="dp-section">
                                <div className="dp-section-header">
                                    <h2>Campaign Saya</h2>
                                    <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                                        {showForm ? <><FontAwesomeIcon icon={faTimes} /> Batal</> : <>+ Buat Campaign</>}
                                    </button>
                                </div>

                                {showForm && (
                                    <div className="dp-form-card glass">
                                        <h3><FontAwesomeIcon icon={faStar} /> Campaign Baru</h3>
                                        <form onSubmit={handleCreateCampaign}>
                                            <div className="dp-form-row">
                                                <div className="dp-form-group">
                                                    <label>Judul Campaign</label>
                                                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Donasi untuk stream saya..." required />
                                                </div>
                                                <div className="dp-form-group">
                                                    <label>Platform</label>
                                                    <SearchableDropdown
                                                        name="platform"
                                                        options={['Blinks', 'X (Twitter)', 'YouTube', 'Twitch', 'TikTok', 'Instagram', 'Farcaster', 'Lens', 'Other']}
                                                        value={formData.platform}
                                                        onChange={handleInputChange}
                                                        placeholder="Pilih Platform"
                                                    />
                                                    {formData.platform === 'Other' && (
                                                        <input 
                                                            type="text" 
                                                            name="customPlatform" 
                                                            placeholder="Masukkan platform..." 
                                                            onChange={handleInputChange} 
                                                            value={formData.customPlatform || ''}
                                                            style={{ marginTop: '10px' }}
                                                            required
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="dp-form-group">
                                                <label>Deskripsi</label>
                                                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Ceritakan tentang stream kamu..." rows="4" required />
                                            </div>

                                            <div className="dp-form-row">
                                                <div className="dp-form-group">
                                                    <label>Target Donasi (SOL)</label>
                                                    <input type="number" name="targetAmount" value={formData.targetAmount} onChange={handleInputChange} placeholder="5.0" step="0.1" min="0.1" required />
                                                </div>
                                                <div className="dp-form-group">
                                                    <label>Kategori</label>
                                                    <SearchableDropdown
                                                        name="category"
                                                        options={['DeFi', 'GameFi', 'RWA (Real World Assets)', 'Consumer Apps', 'Infrastructure', 'NFT/Digital Collectibles', 'DAOs', 'Gaming', 'Variety', 'Musik', 'Edukasi', 'Other']}
                                                        value={formData.category}
                                                        onChange={handleInputChange}
                                                        placeholder="Pilih Kategori"
                                                    />
                                                    {formData.category === 'Other' && (
                                                        <input 
                                                            type="text" 
                                                            name="customCategory" 
                                                            placeholder="Masukkan kategori..." 
                                                            onChange={handleInputChange} 
                                                            value={formData.customCategory || ''}
                                                            style={{ marginTop: '10px' }}
                                                            required
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '13px' }}>
                                                <FontAwesomeIcon icon={faRocket} /> Buat Campaign
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {campaigns.length === 0 ? (
                                    <div className="dp-empty glass">
                                        <div className="dp-empty-icon"><FontAwesomeIcon icon={faMicrophone} /></div>
                                        <h3>Belum ada campaign</h3>
                                        <p>Buat campaign pertamamu dan mulai terima donasi dari para patron!</p>
                                        <button onClick={() => setShowForm(true)} className="btn-primary">+ Buat Campaign Sekarang</button>
                                    </div>
                                ) : (
                                    <div className="dp-campaigns-grid">
                                        {campaigns.map(campaign => (
                                            <div key={campaign.id} className="dp-campaign-card glass">
                                                <div className="dp-campaign-card-header">
                                                    <div className="dp-campaign-icon"><FontAwesomeIcon icon={getIconForCategory(campaign.category)} /></div>
                                                    <div className="dp-campaign-badges">
                                                        <span className={`dp-platform-badge ${(campaign.platform || '').toLowerCase()}`}>{campaign.platform || 'Unknown'}</span>
                                                        {campaign.isLive && <span className="dp-live-badge"><FontAwesomeIcon icon={faCircle} /> LIVE</span>}
                                                    </div>
                                                </div>

                                                <h3 className="dp-campaign-title">{campaign.title}</h3>
                                                <p className="dp-campaign-desc">{campaign.description.substring(0, 80)}...</p>

                                                <div className="dp-campaign-progress">
                                                    <div className="dp-progress-info">
                                                        <span style={{ fontWeight: 'bold' }}>{campaign.raised || 0} / {campaign.targetAmount} SOL <span style={{ fontWeight: 'normal', color: '#aaa' }}>terkumpul</span></span>
                                                    </div>
                                                    <div className="progress-bar">
                                                        <div className="progress-fill" style={{ width: `${Math.min((campaign.raised / campaign.targetAmount) * 100, 100)}%` }} />
                                                    </div>
                                                </div>

                                                <div className="dp-campaign-actions">
                                                    <button className={`dp-btn-live ${campaign.isLive ? 'live' : ''}`} onClick={() => handleToggleLive(campaign.id)}>
                                                        {campaign.isLive ? <><FontAwesomeIcon icon={faStop} /> Stop Live</> : <><FontAwesomeIcon icon={faCircle} /> Go Live</>}
                                                    </button>
                                                    <button className="dp-btn-delete" onClick={() => handleDeleteCampaign(campaign.id)}><FontAwesomeIcon icon={faTrash} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab: Donasi Masuk */}
                        {activeTab === 'donations' && (
                            <div className="dp-section">
                                <div className="dp-section-header">
                                    <h2>Donasi Masuk</h2>
                                </div>
                                <div className="dp-donations-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {donations.length === 0 ? (
                                        <div className="dp-empty glass">
                                            <div className="dp-empty-icon"><FontAwesomeIcon icon={faGift} /></div>
                                            <h3>Belum ada donasi</h3>
                                            <p>Campaign kamu belum menerima dukungan. Bagikan link stream kamu!</p>
                                        </div>
                                    ) : donations.map(d => (
                                        <div key={d.id} className="dp-donation-item glass" style={{ display: 'flex', alignItems: 'flex-start', padding: '1rem 1.2rem', borderRadius: '12px', gap: '1rem', background: 'linear-gradient(145deg, rgba(20,20,30,0.8) 0%, rgba(10,10,15,0.6) 100%)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div className="dp-donation-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--sol-purple), var(--sol-green))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', flexShrink: 0 }}>
                                                {(d.donorName || d.donor)[0].toUpperCase()}
                                            </div>
                                            <div className="dp-donation-info" style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>{d.donorName || d.donor}</h3>
                                                    <span style={{ fontSize: '0.85rem', color: '#aaa', fontStyle: 'italic' }}>@{d.donor}</span>
                                                    {d.isEarlyBird && <span style={{ background: 'linear-gradient(90deg, var(--sol-green), var(--sol-purple))', color: '#000', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', boxShadow: '0 0 10px rgba(20, 241, 149, 0.2)' }}>Early Bird</span>}
                                                    <span style={{ background: 'rgba(20, 241, 149, 0.1)', color: 'var(--sol-green)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 'bold', marginLeft: 'auto', border: '1px solid rgba(20, 241, 149, 0.2)' }}>{d.amount} SOL</span>
                                                </div>
                                                <p className="dp-donation-message" style={{ margin: '0 0 6px 0', fontSize: '0.95rem', color: '#ddd', lineHeight: '1.4', wordBreak: 'break-word' }}>"{d.message}"</p>
                                                <p className="dp-donation-date" style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Time Capsule • {d.date}{d.campaignTitle ? ` • ${d.campaignTitle}` : ''}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tab: Profil */}
                        {activeTab === 'profile' && (
                            <div className="dp-section">
                                <div className="dp-section-header"><h2>Profil Saya</h2></div>
                                <div className="dp-profile-card glass">
                                    <div className="dp-profile-fields">
                                        <div className="dp-form-group">
                                            <label>Username (Unik) <span style={{ color: '#ff4757' }}>*</span></label>
                                            {isEditingProfile ? (
                                                <input type="text" name="username" value={profileData.username} onChange={handleProfileInputChange} placeholder="username_unik" required />
                                            ) : (<p className="dp-profile-value">@{profileData.username}</p>)}
                                        </div>

                                        <div className="dp-form-group">
                                            <label>Nama / Display Name</label>
                                            {isEditingProfile ? (
                                                <input type="text" name="name" value={profileData.name} onChange={handleProfileInputChange} placeholder="Nama tayangan kamu..." />
                                            ) : (<p className="dp-profile-value">{profileData.name || '-'}</p>)}
                                        </div>

                                        <div className="dp-form-group">
                                            <label>Wallet Solana Aktif</label>
                                            <SokongWalletButton style={{ background: 'var(--sol-purple)' }} />
                                        </div>

                                        <div className="dp-profile-actions">
                                            {isEditingProfile ? (
                                                <>
                                                    <button className="btn-primary" onClick={handleSaveProfile}><FontAwesomeIcon icon={faCheck} /> Simpan</button>
                                                    <button className="dp-btn-cancel" onClick={() => setIsEditingProfile(false)}><FontAwesomeIcon icon={faTimes} /> Batal</button>
                                                </>
                                            ) : (
                                                <button className="btn-primary" onClick={() => setIsEditingProfile(true)}><FontAwesomeIcon icon={faPen} /> Edit Profil</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};