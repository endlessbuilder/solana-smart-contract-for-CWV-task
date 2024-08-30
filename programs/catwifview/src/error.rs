use anchor_lang::prelude::*;

#[error_code]
pub enum CatWifViewError {
    #[msg("Authority is invalid")]
    InvalidAuthority,
    #[msg("Token account is invalid")]
    InvalidTokenAccount,
}
