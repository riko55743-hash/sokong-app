import { Program, AnchorProvider, BN, web3 } from '@coral-xyz/anchor';
import { IDL } from '../idl/sokong';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';

const TOKEN_METADATA_PROGRAM_ID = new web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

// Static Creator Vault Address designated by the user
export const CREATOR_VAULT_ADDRESS = "8DngbRfXtxRgFdeyzEdDTEsXDC3dihke9rDfBq1KoJ1r";

export const getProgram = (connection, wallet) => {
    const provider = new AnchorProvider(connection, wallet, { preflightCommitment: 'processed' });
    return new Program(IDL, provider);
};

export const initializeState = async (program) => {
    try {
        // Double check to prevent unnecessary failed transactions
        const isInit = await checkIfInitialized(program);
        if (isInit) return "ALREADY_INITIALIZED";

        const user = program.provider.wallet.publicKey;
        // The PDA is derived from the string "donation_state"
        const [donationStatePda] = web3.PublicKey.findProgramAddressSync(
            [Buffer.from("donation_state")],
            program.programId
        );
        
        // The connected wallet (user) is automatically passed as the authorized Payer and Signer by the Anchor Provider
        const tx = await program.methods
            .initialize()
            .accounts({
                donationState: donationStatePda,
                user: user,
                systemProgram: web3.SystemProgram.programId,
            })
            .rpc();
        return tx;
    } catch (error) {
        console.error("Init Error:", error);
        throw error;
    }
};

export const checkIfInitialized = async (program) => {
    try {
        const [donationStatePda] = web3.PublicKey.findProgramAddressSync(
            [Buffer.from("donation_state")],
            program.programId
        );
        await program.account.donationState.fetch(donationStatePda);
        return true;
    } catch (e) {
        return false;
    }
};

export const fetchTimeCapsules = async (program) => {
    try {
        const records = await program.account.donationRecord.all();
        // Sort by timestamp descending (newest first)
        records.sort((a, b) => b.account.timestamp.toNumber() - a.account.timestamp.toNumber());
        
        return records.map(r => ({
            supporterNumber: r.account.supporterNumber.toNumber(),
            donor: r.account.donor.toString(),
            message: r.account.message,
            timestamp: r.account.timestamp.toNumber()
        }));
    } catch (error) {
        console.error("Fetch Error:", error);
        return [];
    }
};

export const sendSokongDonation = async (program, amountSol, message) => {
    try {
        const donor = program.provider.wallet.publicKey;
        const creator = new web3.PublicKey(CREATOR_VAULT_ADDRESS);
        const mint = web3.Keypair.generate();
        
        const [donationStatePda] = web3.PublicKey.findProgramAddressSync(
            [Buffer.from("donation_state")],
            program.programId
        );

        const tokenAccount = await getAssociatedTokenAddress(
            mint.publicKey,
            donor
        );

        const [metadataAccount] = web3.PublicKey.findProgramAddressSync(
            [
                Buffer.from("metadata"),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                mint.publicKey.toBuffer(),
            ],
            TOKEN_METADATA_PROGRAM_ID
        );

        const [masterEditionAccount] = web3.PublicKey.findProgramAddressSync(
            [
                Buffer.from("metadata"),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                mint.publicKey.toBuffer(),
                Buffer.from("edition"),
            ],
            TOKEN_METADATA_PROGRAM_ID
        );

        const [donationRecordPda] = web3.PublicKey.findProgramAddressSync(
            [Buffer.from("record"), mint.publicKey.toBuffer()],
            program.programId
        );

        const amount = new BN(amountSol * web3.LAMPORTS_PER_SOL);

        const tx = await program.methods
            .donateAndMint(amount, message)
            .accounts({
                donor: donor,
                creator: creator,
                donationState: donationStatePda,
                mint: mint.publicKey,
                tokenAccount: tokenAccount,
                metadataAccount: metadataAccount,
                masterEditionAccount: masterEditionAccount,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                systemProgram: web3.SystemProgram.programId,
                rent: web3.SYSVAR_RENT_PUBKEY,
                clock: web3.SYSVAR_CLOCK_PUBKEY,
                donationRecord: donationRecordPda,
            })
            .signers([mint])
            .rpc();

        return tx;
    } catch (error) {
        console.error("Donation Error:", error);
        throw error;
    }
};