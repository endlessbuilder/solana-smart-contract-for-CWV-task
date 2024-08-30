use anchor_lang::prelude::*;
use anchor_spl::token::Transfer;

#[account]
#[derive(Default, Debug)]
pub struct Treasury {
    pub admin: Pubkey,
    
    pub treasury_authority: Pubkey,
    pub treasury_cwv_token_account: Pubkey,
    pub treasury_a_token_account: Pubkey,

    pub num_of_game_played: u64,
    pub num_of_1x_pay: u64,
    pub num_of_2x_pay: u64,
    pub num_of_3x_pay: u64,
    pub num_of_4x_pay: u64,

    pub token_a_amount: u64,
    pub token_cwv_amount: u64,

    pub paid_cwv_amount: u64,

    pub bump: u8,
    pub treasury_authority_bump: u8,
    pub treasury_cwv_token_account_bump: u8,
    pub treasury_a_token_account_bump: u8,

    _reserved: [u128; 8],
}

impl Treasury {
    pub const LEN: usize = 8 + std::mem::size_of::<Treasury>();
    pub const A_DECIMAL: usize = 4;
    pub const CWV_DECIMAL: usize = 4;

    pub fn transfer_tokens<'info>(
        &self,
        from: AccountInfo<'info>,
        to: AccountInfo<'info>,
        authority: AccountInfo<'info>,
        token_program: AccountInfo<'info>,
        amount: u64,
    ) -> Result<()> {
        let authority_seeds: &[&[&[u8]]] =
            &[&[b"treasury_authority", &[self.treasury_authority_bump]]];

        let context = CpiContext::new(
            token_program,
            Transfer {
                from,
                to,
                authority,
            },
        )
        .with_signer(authority_seeds);

        anchor_spl::token::transfer(context, amount)
    }

    pub fn transfer_tokens_from_user<'info>(
        &self,
        from: AccountInfo<'info>,
        to: AccountInfo<'info>,
        authority: AccountInfo<'info>,
        token_program: AccountInfo<'info>,
        amount: u64,
    ) -> Result<()> {
        let context = CpiContext::new(
            token_program,
            Transfer {
                from,
                to,
                authority,
            },
        );
        anchor_spl::token::transfer(context, amount)
    }
}