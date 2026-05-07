import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import fs from 'fs';

const idl = JSON.parse(fs.readFileSync('./src/idl/sokong.json', 'utf8'));

async function test() {
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    const keypair = Keypair.generate();
    const wallet = new Wallet(keypair);
    
    console.log("Airdropping to test wallet:", keypair.publicKey.toBase58());
    try {
        const sig = await connection.requestAirdrop(keypair.publicKey, 1000000000);
        await connection.confirmTransaction(sig, 'confirmed');
        console.log("Airdrop successful");
    } catch (e) {
        console.log("Airdrop failed, using existing devnet funded key if needed...", e.message);
        return; // we need SOL to test
    }

    const provider = new AnchorProvider(connection, wallet, { preflightCommitment: 'processed' });
    const program = new Program(idl, provider);

    const [donationStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("donation_state")],
        program.programId
    );

    try {
        console.log("Sending initialize tx...");
        const tx = await program.methods
            .initialize()
            .accounts({
                donationState: donationStatePda,
                user: keypair.publicKey,
                systemProgram: new PublicKey('11111111111111111111111111111111'),
            })
            .rpc();
        console.log("Success! TX:", tx);
    } catch (e) {
        console.error("ERROR:");
        console.error(e);
        if (e.logs) console.error("Logs:", e.logs);
    }
}

test();
