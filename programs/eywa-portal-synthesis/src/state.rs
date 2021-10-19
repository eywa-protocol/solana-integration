use anchor_lang::{
    prelude::*,
    solana_program::pubkey::Pubkey,
};


#[derive(
    AnchorSerialize,
    AnchorDeserialize,
    Clone,
    PartialEq,
)]
pub enum PortalBridgeMethod {
    Default = 0,
    EmergencyUnsynthesize,
    Unsynthesize,
}
impl Default for PortalBridgeMethod {
    fn default() -> Self {
        PortalBridgeMethod::Default
    }
}

#[derive(
    AnchorSerialize,
    AnchorDeserialize,
    Clone,
    PartialEq,
)]
pub enum SynthesisBridgeMethod {
    Default = 0,
    MintSyntheticToken,
    EmergencyUnburn,
}
impl Default for SynthesisBridgeMethod {
    fn default() -> Self {
        SynthesisBridgeMethod::Default
    }
}


#[account]
#[derive(Default)]
pub struct Settings {
    pub bump: u8,
    pub owner: Pubkey, // Admin or DGO
    // address public _listNode;
    pub synthesis_request_count: u64, // uint256 public requestCount = 1;
    pub portal_request_count: u64,
    pub bridge: Pubkey,
    pub bridge_signer: Pubkey,
    pub real_tokens: Vec<Pubkey>,
    pub synt_tokens: Vec<Pubkey>,
}
impl Settings {
    pub const SEED: &'static [u8] = b"eywa-pda";
    // pub const LEN: usize = 8 + 32 + 8 + 1;
}

/* bridge => nonce */
/*
#[account]
#[derive(Default)]
pub struct BridgeNonce {
    pub nonce: u64,
}
*/

// mapping(address => uint) public nonce;
// mapping(address => bool) public dexBind;

#[account]
#[derive(Default)]
pub struct MintData {
    pub token_real: [u8; 20],
    pub token_synt: Pubkey,
    pub name: String,
    pub symbol: String,
    pub bump_mint: u8,
}
impl MintData {
    pub const SYNT_SEED: &'static [u8] = b"mint-synt";
    pub const DATA_SEED: &'static [u8] = b"mint-data";
}

/*
#[account]
#[derive(Default)]
pub struct SynthesizeRequest {
    pub bump: u8,
    pub recipient: Pubkey,
    pub chain_to_address: [u8; 20],
    pub opposite_bridge: [u8; 20],
    pub chain_id: u64,
    pub real_token: Pubkey,
    pub amount: u64,
    pub state: RequestState,
}
*/

#[account]
#[derive(Default)]
pub struct SynthesizeStateData {
    pub bump: u8,
    pub recipient: Pubkey,
    pub chain_to_address: [u8; 20],
    pub opposite_bridge: [u8; 20],
    pub chain_id: u64,
    pub real_token: Pubkey,
    pub amount: u64,
    pub state: SynthesizeState,
}
impl SynthesizeStateData {
    pub const SEED: &'static [u8] = b"eywa-synthesize-state";
}

/*
#[account]
#[derive(Default, Debug)]
pub struct SynthesizeStateData {
    pub state: SynthesizeState,
}
*/

#[derive(
    AnchorSerialize,
    AnchorDeserialize,
    Clone,
    PartialEq,
)]
pub enum SynthesizeState {
    Default,
    Synthesized,
    RevertRequest,
}
impl Default for SynthesizeState {
    fn default() -> Self {
        SynthesizeState::Default
    }
}


#[account]
#[derive(Default, Debug)]
pub struct UnsynthesizeStateData {
    pub state: UnsynthesizeState,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug)]
pub enum UnsynthesizeState {
    Default,
    Unsynthesized,
    RevertRequest,
}

impl Default for UnsynthesizeState {
    fn default() -> Self {
        UnsynthesizeState::Default
    }
}


#[account]
#[derive(Default)]
pub struct TxState {
    pub bump: u8,
    pub recipient: Pubkey,
    pub chain_to_address: [u8; 20],
    pub opposite_bridge: [u8; 20],
    pub chain_id: u64,
    pub synt_token: Pubkey,
    pub amount: u64,
    pub state: RequestState,
}
impl TxState {
    pub const SEED: &'static [u8] = b"eywa-tx-state";
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
