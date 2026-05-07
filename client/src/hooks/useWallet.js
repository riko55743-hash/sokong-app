import { useState } from "react";
import { connectWallet } from "../services/blockchain";

export const useWallet = () => {
    const [address, setAddress] = useState("");

    const handleConnect = async () => {
        const signer = await connectWallet();
        if (!signer) return;

        const addr = await signer.getAddress();
        setAddress(addr);
    };

    return { address, handleConnect };
};