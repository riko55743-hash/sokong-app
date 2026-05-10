import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faHandshakeAngle, faGift, faRocket } from "@fortawesome/free-solid-svg-icons";
import '../styles/Auth.css';

export const CompleteProfile = ({ frozenKey }) => {
    const { registerWithWallet } = useAuth();
    const { connected } = useWallet();
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!frozenKey) {
            toast.error("Wallet tidak terdeteksi!");
            return;
        }
        if (!role) {
            toast.error("Pilih peran kamu (Creator atau Supporter)!");
            return;
        }
        
        try {
            setLoading(true);
            await registerWithWallet(frozenKey, username, name, email, role);
            toast.success("Profil berhasil dibuat!");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass" style={{ maxWidth: '500px', margin: '40px auto', padding: '40px', borderRadius: '24px' }}>
                <div className="auth-header" style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}><FontAwesomeIcon icon={faUser} /> Lengkapi Profil</h2>
                    <p style={{ color: '#aaa' }}>Halo! Wallet {frozenKey.slice(0, 4)}...{frozenKey.slice(-4)} belum terdaftar. Yuk lengkapi profil kamu.</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', color: '#ccc' }}>Username (Unik) <span style={{color: '#ff4757'}}>*</span></label>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Misal: satoshi_id" required style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', color: '#ccc' }}>Nama Tayangan / Display Name <span style={{color: '#ff4757'}}>*</span></label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nama yang akan dilihat orang lain" required style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', color: '#ccc' }}>Email (Opsional)</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Untuk notifikasi donasi" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', color: '#ccc' }}>Pilih Peran Utama <span style={{color: '#ff4757'}}>*</span></label>
                        <div className="role-selector" style={{ display: 'flex', gap: '15px' }}>
                            <button type="button" className={`role-btn ${role === 'penerima' ? 'active' : ''}`} onClick={() => setRole('penerima')} style={{ flex: 1, padding: '20px', borderRadius: '12px', background: role === 'penerima' ? 'rgba(153, 69, 255, 0.2)' : 'rgba(0,0,0,0.2)', border: role === 'penerima' ? '2px solid var(--sol-purple)' : '2px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                <FontAwesomeIcon icon={faHandshakeAngle} size="2x" style={{ color: role === 'penerima' ? 'var(--sol-purple)' : '#aaa' }} />
                                <span style={{ fontWeight: 'bold' }}>Creator</span>
                                <small style={{ color: '#aaa', fontSize: '0.75rem', textAlign: 'center' }}>Terima donasi & buat campaign</small>
                            </button>
                            <button type="button" className={`role-btn ${role === 'pemberi' ? 'active' : ''}`} onClick={() => setRole('pemberi')} style={{ flex: 1, padding: '20px', borderRadius: '12px', background: role === 'pemberi' ? 'rgba(20, 241, 149, 0.2)' : 'rgba(0,0,0,0.2)', border: role === 'pemberi' ? '2px solid var(--sol-green)' : '2px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                <FontAwesomeIcon icon={faGift} size="2x" style={{ color: role === 'pemberi' ? 'var(--sol-green)' : '#aaa' }} />
                                <span style={{ fontWeight: 'bold' }}>Supporter</span>
                                <small style={{ color: '#aaa', fontSize: '0.75rem', textAlign: 'center' }}>Kirim donasi ke creator</small>
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary auth-submit" disabled={loading || !role || !username || !name} style={{ width: '100%', padding: '15px', fontSize: '1.1rem', marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                        {loading ? 'Memproses...' : <><FontAwesomeIcon icon={faRocket} /> Daftar & Mulai</>}
                    </button>
                </form>
            </div>
        </div>
    );
};
