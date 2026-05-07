import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAuth } from '../context/AuthContext';
import { getProgram, sendSokongDonation } from '../services/blockchain';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGift, faHeart, faMagnifyingGlass, faStar, faGamepad, faTheaterMasks, faMusic, faTimes, faComment, faRocket, faHandPointLeft, faUser, faUsers, faCoins } from "@fortawesome/free-solid-svg-icons";
import '../styles/DashboardPemberi.css';

const DUMMY_STREAMERS = [
    {
        id: 1,
        title: 'Donasi untuk Windah Basudara',
        description: 'Support streamer gaming terpopuler Indonesia! Setiap donasi membantu konten makin keren.',
        category: 'gaming',
        targetAmount: 10,
        raised: 7.2,
        donors: 142,
        avatarIcon: faGamepad,
        creator: 'Windah Basudara',
        platform: 'YouTube',
        followers: '8.2M',
        
    },
    {
        id: 2,
        title: 'Donasi untuk Jess No Limit',
        description: 'Support mobile legend streamer no limit! Bantuan kalian sangat berarti.',
        category: 'gaming',
        targetAmount: 8,
        raised: 3.5,
        donors: 87,
        avatarIcon: faGamepad,
        creator: 'Jess No Limit',
        platform: 'YouTube',
        followers: '6.1M',
        
    },
    {
        id: 3,
        title: 'Donasi untuk Kimi Hime',
        description: 'Support variety streamer seru! Konten gaming & hiburan setiap hari.',
        category: 'variety',
        targetAmount: 5,
        raised: 4.1,
        donors: 63,
        avatarIcon: faTheaterMasks,
        creator: 'Kimi Hime',
        platform: 'Twitch',
        followers: '2.3M',
        
    },
    {
        id: 4,
        title: 'Donasi untuk Reza Arap',
        description: 'Streamer multitalenta, dari gaming sampai musik. Support perjalanan kreatifnya!',
        category: 'variety',
        targetAmount: 6,
        raised: 1.9,
        donors: 34,
        avatarIcon: faTheaterMasks,
        creator: 'Reza Arap',
        platform: 'Twitch',
        followers: '1.8M',
        
    },
    {
        id: 5,
        title: 'Donasi untuk Aghanim',
        description: 'Streamer Dota 2 & variety content. Setiap donasi bikin stream makin epic!',
        category: 'gaming',
        targetAmount: 4,
        raised: 2.2,
        donors: 41,
        avatarIcon: faGamepad,
        creator: 'Aghanim',
        platform: 'YouTube',
        followers: '980K',
        
    },
    {
        id: 6,
        title: 'Donasi untuk Weird Genius',
        description: 'Support musisi & content creator berbakat Indonesia!',
        category: 'musik',
        targetAmount: 7,
        raised: 5.5,
        donors: 98,
        avatarIcon: faMusic,
        creator: 'Weird Genius',
        platform: 'YouTube',
        followers: '3.4M',
        
    },
    ];

    export const DashboardPemberi = ({ onSwitchRole }) => {
    const { user, logout } = useAuth();
    const { connected } = useWallet();
    const wallet = useWallet();
    const { connection } = useConnection();
    const [campaigns, setCampaigns] = useState(DUMMY_STREAMERS);
    const [donations, setDonations] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [donationAmount, setDonationAmount] = useState('');
    const [donationMessage, setDonationMessage] = useState('');
    const [filterCategory, setFilterCategory] = useState('semua');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogout = () => {
        logout();
        window.location.reload();
    };

    const handleDonate = async (e) => {
        e.preventDefault();
        if (!connected) {
            alert('Hubungkan wallet Solana kamu dulu!');
            return;
        }
        if (!donationAmount || !selectedCampaign) {
            alert('Pilih streamer dan jumlah donasi!');
            return;
        }

        try {
            setLoading(true);
            const program = getProgram(connection, wallet);
            const tx = await sendSokongDonation(program, parseFloat(donationAmount), donationMessage);

            alert(`Donasi ${donationAmount} SOL ke ${selectedCampaign.creator} berhasil! \nTX: ${tx}`);

            const updatedCampaigns = campaigns.map(c =>
                c.id === selectedCampaign.id
                    ? { ...c, raised: c.raised + parseFloat(donationAmount), donors: c.donors + 1 }
                    : c
            );
            setCampaigns(updatedCampaigns);

            setDonations([...donations, {
                id: Date.now(),
                campaignId: selectedCampaign.id,
                streamer: selectedCampaign.creator,
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
                alert('Transaksi gagal: Smart Contract belum di-deploy. Hubungi admin untuk informasi lebih lanjut.');
            } else if (errorMsg.includes('insufficient')) {
                alert('Transaksi gagal: Saldo SOL kamu tidak cukup untuk donasi.');
            } else {
                alert('Transaksi gagal atau ditolak dompet. Coba lagi atau lihat console untuk detail.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Filter + search
    const filteredCampaigns = campaigns.filter(c => {
        const matchCategory = filterCategory === 'semua' || c.category === filterCategory;
        const matchSearch = searchQuery === '' ||
        c.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSearch;
    });

    return (
        <div className="dashboard-pemberi">
        <header className="dashboard-header pemberi-header glass">
            <div className="header-left">
            <div className="logo"><span className="text-gradient">Sokong</span></div>
            <span className="user-role"><FontAwesomeIcon icon={faGift} /> Pemberi Donasi</span>
            </div>
            <div className="header-right">
            <span className="user-name"><FontAwesomeIcon icon={faUser} /> {user?.name}</span>
            <WalletMultiButton style={{ background: 'var(--sol-green)', color: '#000' }} />
            <button onClick={onSwitchRole} className="btn-switch-role">Switch Role</button>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
            </div>
        </header>

        <main className="dashboard-content">

            {/* Hero search */}
            <div className="search-hero">
            <h1 className="search-title">
                Support <span className="text-gradient">Streamer</span> Favoritmu
            </h1>
            <p className="search-subtitle">Kirim donasi SOL langsung ke wallet streamer pilihanmu</p>

            <div className={`search-bar-wrapper ${searchFocused ? 'focused' : ''}`}>
                <span className="search-icon"><FontAwesomeIcon icon={faMagnifyingGlass} /></span>
                <input
                type="text"
                className="search-bar"
                placeholder="Cari nama streamer, channel, atau kategori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                />
                {searchQuery && (
                <button className="search-clear" onClick={() => setSearchQuery('')}><FontAwesomeIcon icon={faTimes} /></button>
                )}
            </div>

            {/* Quick filter pills */}
            <div className="filter-pills">
                {['semua', 'gaming', 'variety', 'musik'].map(cat => (
                <button
                    key={cat}
                    className={`pill ${filterCategory === cat ? 'active' : ''}`}
                    onClick={() => setFilterCategory(cat)}
                >
                    {cat === 'semua' ? <><FontAwesomeIcon icon={faStar} /> Semua</> :
                    cat === 'gaming' ? <><FontAwesomeIcon icon={faGamepad} /> Gaming</> :
                    cat === 'variety' ? <><FontAwesomeIcon icon={faTheaterMasks} /> Variety</> : <><FontAwesomeIcon icon={faMusic} /> Musik</>}
                </button>
                ))}
            </div>
            </div>

            <div className="dashboard-layout">
            {/* Streamer List */}
            <section className="campaigns-section">
                <div className="section-header">
                <h2>
                    {searchQuery ? `Hasil untuk "${searchQuery}"` : 'Streamer Tersedia'}
                    <span className="result-count">{filteredCampaigns.length} streamer</span>
                </h2>
                </div>

                <div className="campaigns-list">
                {filteredCampaigns.length === 0 ? (
                    <div className="empty-state glass">
                    <div className="empty-icon"><FontAwesomeIcon icon={faMagnifyingGlass} /></div>
                    <p>Tidak ada streamer dengan nama "<strong>{searchQuery}</strong>"</p>
                    <button className="btn-secondary" onClick={() => { setSearchQuery(''); setFilterCategory('semua'); }}>
                        Reset pencarian
                    </button>
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
                        <div className="campaign-title-row">
                            <h3>{campaign.creator}</h3>
                            <span className={`platform-badge ${campaign.platform.toLowerCase()}`}>
                            {campaign.platform}
                            </span>
                        </div>
                        <p className="campaign-followers"><FontAwesomeIcon icon={faUsers} /> {campaign.followers} followers</p>
                        <p className="campaign-desc">{campaign.description}</p>
                        <div className="campaign-meta">
                            <span className="meta-item"><FontAwesomeIcon icon={faCoins} /> {campaign.raised} / {campaign.targetAmount} SOL</span>
                            <span className="meta-item"><FontAwesomeIcon icon={faGift} /> {campaign.donors} donatur</span>
                            <span className={`meta-item category ${campaign.category}`}>{campaign.category}</span>
                        </div>
                        <div className="progress-bar">
                            <div
                            className="progress-fill"
                            style={{ width: `${Math.min((campaign.raised / campaign.targetAmount) * 100, 100)}%` }}
                            />
                        </div>
                        </div>
                    </div>
                    ))
                )}
                </div>
            </section>

            {/* Donation Panel */}
            <aside className="donation-panel">
                {selectedCampaign ? (
                <div className="donation-card glass">
                    <h3>Kirim Donasi ke</h3>
                    <div className="selected-campaign-info">
                    <div className="streamer-avatar-lg"><FontAwesomeIcon icon={selectedCampaign.avatarIcon} /></div>
                    <div>
                        <p className="streamer-name-lg">{selectedCampaign.creator}</p>
                        <small>{selectedCampaign.platform} · {selectedCampaign.followers}</small>
                    </div>
                    </div>

                    {!connected && (
                    <div className="wallet-warning">
                        Hubungkan wallet dulu untuk donasi
                        <WalletMultiButton style={{ width: '100%', marginTop: '8px', justifyContent: 'center' }} />
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
                        <label><FontAwesomeIcon icon={faComment} /> Pesan untuk Streamer</label>
                        <textarea
                        placeholder="Tulis pesan semangatmu..."
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
                    <p>Pilih streamer untuk berdonasi</p>
                </div>
                )}

                {donations.length > 0 && (
                <div className="donation-history glass">
                    <h4>Riwayat Donasimu</h4>
                    <div className="history-list">
                    {donations.slice(-5).reverse().map(d => (
                        <div key={d.id} className="history-item">
                        <div>
                            <span className="history-streamer">{d.streamer}</span>
                            <span className="history-date">{d.date}</span>
                        </div>
                        <span className="history-amount">{d.amount} SOL</span>
                        </div>
                    ))}
                    </div>
                </div>
                )}
            </aside>
            </div>
        </main>
        </div>
    );
};