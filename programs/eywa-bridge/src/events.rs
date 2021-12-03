use anchor_lang::{
    prelude::*,
    solana_program::pubkey::Pubkey,
};


#[event]
pub struct OracleRequest {
    pub request_type: String,
    pub bridge: Pubkey,
    pub request_id: Pubkey,
    pub selector: Vec<u8>,
    pub receive_side: [u8; 20],
    pub opposite_bridge: [u8; 20],
    pub chain_id: u64,
}

#[event]
pub struct ReceiveRequest {
    pub req_id: Pubkey,
    pub receive_side: Pubkey,
    pub bridge_from: [u8; 20],
    pub sender_side: [u8; 20],
}
