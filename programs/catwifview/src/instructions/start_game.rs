use crate::{error::CatWifViewError, Treasury, UserInfo};
use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};

#[derive(Accounts)]
pub struct StartGameCtx<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

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
        constraint = user_a_token_account.mint == treasury.token_a_mint @ CatWifViewError::InvalidTokenAccount,
    )]
    pub user_a_token_account: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,        
        seeds = [b"token_a_account"],
        bump = treasury.treasury_a_token_account_bump
    )]
    pub treasury_a_token_account: Box<Account<'info, TokenAccount>>,

    #[account(
        init,
        seeds = [b"user_info", user.key().as_ref()],
        bump,
        payer = admin,
        space = UserInfo::LEN
        )]
    pub user_info: Box<Account<'info, UserInfo>>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct StartGameCtxParams {
    pub amount: u64
}

pub fn start_game<'info>(
    ctx: Context<'_, '_, '_, 'info, StartGameCtx<'info>>,
    params: StartGameCtxParams,
) -> Result<()> {
    let treasury = ctx.accounts.treasury.as_mut();
    let user_info = ctx.accounts.user_info.as_mut();

    user_info.user = ctx.accounts.user.key();
    user_info.bump = ctx.bumps.user_info;

    let user_a_token_account = ctx.accounts.user_a_token_account.as_mut();
    let treasury_a_token_account = ctx.accounts.treasury_a_token_account.as_mut();

    treasury.transfer_tokens_from_user(
        user_a_token_account.to_account_info(), 
        treasury_a_token_account.to_account_info(),
        ctx.accounts.user.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        params.amount
    )?;

    user_info.deposit_amount = params.amount;

    treasury.num_of_game_played += 1;
    treasury.token_a_amount += params.amount;

    Ok(())
}
