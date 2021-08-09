// use anchor_lang::prelude::*;
use anchor_lang::solana_program::{keccak, system_program};
use anchor_lang::{
    prelude::*,
    solana_program::program_error::ProgramError,
    // AccountSerialize,
    // AccountDeserialize,
    // spl_token,
};
use anchor_spl::token::{self, Transfer};

// use anchor_spl::token as anchor_spl_token;
// use spl_token::{
//     ID as SPL_TOKEN_PID,
// };

#[program]
pub mod eywa_bridge_solana {
    use super::*;
    use anchor_lang::solana_program::keccak;
    use anchor_lang::Key;

    // Singleton Data Account
    #[state]
    pub struct Settings {
        pub owner: Pubkey,
        pub param: u64,
        // address public _listNode;
        // uint256 public requestCount = 1;
    }
    impl Settings {
        pub fn new(ctx: Context<Auth>) -> Result<Self> {
            Ok(Self {
                owner: *ctx.accounts.owner.key,
                param: 100,
            })
        }

        pub fn increment(&mut self, ctx: Context<Auth>) -> Result<()> {
            if &self.owner != ctx.accounts.owner.key {
                return Err(ErrorCode::Unauthorized.into());
            }
            self.param += 1;
            Ok(())
        }
    }

    pub fn initialize(ctx: Context<Initialize>, admin: Pubkey, data: u64) -> ProgramResult {
        let acc_data = &mut ctx.accounts.data;

        acc_data.owner = admin;
        acc_data.data = data;

        Ok(())
    }

    pub fn update(ctx: Context<Update>, data: u64) -> Result<()> {
        let acc_data = &mut ctx.accounts.data;

        if data == 1234 {
            return Err(ErrorCode::Test.into());
        }

        acc_data.data = data;

        emit!(MyEvent {
            data,
            label: "hello".to_string(),
        });

        Ok(())
    }

    pub fn create_mint(ctx: Context<CreateMint>) -> ProgramResult {
        ctx.accounts.mint.supply = 0;
        Ok(())
    }

    pub fn create_token(ctx: Context<CreateToken>) -> ProgramResult {
        let token = &mut ctx.accounts.token;
        token.amount = 0;
        token.authority = *ctx.accounts.authority.key;
        token.mint = *ctx.accounts.mint.to_account_info().key;

        Ok(())
    }

    // #region Syntesise

    pub fn create_representation(
        ctx: Context<CreateRepresentation>,
        token_real: [u8; 20], // String, // H160, // real token for synt
        token_synt: Pubkey,
        synt_name: String,   // synt name
        synt_symbol: String, // synt short name
        synt_decimals: u8,
    ) -> ProgramResult {
        // onlyOwner
        // synthesizer
        ctx.accounts.mint_data.supply = 0;
        ctx.accounts.mint_data.name = synt_name;
        ctx.accounts.mint_data.symbol = synt_symbol;
        ctx.accounts.mint_data.token_real = token_real;
        ctx.accounts.mint_data.token_synt = token_synt; // ctx.accounts.mint.key();
        ctx.accounts.mint_data.decimals = synt_decimals;

        Ok(())
    }

    // #endregion Syntesise
    // #region Portal

    pub fn synthesize(
        ctx: Context<Synthesize>,
        real_token: [u8; 20], // String, // H160, // real token for synt
        amount: u64,
        chain_to_address: [u8; 20],
        receive_side: [u8; 20],
        opposite_bridge: [u8; 20],
        chain_id: u64,
    ) -> ProgramResult {
        msg!("{}", "Portal synthesize");

        let synthesize_info = &mut ctx.accounts.synthesize_info;

        let cpi_accounts = Transfer {
            from: ctx.accounts.source_account.clone(),
            to: ctx.accounts.destination_account.clone(),
            authority: ctx.accounts.owner_account.clone(),
        };
        let cpi_program = ctx.accounts.spl_token_account.clone();

        let cpi_ctx = CpiContext::new(cpi_program.clone(), cpi_accounts);
        token::transfer(cpi_ctx, amount)?;
        let mut hasher = keccak::Hasher::default();
        hasher.hash(
            <u64 as borsh::BorshSerialize>::try_to_vec(&synthesize_info.request_count)
                .unwrap()
                .as_slice(),
        );
        let tx_id = hasher.result().0;

        let out = [0u8; 10];

        let mut bridge_nonce: ProgramAccount<BridgeNonce> = get_or_create_account_data(
            &ctx.accounts.bridge_nonce,
            &ctx.accounts.nonce_master_account,
            &ctx.accounts.system_program,
            &ctx.accounts.rent,
            4,
            &[],
        )?;

        //TODO: GET BRIDGE
        let bridge = Pubkey::default();
        transmit_request(
            &out,
            receive_side,
            opposite_bridge,
            chain_id,
            &mut bridge_nonce.nonce,
            bridge,
        );

        let synthesize_request = &mut ctx.accounts.synthesize_request;
        synthesize_request.recipient = ctx.accounts.source_account.key();
        synthesize_request.chain_to_address = chain_to_address;
        synthesize_request.real_token = real_token;
        synthesize_request.amount = amount;
        synthesize_request.state = RequestState::Sent;

        synthesize_info.request_count += 1;

        let event = SynthesizeRequest {
            id: tx_id,
            from: ctx.accounts.source_account.key(),
            to: chain_to_address,
            amount,
            real_token,
        };
        emit!(event);

        Ok(())
    }

