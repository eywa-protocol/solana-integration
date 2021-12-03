use anchor_lang::{
    prelude::*,
    solana_program::pubkey::Pubkey,
};

#[event]
pub struct Minted {
    pub token: Pubkey,
    pub to: Pubkey,
    pub amount: u64,
}
