pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

use instructions::*;
use state::*;

declare_id!("8KZJqXCybjMKC4NB5g7FsLPNGvNrvtzKD8sk9fUuV5wZ");

#[program]
pub mod catwifview {
    use super::*;

    pub fn initialize_treasury<'info>(ctx: Context<'_, '_, '_, 'info, InitializeTreasuryCtx<'info>>) -> Result<()> {
        instructions::initialize_treasury(ctx)
    }
    
    pub fn initialize_cwv_vault<'info>(ctx: Context<'_, '_, '_, 'info, InitializeCwvVaultCtx<'info>>) -> Result<()> {
        instructions::initialize_cwv_vault(ctx)
    }

    pub fn initialize_a_vault<'info>(ctx: Context<'_, '_, '_, 'info, InitializeAVaultCtx<'info>>) -> Result<()> {
        instructions::initialize_a_vault(ctx)
    }

}
