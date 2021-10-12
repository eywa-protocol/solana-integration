use anchor_lang::{
    prelude::*,
    solana_program::pubkey::Pubkey,
};


/*
    event OracleRequest(
        string  requestType,
        address bridge,
        bytes32 requestId,
        bytes   selector,
        address receiveSide,
        address oppositeBridge,
        uint chainid
    );
*/
#[event]
pub struct OracleRequest {
    pub request_type: String,
    pub bridge: Pubkey,
    pub request_id: Pubkey,
    pub selector: Vec<u8>,
    pub receive_side: [u8; 20],
    pub opposite_bridge: [u8; 20],
    pub chainid: u64,

}

/*
    event ReceiveRequest(
        bytes32 reqId,
        address receiveSide,
        bytes32 tx
    );
*/
#[event]
pub struct ReceiveRequest {
    pub req_id: [u8; 32],
    pub receive_side: Pubkey,
    pub tx_id: [u8; 32],
}
