use anchor_lang::prelude::*;
use crate::Treasury;

#[derive(Accounts)]
pub struct InitializeAVaultCtx<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        seeds = [b"treasury"],
        bump,
        payer = payer,
        space = Treasury::LEN
        )]
    pub treasury: Box<Account<'info, Treasury>>,

    /// CHECK: empty PDA, authority for token accounts
    #[account(
        seeds = [b"treasury_authority"],
        bump
    )]
    pub treasury_authority: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn initialize_a_vault<'info>(
    ctx: Context<'_, '_, '_, 'info, InitializeAVaultCtx<'info>>
) -> Result<()> {

    let treasury = ctx.accounts.treasury.as_mut();

    treasury.admin = ctx.accounts.payer.key();
    treasury.treasury_authority = ctx.accounts.treasury_authority.key();
    treasury.treasury_authority_bump = ctx.bumps.treasury_authority;

    treasury.num_of_game_played = 0;
    treasury.num_of_1x_pay = 0;
    treasury.num_of_2x_pay = 0;
    treasury.num_of_3x_pay = 0;
    treasury.num_of_4x_pay = 0;

    Ok(())
}
