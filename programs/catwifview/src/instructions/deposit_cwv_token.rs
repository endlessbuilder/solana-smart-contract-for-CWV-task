use crate::{error::CatWifViewError, Treasury};
use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};

#[derive(Accounts)]
pub struct DepositCwvTokenCtx<'info> {
    #[account(mut)]
    pub depositor: Signer<'info>,

    /// CHECK:
    #[account(mut)]
    pub admin: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"treasury"],
        bump = treasury.bump,
        constraint = treasury.admin == admin.key() @ CatWifViewError::InvalidAuthority
        )]
    pub treasury: Box<Account<'info, Treasury>>,

    /// CHECK: empty PDA, authority for token accounts
    #[account(
        seeds = [b"treasury_authority"],
        bump
    )]
    pub treasury_authority: AccountInfo<'info>,

    #[account(
        mut,
        constraint = depositor_cwv_token_account.mint == treasury.token_cwv_mint @ CatWifViewError::InvalidTokenAccount,
        constraint = depositor_cwv_token_account.owner == depositor.key() @ CatWifViewError::InvalidAuthority
    )]
    pub depositor_cwv_token_account: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,        
        seeds = [b"token_cwv_account"],
        bump = treasury.treasury_cwv_token_account_bump
    )]
    pub treasury_cwv_token_account: Box<Account<'info, TokenAccount>>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct DepositCwvTokenParams {
    pub amount: u64
}

pub fn deposit_cwv_token<'info>(
    ctx: Context<'_, '_, '_, 'info, DepositCwvTokenCtx<'info>>,
    params: DepositCwvTokenParams,
) -> Result<()> {
    let treasury = ctx.accounts.treasury.as_mut();

    let depositor_cwv_token_account = ctx.accounts.depositor_cwv_token_account.as_mut();
    let treasury_cwv_token_account = ctx.accounts.treasury_cwv_token_account.as_mut();

    treasury.transfer_tokens_from_user(
        depositor_cwv_token_account.to_account_info(), 
        treasury_cwv_token_account.to_account_info(),
        ctx.accounts.depositor.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        params.amount
    )?;

    treasury.token_cwv_amount += params.amount;

    Ok(())
}
