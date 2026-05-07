// src/components/DashboardPenerima.jsx
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins, faGift, faClipboard, faCircle, faUsers, faMicrophone, faHandshakeAngle, faExclamationTriangle, faGamepad, faTheaterMasks, faMusic, faBook, faTimes, faStar, faRocket, faStop, faTrash, faPen, faCheck } from '@fortawesome/free-solid-svg-icons';
import '../styles/DashboardPenerima.css';

export const DashboardPenerima = ({ onSwitchRole }) => {
    const { user, logout } = useAuth();
    const { connected } = useWallet();
    const [campaigns, setCampaigns] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState('campaigns');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        targetAmount: '',
        category: 'gaming',
        platform: 'YouTube',
        streamUrl: '',
    });

    const [donations] = useState([
        { id: 1, donor: 'Anonymous', amount: 0.5, message: 'Semangat streamnya!', date: '07/05/2026' },
        { id: 2, donor: 'Budi123', amount: 1.2, message: 'Keep it up bro!', date: '06/05/2026' },
        { id: 3, donor: 'SitiGamer', amount: 0.3, message: 'GG streamer!', date: '05/05/2026' },
    ]);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        photoUrl: user?.photoUrl || '',
        newPassword: '',
        confirmPassword: '',
    });

    const totalRaised = campaigns.reduce((sum, c) => sum + c.raised, 0);
    const totalDonors = campaigns.reduce((sum, c) => sum + c.donors, 0);
    const totalCampaigns = campaigns.length;

    const handleLogout = () => {
        logout();
        window.location.reload();
    };

    const handleCreateCampaign = (e) => {
        e.preventDefault();
        const newCampaign = {
        ...formData,
        id: Date.now(),
        raised: 0,
        donors: 0,
        isLive: false,
        createdAt: new Date().toLocaleDateString('id-ID'),
        };
        setCampaigns([...campaigns, newCampaign]);
        setFormData({ title: '', description: '', targetAmount: '', category: 'gaming', platform: 'YouTube', streamUrl: '' });
        setShowForm(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggleLive = (id) => {
        setCampaigns(campaigns.map(c => c.id === id ? { ...c, isLive: !c.isLive } : c));
    };

    const handleDeleteCampaign = (id) => {
        if (window.confirm('Hapus campaign ini?')) {
        setCampaigns(campaigns.filter(c => c.id !== id));
        }
    };

    const handleProfileInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = () => {
        setIsEditingProfile(false);
        alert('Profil berhasil disimpan!');
    };


    const categoryIcon = { gaming: faGamepad, variety: faTheaterMasks, musik: faMusic, edukasi: faBook };

    return (
        <div className="dashboard-penerima">
        {/* Header */}
        <header className="dp-header glass">
            <div className="dp-header-left">
            <div className="dp-logo"><span className="text-gradient">Sokong</span></div>
            <span className="dp-role-badge"><FontAwesomeIcon icon={faHandshakeAngle} /> Penerima Donasi</span>
            </div>
            <div className="dp-header-right">
            <span className="dp-username"><FontAwesomeIcon icon={faUsers} /> {user?.name}</span>
            <WalletMultiButton style={{ background: 'var(--sol-purple)' }} />
            <button onClick={onSwitchRole} className="dp-btn-switch">Switch Role</button>
            <button onClick={handleLogout} className="dp-btn-logout">Logout</button>
            </div>
        </header>

        <main className="dp-main">
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
                <p className="dp-stat-label">Total Donatur</p>
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

            {/* Wallet warning */}
            {!connected && (
            <div className="dp-wallet-warning glass">
                <span><FontAwesomeIcon icon={faExclamationTriangle} /> Hubungkan wallet Solana untuk menerima donasi</span>
                <WalletMultiButton style={{ background: 'var(--sol-purple)' }} />
            </div>
            )}

            {/* Tabs */}
            <div className="dp-tabs">
            <button className={`dp-tab ${activeTab === 'campaigns' ? 'active' : ''}`} onClick={() => setActiveTab('campaigns')}><FontAwesomeIcon icon={faClipboard} /> Campaign Saya</button>
            <button className={`dp-tab ${activeTab === 'donations' ? 'active' : ''}`} onClick={() => setActiveTab('donations')}><FontAwesomeIcon icon={faGift} /> Donasi Masuk</button>
            <button className={`dp-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>⚙️ Profil Penerima</button>
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

                {/* Form */}
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
                        <select name="platform" value={formData.platform} onChange={handleInputChange}>
                            <option value="YouTube">YouTube</option>
                            <option value="Twitch">Twitch</option>
                            <option value="TikTok">TikTok</option>
                            <option value="Instagram">Instagram</option>
                        </select>
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
                        <select name="category" value={formData.category} onChange={handleInputChange}>
                            <option value="gaming">Gaming</option>
                            <option value="variety">Variety</option>
                            <option value="musik">Musik</option>
                            <option value="edukasi">Edukasi</option>
                        </select>
                        </div>
                    </div>

                    <div className="dp-form-group">
                        <label>Link Channel / Stream (opsional)</label>
                        <input type="url" name="streamUrl" value={formData.streamUrl} onChange={handleInputChange} placeholder="https://youtube.com/..." />
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '13px' }}>
                        <FontAwesomeIcon icon={faRocket} /> Buat Campaign
                    </button>
                    </form>
                </div>
                )}

                {/* Campaign list */}
                {campaigns.length === 0 ? (
                <div className="dp-empty glass">
                    <div className="dp-empty-icon"><FontAwesomeIcon icon={faMicrophone} /></div>
                    <h3>Belum ada campaign</h3>
                    <p>Buat campaign pertamamu dan mulai terima donasi dari para supporter!</p>
                    <button onClick={() => setShowForm(true)} className="btn-primary">+ Buat Campaign Sekarang</button>
                </div>
                ) : (
                <div className="dp-campaigns-grid">
                    {campaigns.map(campaign => (
                    <div key={campaign.id} className="dp-campaign-card glass">
                        <div className="dp-campaign-card-header">
                        <div className="dp-campaign-icon"><FontAwesomeIcon icon={categoryIcon[campaign.category] || faGamepad} /></div>
                        <div className="dp-campaign-badges">
                            <span className={`dp-platform-badge ${campaign.platform.toLowerCase()}`}>{campaign.platform}</span>
                            {campaign.isLive && <span className="dp-live-badge"><FontAwesomeIcon icon={faCircle} /> LIVE</span>}
                        </div>
                        </div>

                        <h3 className="dp-campaign-title">{campaign.title}</h3>
                        <p className="dp-campaign-desc">{campaign.description.substring(0, 80)}...</p>

                        <div className="dp-campaign-progress">
                        <div className="dp-progress-info">
                            <span>{campaign.raised} SOL terkumpul</span>
                            <span>{campaign.targetAmount} SOL target</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${Math.min((campaign.raised / campaign.targetAmount) * 100, 100)}%` }} />
                        </div>
                        <p className="dp-progress-pct">{Math.round((campaign.raised / campaign.targetAmount) * 100)}% tercapai · {campaign.donors} donatur</p>
                        </div>

                        <div className="dp-campaign-actions">
                        <button
                            className={`dp-btn-live ${campaign.isLive ? 'live' : ''}`}
                            onClick={() => handleToggleLive(campaign.id)}
                        >
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
                <span className="dp-badge">{donations.length} donasi</span>
                </div>

                <div className="dp-donations-list">
                {donations.map(d => (
                    <div key={d.id} className="dp-donation-item glass">
                    <div className="dp-donation-avatar">
                        {d.donor === 'Anonymous' ? <FontAwesomeIcon icon={faTheaterMasks} /> : d.donor[0].toUpperCase()}
                    </div>
                    <div className="dp-donation-info">
                        <p className="dp-donation-donor">{d.donor}</p>
                        <p className="dp-donation-message">"{d.message}"</p>
                        <p className="dp-donation-date">{d.date}</p>
                    </div>
                    <div className="dp-donation-amount">
                        <span>{d.amount} SOL</span>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            )}

            {/* Tab: Profil */}
            {activeTab === 'profile' && (
                <div className="dp-section">
                    <div className="dp-section-header">
                    <h2>Profil Streamer</h2>
                    </div>

                    {/* Avatar & Info Card */}
                    <div className="dp-profile-card glass">
                    {/* Foto Profil */}
                    <div className="dp-profile-avatar-wrapper">
                        <div className="dp-avatar-ring" onClick={() => document.getElementById('photo-input').click()}>
                        {profileData.photoUrl ? (
                            <img src={profileData.photoUrl} alt="avatar" className="dp-avatar-img" />
                        ) : (
                            <div className="dp-avatar-initials">
                            {profileData.name?.[0]?.toUpperCase() || '?'}
                            </div>
                        )}
                        <div className="dp-avatar-overlay">
                            <FontAwesomeIcon icon={faPen} />
                        </div>
                        </div>
                        <input
                        id="photo-input"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                            const url = URL.createObjectURL(file);
                            setProfileData(prev => ({ ...prev, photoUrl: url }));
                            }
                        }}
                        />
                        <p className="dp-avatar-hint">Klik foto untuk mengubah</p>
                    </div>

                    {/* Form Edit */}
                    <div className="dp-profile-fields">
                        {/* Nama */}
                        <div className="dp-form-group">
                        <label>Nama</label>
                        {isEditingProfile ? (
                            <input
                            type="text"
                            name="name"
                            value={profileData.name}
                            onChange={handleProfileInputChange}
                            placeholder="Nama kamu..."
                            />
                        ) : (
                            <p className="dp-profile-value">{profileData.name || '-'}</p>
                        )}
                        </div>

                        {/* Email */}
                        <div className="dp-form-group">
                        <label>Email</label>
                        {isEditingProfile ? (
                            <input
                            type="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleProfileInputChange}
                            placeholder="email@kamu.com"
                            />
                        ) : (
                            <p className="dp-profile-value">{profileData.email || '-'}</p>
                        )}
                        </div>

                        {/* Ubah Password — hanya tampil saat edit */}
                        {isEditingProfile && (
                        <>
                            <div className="dp-form-group">
                            <label>Password Baru <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>(opsional)</span></label>
                            <input
                                type="password"
                                name="newPassword"
                                value={profileData.newPassword || ''}
                                onChange={handleProfileInputChange}
                                placeholder="Kosongkan jika tidak ingin ubah"
                            />
                            </div>
                            <div className="dp-form-group">
                            <label>Konfirmasi Password Baru</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={profileData.confirmPassword || ''}
                                onChange={handleProfileInputChange}
                                placeholder="Ulangi password baru"
                            />
                            </div>
                        </>
                        )}

                        {/* Wallet */}
                        <div className="dp-form-group">
                        <label>Wallet Solana</label>
                        {connected ? (
                            <WalletMultiButton style={{ background: 'var(--sol-purple)' }} />
                        ) : (
                            <div>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Belum terhubung</p>
                            <WalletMultiButton style={{ background: 'var(--sol-purple)' }} />
                            </div>
                        )}
                        </div>

                        {/* Action Buttons */}
                        <div className="dp-profile-actions">
                        {isEditingProfile ? (
                            <>
                            <button
                                className="btn-primary"
                                onClick={() => {
                                if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
                                    alert('Password baru tidak cocok!');
                                    return;
                                }
                                handleSaveProfile();
                                }}
                            >
                                <FontAwesomeIcon icon={faCheck} /> Simpan Perubahan
                            </button>
                            <button
                                className="dp-btn-cancel"
                                onClick={() => setIsEditingProfile(false)}
                            >
                                <FontAwesomeIcon icon={faTimes} /> Batal
                            </button>
                            </>
                        ) : (
                            <button
                            className="btn-primary"
                            onClick={() => setIsEditingProfile(true)}
                            >
                            <FontAwesomeIcon icon={faPen} /> Edit Profil
                            </button>
                        )}
                        </div>
                    </div>
                    </div>
                </div>
            )}
        </main>
        </div>
    );
};