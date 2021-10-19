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
        address bridgeFrom,
        address senderSide
    );
*/
#[event]
pub struct ReceiveRequest {
    pub req_id: Pubkey,
    pub receive_side: Pubkey,
    // pub tx_id: Pubkey,
    pub bridge_from: [u8; 20],
    pub sender_side: [u8; 20],
}
