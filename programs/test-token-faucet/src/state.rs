use anchor_lang::{
    prelude::*,
    // solana_program::pubkey::Pubkey,
};


#[account]
#[derive(Default)]
pub struct Settings {
    pub owner: Pubkey,
    // pub nonce: u64,
    pub bump: u8,
}
impl Settings {
    pub const SEED: &'static [u8] = b"eywa-pda";
    // pub const LEN: usize = 8 + 8 + 1;
}

#[account]
#[derive(Default)]
pub struct MintData {
    pub token_mint: Pubkey,
    pub name: String,
    pub symbol: String, // [u8; 8],
    pub bump_mint: u8,
}
impl MintData {
    pub const MINT_SEED: &'static [u8] = b"mint-seed";
    pub const DATA_SEED: &'static [u8] = b"mint-data";
}
