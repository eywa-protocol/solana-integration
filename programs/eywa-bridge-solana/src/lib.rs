// use anchor_lang::prelude::*;
use anchor_lang::{
    prelude::*,
    solana_program::{
        // entrypoint::ProgramResult,
        program_error::ProgramError,
    },
    // AccountSerialize,
    // AccountDeserialize,
    // spl_token,
};
// use anchor_spl::token as anchor_spl_token;
// use spl_token::{
//     ID as SPL_TOKEN_PID,
// };

#[program]
pub mod eywa_bridge_solana {
    use super::*;

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

    pub fn initialize(
        ctx: Context<Initialize>,
        admin: Pubkey,
        data: u64,
    ) -> ProgramResult {
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
        synt_name: String, // synt name
        synt_symbol: String, // synt short name
        synt_decimals: u8
    ) -> ProgramResult { // onlyOwner
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
        token_id: Pubkey,
        token_real: [u8; 20], // String, // H160, // real token for synt
        token_synt: Pubkey,
        amount: u64,

        // address _chain2address,
        // address _receiveSide,
        // address _oppositeBridge,
        // uint _chainID

    ) -> ProgramResult {
        // let token_real = ctx.accounts.mint_data.token_real;
        let message = "Portal synthesize";
        // let message = format!(
        //     "EmergencyUnburn: tx_id={:?}, token_real={:?}",
        //     tx_id, token_real,
        // );
        msg!("{}", message);

        /*
        // Залочить SPLки
        TransferHelper.safeTransferFrom(_token, _msgSender(), address(this), _amount);
        // Запомнить состояние
        balanceOf[_token] = balanceOf[_token].add(_amount);

        // посчитать внутренний идентификатор
        txID = keccak256(abi.encodePacked(this, requestCount));

        // сгенерировать вызов
        bytes memory out  = abi.encodeWithSelector(bytes4(
            keccak256(bytes('mintSyntheticToken(bytes32,address,uint256,address)'))
        ), txID, _token, _amount, _chain2address);
        // и передать наружу бэкенду
        IBridge(bridge).transmitRequestV2(out,_receiveSide, _oppositeBridge, _chainID);
        //  transmitRequestV2(
                bytes memory _selector,
                address receiveSide,
                address oppositeBridge,
                uint chainId
            ) onlyTrustedDex
        bytes32 requestId = prepareRqId(_selector, receiveSide, oppositeBridge, chainId);
        //  function prepareRqId(
                bytes memory  _selector,
                address receiveSide,
                address oppositeBridge,
                uint chainId
            )
        bytes32 requestId = keccak256(
            abi.encodePacked(this, nonce[oppositeBridge], _selector, receiveSide, oppositeBridge, chainId));
        nonce[oppositeBridge] = nonce[oppositeBridge] + 1;

        emit!(EvOracleRequest {
            "setRequest",
            address(this),
            requestId,
            _selector,
            receiveSide,
            oppositeBridge,
            chainId,
        });
        // end transmitRequestV2
        TxState storage txState = requests[txID];
        txState.recipient    = _msgSender();
        txState.chain2address    = _chain2address;
        txState.rtoken     = _token;
        txState.amount     = _amount;
        txState.state = RequestState.Sent;

        requestCount +=1;

        emit EvSynthesizeRequest(txID, _msgSender(), _chain2address, _amount, _token);
        */

        Ok(())
    }

// #endregion Portal

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
            address receiveSide,
            address oppositeBridge,
            uint chainid
        );
    */
    #[event]
    pub struct EvOracleRequest {
    }

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
        tx_id: [u8; 32],   // H256, // id for repley protection
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
    pub name: String, // synt name
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
    mint: AccountInfo<'info>,
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