    // #endregion Portal
}

pub fn transmit_request(
    selector: &[u8],
    receive_side: [u8; 20],
    opposite_bridge: [u8; 20],
    chain_id: u64,
    nonce: &mut u64,
    bridge: Pubkey,
) {
    //bytes32 requestId = keccak256(abi.encodePacked(this, nonce[opposite_bridge], _selector, receive_side, opposite_bridge, chainId));
    let mut hasher = keccak::Hasher::default();
    hasher.hash(
        <(u64, &[u8], [u8; 20], [u8; 20], u64) as borsh::BorshSerialize>::try_to_vec(&(
            *nonce,
            selector,
            receive_side,
            opposite_bridge,
            chain_id,
        ))
        .unwrap()
        .as_slice(),
    );
    let request_id = hasher.result().0;
    *nonce += 1;
    let oracle_request = OracleRequest {
        request_type: "setRequest".to_string(),
        bridge,
        request_id,
        selector: selector.to_vec(),
        receive_side,
        opposite_bridge,
        chain_id,
    };
    emit!(oracle_request);
}

pub fn get_or_create_account_data<'info, T>(
    data_account: &AccountInfo<'info>,
    master_account: &AccountInfo<'info>,
    system_program: &AccountInfo<'info>,
    rent: &Sysvar<'info, Rent>,
    space: u64,
    seed: &[&[&[u8]]],
) -> std::result::Result<ProgramAccount<'info, T>, ProgramError>
where
    T: AccountSerialize + AccountDeserialize + Clone,
{
    if *data_account.owner == system_program::ID {
        let lamports = rent.minimum_balance(std::convert::TryInto::try_into(space).unwrap());
        let ix = anchor_lang::solana_program::system_instruction::create_account(
            master_account.key,
            data_account.key,
            lamports,
            space,
            master_account.owner,
        );

        let accounts = [
            master_account.clone(),
            data_account.clone(),
            system_program.clone(),
        ];

        anchor_lang::solana_program::program::invoke_signed(&ix, &accounts, seed)?;
    }

    ProgramAccount::try_from(data_account)
}

// #region Events

#[event]
pub struct MyEvent {
    pub data: u64,
    #[index]
    pub label: String,
}

// #region Bridge

/*
    event OracleRequest(
        string  requestType,
        address bridge,
        bytes32 requestId,
        bytes   selector,
        address receive_side,
        address opposite_bridge,
        uint chainid
    );
*/
#[event]
pub struct EvOracleRequest {}

// #endregion Bridge
// #region Portal

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
pub struct EvSynthesizeRequest {
    #[index]
    tx_id: [u8; 32], // H256, // id for repley protection
                     // address indexed _from, // msgSender
                     // address indexed _to, // chain2address
                     // amount: u64,
                     // address _token
}

// #endregion Portal

// #endregion Events
// #region DataAccounts

#[account]
pub struct Mint {
    pub supply: u32,
}

#[account]
pub struct MintData {
    pub supply: u32,
    pub token_real: [u8; 20], // String, // H160, // real token for synt
    pub token_synt: Pubkey,
    pub name: String,   // synt name
    pub symbol: String, // synt short name
    pub decimals: u8,
}

// #[derive(Clone)]
// pub struct Mint(spl_token::state::Mint);

// impl anchor_lang::AccountDeserialize for Mint {
//     fn try_deserialize(buf: &mut &[u8]) -> Result<Self, ProgramError> {
//         Mint::try_deserialize_unchecked(buf)
//     }

//     fn try_deserialize_unchecked(buf: &mut &[u8]) -> Result<Self, ProgramError> {
//         spl_token::state::Mint::unpack(buf).map(Mint)
//     }
// }

// impl Deref for Mint {
//     type Target = spl_token::state::Mint;

