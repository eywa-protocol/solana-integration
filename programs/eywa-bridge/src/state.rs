use anchor_lang::{
    prelude::*,
    solana_program::pubkey::Pubkey,
};


#[account]
#[derive(Default)]
pub struct Settings {
    pub owner: Pubkey,
    pub nonce: u64,
    pub bump: u8,
}
impl Settings {
    pub const SEED: &'static [u8] = b"eywa-pda";
    // pub const LEN: usize = 8 + 32 + 8 + 1;
}

#[account]
#[derive(Default)]
pub struct ContractSendBind {
    pub opposite_bridge: [u8; 20],
    pub contract: Pubkey,
    pub sender_authority: Pubkey,
    pub sender_authority_bump: u8,
}
impl ContractSendBind {
    pub const SEED: &'static [u8] = b"eywa-send-bind";
}


#[account]
#[derive(Default)]
pub struct ContractReceiveBind {
    pub opposite_bridge: [u8; 20],
    pub contract: [u8; 20],
}
impl ContractReceiveBind {
    pub const SEED: &'static [u8] = b"eywa-receive-bind";
}


#[derive(
    AnchorSerialize,
    AnchorDeserialize,
)]
pub struct StandaloneInstruction {
    pub accounts: Vec<TransactionAccount>,
    pub program_id: Pubkey,
    pub data: Vec<u8>,
}

#[derive(
    AnchorSerialize,
    AnchorDeserialize,
)]
pub struct TransactionAccount {
    pub pubkey: Pubkey,
    pub is_signer: bool,
    pub is_writable: bool,
}
impl From<TransactionAccount> for AccountMeta {
    fn from(account: TransactionAccount) -> AccountMeta {
        match account.is_writable {
            false => AccountMeta::new_readonly(account.pubkey, account.is_signer),
            true => AccountMeta::new(account.pubkey, account.is_signer),
        }
    }
}
