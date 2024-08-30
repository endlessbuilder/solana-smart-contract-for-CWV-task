use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use crate::{error::CatWifViewError, Treasury};

#[derive(Accounts)]
pub struct InitializeAVaultCtx<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"treasury"],
        bump = treasury.bump,
        constraint = treasury.admin == payer.key() @ CatWifViewError::InvalidAuthority
        )]
    pub treasury: Box<Account<'info, Treasury>>,

    /// CHECK: empty PDA, authority for token accounts
    #[account(
        seeds = [b"treasury_authority"],
        bump
    )]
    pub treasury_authority: AccountInfo<'info>,

    pub token_a_mint: Box<Account<'info, Mint>>,

    #[account(
        init,
        payer = payer,
        token::mint = token_a_mint,
        token::authority = treasury_authority,
        seeds = [b"token_a_account"],
        bump
    )]
    pub treasury_a_token_account: Box<Account<'info, TokenAccount>>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

pub fn initialize_a_vault<'info>(
    ctx: Context<'_, '_, '_, 'info, InitializeAVaultCtx<'info>>
) -> Result<()> {

    let treasury = ctx.accounts.treasury.as_mut();

    treasury.token_a_mint = ctx.accounts.token_a_mint.key();
    treasury.treasury_a_token_account = ctx.accounts.treasury_a_token_account.key();
    treasury.treasury_a_token_account_bump = ctx.bumps.treasury_a_token_account;

    treasury.token_a_amount = 0;

    Ok(())
}
