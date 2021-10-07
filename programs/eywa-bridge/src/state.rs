use anchor_lang::{
    prelude::*,
    solana_program::{
        pubkey::Pubkey,
    },
};


#[account]
pub struct ContractBind {
    pub sender_side: [u8; 20],
}

#[account]
#[derive(Default)]
pub struct BridgeNonce {
    pub nonce: u64,
}

#[account]
#[derive(Default)]
pub struct Settings {
    pub owner: Pubkey,
    pub nonce: u64,
    pub bump: u8,
}

#[derive(
    AnchorSerialize,
    AnchorDeserialize,
    Clone,
    PartialEq,
)]
pub struct StandaloneInstruction {
    pub accounts: Vec<TransactionAccount>,
    pub program_id: Pubkey,
    pub data: Vec<u8>,
}


#[derive(
    AnchorSerialize,
    AnchorDeserialize,
    Clone,
    PartialEq,
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
