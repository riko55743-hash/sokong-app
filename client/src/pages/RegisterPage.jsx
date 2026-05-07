// src/pages/RegisterPage.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserAstronaut, faHandshakeAngle, faHandHoldingHeart } from "@fortawesome/free-solid-svg-icons";
import '../pages/Auth.css';

export function RegisterPage({ onSwitchToLogin }) {
    const { register } = useAuth();
    const [userType, setUserType] = useState("penerima");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        await register(name, email, password, userType);
    };

    return (
        <div className="auth-container">
            <div className="auth-brand">
                <span className="auth-brand-text">Sokong</span>
            </div>
            <div className="auth-card">
                <div className="auth-logo">
                <div className="auth-logo-icon"><FontAwesomeIcon icon={faUserAstronaut} /></div>
                <h2>Buat akun baru</h2>
                <p>Bergabung dengan platform donasi</p>
                </div>

                <p className="auth-section-label">Daftar sebagai</p>
                <div className="user-type-row">
                <button
                    className={`user-type-btn ${userType === "penerima" ? "selected" : ""}`}
                    onClick={() => setUserType("penerima")}
                    type="button"
                >
                    <span className="type-icon"><FontAwesomeIcon icon={faHandshakeAngle} /></span>
                    <span className="type-label">Penerima Donasi</span>
                    <span className="type-sub">Buat campaign donasi</span>
                </button>
                <button
                    className={`user-type-btn ${userType === "pemberi" ? "selected" : ""}`}
                    onClick={() => setUserType("pemberi")}
                    type="button"
                >
                    <span className="type-icon"><FontAwesomeIcon icon={faHandHoldingHeart} /></span>
                    <span className="type-label">Pemberi Donasi</span>
                    <span className="type-sub">Donasikan sekarang</span>
                </button>
                </div>

                <form onSubmit={handleRegister}>
                <label>Nama lengkap</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <label>Kata sandi</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit" className="btn-primary">Buat Akun</button>
                </form>

                <p className="auth-switch">
                Sudah punya akun? <span onClick={onSwitchToLogin}>Masuk di sini</span>
                </p>
            </div>
        </div>
    );
}