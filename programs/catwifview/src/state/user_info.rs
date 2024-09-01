use anchor_lang::prelude::*;

#[account]
#[derive(Default, Debug)]
pub struct UserInfo {
    pub user: Pubkey,

    pub deposit_amount: u64,

    pub bump: u8,
}

impl UserInfo {
    pub const LEN: usize = 8 + std::mem::size_of::<UserInfo>();
}