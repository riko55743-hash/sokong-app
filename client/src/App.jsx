import React, { useState, useEffect, useRef } from "react";
import { Landing } from "./components/Landing";
import { DashboardPenerima } from "./components/DashboardPenerima";
import { DashboardPemberi } from "./components/DashboardPemberi";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faRocket } from "@fortawesome/free-solid-svg-icons";
import { Toaster, toast } from 'react-hot-toast';
import "./App.css";

const CompleteProfile = React.memo(({ frozenKey }) => {
  const auth = useAuth();
  const usernameRef = useRef(null);
  const displayNameRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = usernameRef.current?.value;
    const displayName = displayNameRef.current?.value;
    if (!username || !username.trim()) return toast.error("Username tidak boleh kosong.");
    if (!displayName || !displayName.trim()) return toast.error("Display name tidak boleh kosong.");

    try {
      setLoading(true);
      if (auth && auth.registerWithWallet && frozenKey) {
        await auth.registerWithWallet(username.trim(), displayName.trim(), frozenKey);
        toast.success("Akun berhasil dibuat!");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="glass" style={{ padding: '3rem', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>Selesaikan Profil</h2>
        <p style={{ color: '#aaa', marginBottom: '2rem' }}>Pilih username dan display name untuk akun Web3 kamu.</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              name="sokong_username_reg"
              autoComplete="off"
              placeholder="Username_unik"
              ref={usernameRef}
              style={{ padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '1.1rem', width: '100%', boxSizing: 'border-box' }}
              required
            />
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              name="sokong_display_name_reg"
              autoComplete="off"
              placeholder="Display Name"
              ref={displayNameRef}
              style={{ padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '1.1rem', width: '100%', boxSizing: 'border-box' }}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Memproses..." : "Lanjutkan"}
          </button>
        </form>
      </div>
    </div>
  );
});

function AppContent() {
  const { user, logout, loginWithWallet } = useAuth();
  const { connected, publicKey, disconnect, wallet, connecting } = useWallet();
  const [authScreen, setAuthScreen] = useState("login");
  const [currentRole, setCurrentRole] = useState(null);
  const [forceRender, setForceRender] = useState(0);

  // SESSION FREEZE LOGIC
  const [frozenPublicKey, setFrozenPublicKey] = useState(null);

  useEffect(() => {
    if (publicKey && !frozenPublicKey) {
      setFrozenPublicKey(publicKey.toString());
    }
  }, [publicKey, frozenPublicKey]);

  useEffect(() => {
    if (!user) {
      setCurrentRole(null);
    } else {
      setFrozenPublicKey(null); // Clear freeze when session established
    }
  }, [user]);

  // Wallet Connection & Disconnection Hook
  useEffect(() => {
    if (connected && publicKey) {
      if (!user) {
        // Attempt to login with wallet
        loginWithWallet(publicKey.toString());
      } else if (user.walletAddress !== publicKey.toString()) {
        // Mismatch! Security Lockout
        toast.error("Akses Ditolak: Wallet ini tidak cocok dengan sesi. Sesi dihentikan demi keamanan.");
        disconnect();
        logout();
      }
    } else if (!connected && user && !connecting) {
      // Security: If wallet is manually disconnected in extension, logout immediately.
      // We use a timeout to prevent race conditions during page refresh (auto-connect delay)
      const timeout = setTimeout(() => {
        toast('Wallet disconnected. Sesi diakhiri.', { icon: '🔒' });
        logout();
        setTimeout(() => window.location.reload(), 1500);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [connected, publicKey, user, connecting]);

  const activeRole = currentRole || "supporter";

  const handleSwitchRoleRequest = () => {
    setCurrentRole(activeRole === "creator" ? "supporter" : "creator");
  };

  // The Ultimate Anchor: If user exists, their walletAddress is the absolute source of truth.
  // This prevents the "rug-pull" redirect when frozenPublicKey is cleared during registration.
  const activePublicKey = user?.walletAddress || (publicKey ? publicKey.toString() : frozenPublicKey);

  if (!activePublicKey) {
    return (
      <div className="app-container">
        <main className="main-content">
          <Landing onEnter={() => setForceRender(prev => prev + 1)} />
        </main>
      </div>
    );
  }

  if (activePublicKey && !user) {
    return <CompleteProfile frozenKey={activePublicKey} />;
  }

  return (
    <>
      {activeRole === "creator" ? (
        <DashboardPenerima onSwitchRole={handleSwitchRoleRequest} />
      ) : (
        <DashboardPemberi onSwitchRole={handleSwitchRoleRequest} />
      )}
    </>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error (Silently recovering):", error, errorInfo);
    // Silent Hard Reset restored to prevent Blank Screen deadlock
    localStorage.clear();
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return null; // Silently unmount while window reloads
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Toaster position="top-center" toastOptions={{ style: { background: 'rgba(15, 15, 20, 0.9)', color: '#fff', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px', fontSize: '0.95rem', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' } }} />
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;