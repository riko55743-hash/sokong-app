// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // Auto-restore session lazily on initial load
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem("auth_user");
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error("Corrupted auth_user in localStorage, clearing.");
            localStorage.removeItem("auth_user");
            return null;
        }
    });

    const getUsersRegistry = () => {
        try {
            const registry = localStorage.getItem("sokong_users_registry");
            const parsed = registry ? JSON.parse(registry) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error("Corrupted registry in localStorage, returning empty array.");
            return [];
        }
    };

    const saveUsersRegistry = (registry) => {
        localStorage.setItem("sokong_users_registry", JSON.stringify(registry));
    };

    const loginWithWallet = async (publicKeyStr) => {
        const registry = getUsersRegistry();
        const existingUser = registry.find(u => u.walletAddress === publicKeyStr);
        if (existingUser) {
            setUser(existingUser);
            localStorage.setItem("auth_user", JSON.stringify(existingUser));
            return true;
        }
        return false;
    };

    const registerWithWallet = async (username, displayName, publicKeyStr) => {
        const registry = getUsersRegistry();
        const isDuplicate = registry.some(u => u.username.toLowerCase() === username.toLowerCase());

        if (isDuplicate) {
            throw new Error("Username sudah digunakan! Silakan pilih yang lain.");
        }

        const newUser = {
            id: Date.now(),
            username,
            displayName,
            walletAddress: publicKeyStr,
            createdAt: new Date().toISOString()
        };

        registry.push(newUser);
        saveUsersRegistry(registry);

        setUser(newUser);
        localStorage.setItem("auth_user", JSON.stringify(newUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("auth_user");
    };

    const updateProfile = (updatedData) => {
        if (!user) return;

        const registry = getUsersRegistry();

        // Check for username duplication if changing username
        if (updatedData.username && updatedData.username.toLowerCase() !== user.username.toLowerCase()) {
            const isDuplicate = registry.some(u => u.username.toLowerCase() === updatedData.username.toLowerCase());
            if (isDuplicate) {
                throw new Error("Username sudah digunakan! Silakan pilih yang lain.");
            }
        }

        const updatedUser = { ...user, ...updatedData };
        setUser(updatedUser);
        localStorage.setItem("auth_user", JSON.stringify(updatedUser));

        // Update registry: Must find by the OLD username (user.username), not the new one (updatedUser.username)
        const userIndex = registry.findIndex(u => u.username === user.username);
        if (userIndex !== -1) {
            registry[userIndex] = updatedUser;
            saveUsersRegistry(registry);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loginWithWallet, registerWithWallet, logout, updateProfile, getUsersRegistry, saveUsersRegistry }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);