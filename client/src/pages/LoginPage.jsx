// src/pages/LoginPage.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserAstronaut, faHandshakeAngle, faHandHoldingHeart } from "@fortawesome/free-solid-svg-icons";
import '../pages/Auth.css';

export function LoginPage({ onSwitchToRegister }) {
    const { login } = useAuth();
    const [userType, setUserType] = useState("penerima");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
        await login(email, password, userType);
        } catch (err) {
        setError("Email atau kata sandi salah.");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-brand">
                <span className="auth-brand-text">Sokong</span>
            </div>
            <div className="auth-card">
                <div className="auth-logo">
                <div className="auth-logo-icon"><FontAwesomeIcon icon={faUserAstronaut} /></div>
                <h2>Selamat datang kembali</h2>
                <p>Masuk ke akun Anda</p>
                </div>

                <p className="auth-section-label">Masuk sebagai</p>
                <div className="user-type-row">
                <button
                    className={`user-type-btn ${userType === "penerima" ? "selected" : ""}`}
                    onClick={() => setUserType("penerima")}
                    type="button"
                >
                    <span className="type-icon"><FontAwesomeIcon icon={faHandshakeAngle} /></span>
                    <span className="type-label">Penerima Donasi</span>
                    <span className="type-sub">Saya mencari bantuan</span>
                </button>
                <button
                    className={`user-type-btn ${userType === "pemberi" ? "selected" : ""}`}
                    onClick={() => setUserType("pemberi")}
                    type="button"
                >
                    <span className="type-icon"><FontAwesomeIcon icon={faHandHoldingHeart} /></span>
                    <span className="type-label">Pemberi Donasi</span>
                    <span className="type-sub">Saya ingin berdonasi</span>
                </button>
                </div>

                <form onSubmit={handleLogin}>
                <label>Email</label>
                <input
                    type="email"
                    placeholder="contoh@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <label>Kata sandi</label>
                <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {error && <p className="auth-error">{error}</p>}
                <button type="submit" className="btn-primary">Masuk</button>
                </form>

                <p className="auth-switch">
                Belum punya akun?{" "}
                <span onClick={onSwitchToRegister}>Daftar sekarang</span>
                </p>
            </div>
        </div>
    );
}