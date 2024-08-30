use anchor_lang::prelude::*;

#[error_code]
pub enum CatWifViewError {
    #[msg("Custom error message")]
    CustomError,
}
