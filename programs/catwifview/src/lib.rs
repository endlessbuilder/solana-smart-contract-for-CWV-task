pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

use instructions::*;
use state::*;

declare_id!("8rJgztGCgqNxHvXNC8LW6AazQhERP9zCuBMRUKkh2MDx");

#[program]
pub mod catwifview {
    use super::*;

    pub fn initialize_treasury<'info>(
        ctx: Context<'_, '_, '_, 'info, InitializeTreasuryCtx<'info>>,
    ) -> Result<()> {
        instructions::initialize_treasury(ctx)
    }

    pub fn initialize_cwv_vault<'info>(
        ctx: Context<'_, '_, '_, 'info, InitializeCwvVaultCtx<'info>>,
    ) -> Result<()> {
        instructions::initialize_cwv_vault(ctx)
    }

    pub fn initialize_a_vault<'info>(
        ctx: Context<'_, '_, '_, 'info, InitializeAVaultCtx<'info>>,
    ) -> Result<()> {
        instructions::initialize_a_vault(ctx)
    }

    pub fn deposit_cwv_token<'info>(
        ctx: Context<'_, '_, '_, 'info, DepositCwvTokenCtx<'info>>,
        params: DepositCwvTokenParams,
    ) -> Result<()> {
        instructions::deposit_cwv_token(ctx, params)
    }

    pub fn deposit_a_token<'info>(
        ctx: Context<'_, '_, '_, 'info, DepositATokenCtx<'info>>,
        params: DepositATokenParams,
    ) -> Result<()> {
        instructions::deposit_a_token(ctx, params)
    }

    pub fn start_game<'info>(
        ctx: Context<'_, '_, '_, 'info, StartGameCtx<'info>>,
        params: StartGameCtxParams,
    ) -> Result<()> {
        instructions::start_game(ctx, params)
    }
    
    pub fn swap_a_with_multi<'info>(
        ctx: Context<'_, '_, '_, 'info, SwapAWithMultiCtx<'info>>,
        params: SwapAWithMultiParams,
    ) -> Result<()> {
        instructions::swap_a_with_multi(ctx, params)
    }
    
}