//     fn deref(&self) -> &Self::Target {
//         &self.0
//     }
// }

#[associated]
#[derive(Default)]
pub struct Token {
    pub amount: u32,
    pub authority: Pubkey,
    pub mint: Pubkey,
}

#[account]
pub struct DataAccount {
    pub owner: Pubkey,
    pub data: u64,
}

// #endregion DataAccounts
// #region for methods

#[derive(Accounts)]
pub struct Auth<'info> {
    #[account(signer)]
    owner: AccountInfo<'info>,
}

// #endregion for methods
// #region for functions

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init)]
    pub data: ProgramAccount<'info, DataAccount>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut, has_one = owner)]
    pub data: ProgramAccount<'info, DataAccount>,
    #[account(signer)]
    pub owner: AccountInfo<'info>,
}
// *
#[derive(Accounts)]
pub struct CreateMint<'info> {
    #[account(init)]
    mint: ProgramAccount<'info, Mint>,
    rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CreateToken<'info> {
    #[account(init, associated = authority, with = mint)]
    token: ProgramAccount<'info, Token>,
    #[account(mut, signer)]
    authority: AccountInfo<'info>,
    mint: ProgramAccount<'info, Mint>,
    rent: Sysvar<'info, Rent>,
    system_program: AccountInfo<'info>,
}
// */
// #endregion for functions
// #region Synthesis

#[derive(Accounts)]
pub struct CreateRepresentation<'info> {
    #[account(mut)]
    mint: AccountInfo<'info>,
    #[account(init)]
    mint_data: ProgramAccount<'info, MintData>,
    rent: Sysvar<'info, Rent>,
    // #[account(mut, has_one = owner)]
    // pub data: ProgramAccount<'info, DataAccount>,
    #[account(signer)]
    pub owner: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct MintSyntheticToken<'info> {
    #[account(mut)]
    mint: AccountInfo<'info>,
    #[account(mut)]
    mint_data: ProgramAccount<'info, MintData>,
    #[account(signer)]
    pub owner: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct EmergencyUnsyntesizeRequest<'info> {
    #[account(mut)]
    mint: AccountInfo<'info>,
    #[account(mut)]
    mint_data: ProgramAccount<'info, MintData>,
}

#[derive(Accounts)]
pub struct BurnSyntheticToken<'info> {
    #[account(mut)]
    mint: AccountInfo<'info>,
    #[account(mut)]
    mint_data: ProgramAccount<'info, MintData>,
}

#[derive(Accounts)]
pub struct EmergencyUnburn<'info> {
    #[account(mut)]
    mint: AccountInfo<'info>,
    #[account(mut)]
    mint_data: ProgramAccount<'info, MintData>,
}

// #endregion Synthesis
// #region Portal

#[derive(Accounts)]
pub struct Synthesize<'info> {
    #[account(mut)]
    pub synthesize_info: ProgramAccount<'info, SynthesizeInfo>,
    #[account(mut)]
    pub synthesize_request: ProgramAccount<'info, SynthesizeRequestInfo>,
    source_account: AccountInfo<'info>,
    #[account(mut)]
    destination_account: AccountInfo<'info>,
    #[account(signer)]
    owner_account: AccountInfo<'info>,
    spl_token_account: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
    #[account(signer)]
    nonce_master_account: AccountInfo<'info>,
    #[account(mut)]
    bridge_nonce: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
}

// #endregion Portal

#[error]
pub enum ErrorCode {
    #[msg("Unauthorized")]
    Unauthorized = 1000,
    #[msg("UNTRUSTED DEX")]
    UntrustedDex,
    #[msg("This is an error message clients will automatically display 1234")]
    Test = 1234,
}

#[account]
#[derive(Default)]
pub struct SynthesizeInfo {
    request_count: u64,
}

#[account]
#[derive(Default)]
pub struct BridgeNonce {
    nonce: u64,
}

#[account]
#[derive(Default)]
pub struct SynthesizeRequestInfo {
    recipient: Pubkey,
    chain_to_address: [u8; 20],
    real_token: [u8; 20],
    amount: u64,
    state: RequestState,
}

#[event]
pub struct SynthesizeRequest {
    id: [u8; 32],
    from: Pubkey,
    to: [u8; 20],
    amount: u64,
    real_token: [u8; 20],
}

#[event]
pub struct OracleRequest {
    request_type: String,
    bridge: Pubkey,
    request_id: [u8; 32],
    selector: Vec<u8>,
    receive_side: [u8; 20],
    opposite_bridge: [u8; 20],
    chain_id: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
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
