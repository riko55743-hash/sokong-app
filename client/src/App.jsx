import { useState } from "react";
import { Landing } from "./components/Landing";
import { DashboardPenerima } from "./components/DashboardPenerima";
import { DashboardPemberi } from "./components/DashboardPemberi";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import "./App.css";

function AppContent() {
  const { user, logout } = useAuth();
  const { connected } = useWallet();
  const [authScreen, setAuthScreen] = useState("login");
  const [currentRole, setCurrentRole] = useState(null);

  // Belum login → tampilkan auth
  if (!user) {
    return authScreen === "login" ? (
      <LoginPage onSwitchToRegister={() => setAuthScreen("register")} />
    ) : (
      <RegisterPage onSwitchToLogin={() => setAuthScreen("login")} />
    );
  }

  // Sudah login → tentukan role aktif
  const activeRole = currentRole || user.userType;

  const handleSwitchRole = () => {
    setCurrentRole(activeRole === "penerima" ? "pemberi" : "penerima");
  };

  // Wallet belum connect → Landing
  if (!connected) {
    return (
      <div className="app-container">
        <main className="main-content">
          <Landing onEnter={() => {}} />
        </main>
        <button
          onClick={logout}
          className="app-logout-btn"
        >
          <FontAwesomeIcon icon={faSignOutAlt} /> Logout
        </button>
      </div>
    );
  }

  // Wallet connect → Dashboard sesuai role
  return activeRole === "penerima" ? (
    <DashboardPenerima onSwitchRole={handleSwitchRole} />
  ) : (
    <DashboardPemberi onSwitchRole={handleSwitchRole} />
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;