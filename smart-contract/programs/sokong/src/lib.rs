use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        create_master_edition_v3, create_metadata_accounts_v3, CreateMasterEditionV3,
        CreateMetadataAccountsV3, Metadata,
    },
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};
use mpl_token_metadata::types::DataV2;

declare_id!("9cv9sfA8deekA3Va35Y2dMygCaP1TJZTp6FeEx65Gz7r");

#[program]
pub mod sokong {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let state = &mut ctx.accounts.donation_state;
        state.supporter_number = 0;
        Ok(())
    }

    pub fn donate_and_mint(ctx: Context<DonateAndMint>, amount: u64, message: String) -> Result<()> {
        require!(message.len() <= 200, CustomError::MessageTooLong);

        // 1. Transfer SOL from donor to creator
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.donor.to_account_info(),
                to: ctx.accounts.creator.to_account_info(),
            },
        );
        system_program::transfer(cpi_context, amount)?;

        // 2. Increment supporter number
        let state = &mut ctx.accounts.donation_state;
        state.supporter_number = state.supporter_number.checked_add(1).unwrap();
        let current_supporter = state.supporter_number;

        // 3. Initialize the Time Capsule (DonationRecord)
        let record = &mut ctx.accounts.donation_record;
        record.supporter_number = current_supporter;
        record.donor = ctx.accounts.donor.key();
        record.message = message;
        record.timestamp = ctx.accounts.clock.unix_timestamp;

        // 4. Mint 1 Token to the donor's associated token account
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.donor.to_account_info(), // Donor is mint authority temporarily
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        mint_to(cpi_ctx, 1)?;

        // 5. Create Metadata Account for the NFT
        let name = format!("Sokong Supporter #{}", current_supporter);
        let symbol = String::from("SOKONG");
        let uri = String::from("https://arweave.net/placeholder_uri_here"); // Placeholder URI

        let cpi_context = CpiContext::new(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.metadata_account.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                mint_authority: ctx.accounts.donor.to_account_info(),
                update_authority: ctx.accounts.donor.to_account_info(),
                payer: ctx.accounts.donor.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        );

        let data_v2 = DataV2 {
            name,
            symbol,
            uri,
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        };

        create_metadata_accounts_v3(cpi_context, data_v2, true, true, None)?;

        // 6. Create Master Edition Account
        let cpi_context = CpiContext::new(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMasterEditionV3 {
                edition: ctx.accounts.master_edition_account.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                update_authority: ctx.accounts.donor.to_account_info(),
                mint_authority: ctx.accounts.donor.to_account_info(),
                payer: ctx.accounts.donor.to_account_info(),
                metadata: ctx.accounts.metadata_account.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        );

        create_master_edition_v3(cpi_context, Some(0))?;

        Ok(())
    }
}

#[error_code]
pub enum CustomError {
    #[msg("The custom message cannot exceed 200 characters.")]
    MessageTooLong,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 8, // Discriminator (8) + u64 (8)
        seeds = [b"donation_state"],
        bump
    )]
    pub donation_state: Account<'info, DonationState>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DonateAndMint<'info> {
    #[account(mut)]
    pub donor: Signer<'info>,
    
    /// CHECK: This is the creator who will receive the SOL. Validated by the client.
    #[account(mut)]
    pub creator: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"donation_state"],
        bump
    )]
    pub donation_state: Account<'info, DonationState>,

    #[account(
        init,
        payer = donor,
        mint::decimals = 0,
        mint::authority = donor,
        mint::freeze_authority = donor
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = donor,
        associated_token::mint = mint,
        associated_token::authority = donor
    )]
    pub token_account: Account<'info, TokenAccount>,

    /// CHECK: PDA created by Token Metadata Program
    #[account(mut)]
    pub metadata_account: UncheckedAccount<'info>,

    /// CHECK: PDA created by Token Metadata Program
    #[account(mut)]
    pub master_edition_account: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,

    #[account(
        init,
        payer = donor,
        space = 8 + 8 + 32 + (4 + 200) + 8, // Disc + u64 + Pubkey + String(200) + i64
        seeds = [b"record", mint.key().as_ref()],
        bump
    )]
    pub donation_record: Account<'info, DonationRecord>,
}

#[account]
pub struct DonationRecord {
    pub supporter_number: u64,
    pub donor: Pubkey,
    pub message: String,
    pub timestamp: i64,
}

#[account]
pub struct DonationState {
    pub supporter_number: u64,
}
