use anchor_lang::{
    prelude::*,
    solana_program::{
        pubkey::Pubkey,
    },
};


#[account]
#[derive(Default, Debug)]
pub struct UnsynthesizeStatesInfo {
    pub state: UnsynthesizeStates,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug)]
pub enum UnsynthesizeStates {
    Default,
    Unsynthesized,
    RevertRequest,
}

impl Default for UnsynthesizeStates {
    fn default() -> Self {
        UnsynthesizeStates::Default
    }
}

#[account]
#[derive(Default)]
pub struct Settings {
    pub bump: u8,
    pub owner: Pubkey, // bridge signer
    // pub param: u64,
    // address public _listNode;
    // uint256 public requestCount = 1;
    pub portal_nonce: u64,
    pub bridge: Pubkey,
}

/* bridge => nonce */
#[account]
#[derive(Default)]
pub struct BridgeNonce {
    pub nonce: u64,
}

// mapping(address => uint) public nonce;
// mapping(address => bool) public dexBind;

#[account]
#[derive(Default)]
pub struct MintData {
    pub token_real: [u8; 20], // real token for synt
    pub token_synt: Pubkey,
    pub name: String,   // synt name
    pub symbol: String, // synt short name
}

#[account]
#[derive(Default)]
pub struct SynthesizeRequestInfo {
    // pub tx_id: [u8; 32],
    pub recipient: Pubkey,
    pub chain_to_address: [u8; 20], // wallet for synt
    pub real_token: Pubkey,
    pub amount: u64,
    pub state: RequestState,
}

#[derive(
    AnchorSerialize,
    AnchorDeserialize,
    Clone,
    PartialEq,
)]
pub enum RequestState {
    Default,
    Sent,
    Reverted,
}

impl Default for RequestState {
    fn default() -> Self {
        RequestState::Default
    }
}
