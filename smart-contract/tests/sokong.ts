// @ts-nocheck
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Sokong } from "../target/types/sokong";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_CLOCK_PUBKEY,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { expect } from "chai";

describe("sokong", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Sokong as Program<Sokong>;

  const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  const donor = provider.wallet as anchor.Wallet;
  const creator = Keypair.generate();
  
  // PDAs
  const [donationStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("donation_state")],
    program.programId
  );

  it("Is initialized!", async () => {
    // Airdrop SOL to creator for rent exemption if needed, though they just receive here
    
    const tx = await program.methods
      .initialize()
      .accounts({
        donationState: donationStatePda,
        user: donor.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
      
    console.log("Initialized transaction signature", tx);
    
    const state = await program.account.donationState.fetch(donationStatePda);
    expect(state.supporterNumber.toNumber()).to.equal(0);
  });

  it("Donates and mints an NFT!", async () => {
    const mint = Keypair.generate();
    
    const tokenAccount = await getAssociatedTokenAddress(
      mint.publicKey,
      donor.publicKey
    );

    const [metadataAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    const [masterEditionAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
        Buffer.from("edition"),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    const [donationRecordPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("record"), mint.publicKey.toBuffer()],
      program.programId
    );

    const donateAmount = new anchor.BN(1_000_000_000); // 1 SOL
    const message = "Semoga sukses selalu! Ini dukungan kecil dariku.";

    const tx = await program.methods
      .donateAndMint(donateAmount, message)
      .accounts({
        donor: donor.publicKey,
        creator: creator.publicKey,
        donationState: donationStatePda,
        mint: mint.publicKey,
        tokenAccount: tokenAccount,
        metadataAccount: metadataAccount,
        masterEditionAccount: masterEditionAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
        clock: SYSVAR_CLOCK_PUBKEY,
        donationRecord: donationRecordPda,
      })
      .signers([mint])
      .rpc();

    console.log("Donate and mint transaction signature", tx);

    // Verify creator balance increased
    const creatorBalance = await provider.connection.getBalance(creator.publicKey);
    expect(creatorBalance).to.equal(1_000_000_000);

    // Verify supporter number increased
    const state = await program.account.donationState.fetch(donationStatePda);
    expect(state.supporterNumber.toNumber()).to.equal(1);
    
    // Verify Time Capsule message
    const record = await program.account.donationRecord.fetch(donationRecordPda);
    expect(record.supporterNumber.toNumber()).to.equal(1);
    expect(record.message).to.equal(message);
    expect(record.donor.toBase58()).to.equal(donor.publicKey.toBase58());
    expect(record.timestamp.toNumber()).to.be.greaterThan(0);

    // Check NFT minted
    const tokenBalance = await provider.connection.getTokenAccountBalance(tokenAccount);
    expect(tokenBalance.value.uiAmount).to.equal(1);
  });
});
