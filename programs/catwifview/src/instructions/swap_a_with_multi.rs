use crate::{error::CatWifViewError, Treasury, UserInfo};
use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};

#[derive(Accounts)]
pub struct SwapAWithMultiCtx<'info> {
    /// CHECK:
    #[account(mut)]
    pub user: AccountInfo<'info>,

    #[account(mut)]
    pub admin: Signer<'info>,

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
        close = admin,
        seeds = [b"user_info", user.key().as_ref()],
        bump = user_info.bump,
        )]
    pub user_info: Box<Account<'info, UserInfo>>,
    
        #[account(
            mut,
            constraint = user_cwv_token_account.mint == treasury.token_cwv_mint @ CatWifViewError::InvalidTokenAccount,
            constraint = user_cwv_token_account.owner == user.key() @ CatWifViewError::InvalidAuthority
        )]
        pub user_cwv_token_account: Box<Account<'info, TokenAccount>>,

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
pub struct SwapAWithMultiParams {
    pub multi: u8,
}

pub fn swap_a_with_multi<'info>(
    ctx: Context<'_, '_, '_, 'info, SwapAWithMultiCtx<'info>>,
    params: SwapAWithMultiParams,
) -> Result<()> {
    let treasury = ctx.accounts.treasury.as_mut();

    let user_cwv_token_account = ctx.accounts.user_cwv_token_account.as_mut();
    let treasury_cwv_token_account = ctx.accounts.treasury_cwv_token_account.as_mut();

    let user_info = ctx.accounts.user_info.as_mut();

    let cwv_amount = user_info.deposit_amount * params.multi as u64;

    treasury.transfer_tokens(
        treasury_cwv_token_account.to_account_info(),
        user_cwv_token_account.to_account_info(),
        ctx.accounts.treasury_authority.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        cwv_amount
    )?;

    treasury.token_cwv_amount -= cwv_amount;
    treasury.paid_cwv_amount += cwv_amount;

    match params.multi {
        1_u8 => treasury.num_of_1x_pay += 1,
        2_u8 => treasury.num_of_2x_pay += 1,
        3_u8 => treasury.num_of_3x_pay += 1,
        4_u8 => treasury.num_of_4x_pay += 1,
        _ => ()
    }

    Ok(())
}
