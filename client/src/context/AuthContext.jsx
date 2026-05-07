// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null); // { email, name, userType: 'penerima' | 'pemberi' }

    const login = async (email, password, userType) => {
        // TODO: ganti dengan API call ke backend
        const userData = { email, name: email.split("@")[0], userType };
        setUser(userData);
        localStorage.setItem("auth_user", JSON.stringify(userData));
    };

    const register = async (name, email, password, userType) => {
        // TODO: ganti dengan API call ke backend
        const userData = { email, name, userType };
        setUser(userData);
        localStorage.setItem("auth_user", JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("auth_user");
    };

    // Restore session dari localStorage
    const restoreUser = () => {
        const saved = localStorage.getItem("auth_user");
        if (saved) setUser(JSON.parse(saved));
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, restoreUser }}>
        {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);