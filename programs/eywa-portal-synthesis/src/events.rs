use anchor_lang::{
    prelude::*,
    solana_program::pubkey::Pubkey,
};

// #region Synthesis

/*
    event BurnRequest(
        bytes32 indexed _id,
        address indexed _from,
        address indexed _to,
        uint _amount,
        address _token
    );
*/
#[event]
pub struct BurnRequest {
    #[index]
    pub id: [u8; 32], //uint256
    #[index]
    pub from: Pubkey, //uint256
    #[index]
    pub to: Pubkey,
    pub amount: u64,
    pub token: [u8; 20], //uint160
}

/*
    event RevertSynthesizeRequest(
        bytes32 indexed _id,
        address indexed _to
    );
*/
#[event]
pub struct RevertSynthesizeRequest {
    #[index]
    pub id: [u8; 32],
    #[index]
    pub to: Pubkey,
}

/*
    event SynthesizeCompleted(
        bytes32 indexed _id,
        address indexed _to,
        uint _amount,
        address _token
    );
*/
#[event]
pub struct SynthesizeCompleted {
    #[index]
    pub id: [u8; 32],
    #[index]
    pub to: Pubkey,
    pub amount: u64,
    pub token: [u8; 20],
}

/*
    event RevertBurnCompleted(
        bytes32 indexed _id,
        address indexed _to,
        uint _amount,
        address _token
    );
*/
#[event]
pub struct RevertBurnCompleted {
    #[index]
    pub id: [u8; 32],
    #[index]
    pub to: Pubkey,
    pub amount: u64,
    pub token: [u8; 20],
}

/*
    event CreatedRepresentation(
        address indexed _rtoken,
        address indexed _stoken,
    );
*/
#[event]
pub struct CreatedRepresentation {
    #[index]
    pub stoken: Pubkey,
    #[index]
    pub rtoken: [u8; 20],
}

// #endregion Synthesis
// #region Portal

/*
    event RepresentationRequest(
        address indexed _rtoken
    );
*/
#[event]
pub struct RepresentationRequest {
    #[index]
    pub rtoken: Pubkey,
}

/*
    event ApprovedRepresentationRequest(
        address indexed _rtoken
    );
*/
#[event]
pub struct ApprovedRepresentationRequest {
    #[index]
    pub rtoken: Pubkey,
}

/*
    event SynthesizeRequest(
        bytes32 indexed _id,
        address indexed _from,
        address indexed _to,
        uint _amount,
        address _token
    );
*/
#[event]
pub struct SynthesizeRequest {
    #[index]
    pub id: Pubkey, // H256, // id for repley protection
    #[index]
    pub from: Pubkey, // msgSender
    #[index]
    pub to: [u8; 20], // chain2address
    pub amount: u64,
    pub real_token: Pubkey,
}

/*
    event RevertBurnRequest(
        bytes32 indexed _id,
        address indexed _to
    );
*/
#[event]
pub struct RevertBurnRequest {
    #[index]
    pub id: String,
    #[index]
    pub to: Pubkey,
}

/*
    event BurnCompleted(
        bytes32 indexed _id,
        address indexed _to,
        uint _amount,
        address _token
    );
*/
#[event]
pub struct BurnCompleted {
    #[index]
    pub id: String,
    #[index]
    pub to: Pubkey,
    pub amount: u64,
    pub token: Pubkey,
}

/*
    event RevertSynthesizeCompleted(
        bytes32 indexed _id,
        address indexed _to,
        uint _amount,
        address _token
    );
*/
#[event]
pub struct RevertSynthesizeCompleted {
    pub id: Pubkey, // [u8; 32],
    pub to: Pubkey,
    pub amount: u64,
    pub token: Pubkey, // [u8; 20],
}

// #endregion Portal
