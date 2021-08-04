// use anchor_lang::prelude::*;
use anchor_lang::{
    prelude::*,
    Key,
    // solana_program,
    solana_program::{
        entrypoint::ProgramResult,
        program_error::ProgramError,
        // program_pack::Pack,
    },
    // AccountSerialize,
    // AccountDeserialize,
    // spl_token,
    // solana_program::
};
// use anchor_spl::token as anchor_spl_token;
use spl_token::{
    // id as spl_token_id,
    ID as SPL_TOKEN_PID,
    // state::Mint,
};
// use crate::id as PID;

#[program]
pub mod eywa_bridge_solana {
    use super::*;

    // Singleton Data Account
    #[state]
    pub struct Settings {
        pub owner: Pubkey,
        pub param: u64,
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

        // // The `InitializeMint` instruction requires no signers and MUST be
        // // included within the same Transaction as the system program's
        // // `CreateAccount` instruction that creates the account being initialized.
        // // Otherwise another party can acquire ownership of the uninitialized
        // // account.
        // let ix_init_mint = &spl_token::instruction::initialize_mint(
        //     &SPL_TOKEN_PID, // &spl_token_id(),
        //     &ctx.accounts.mint.key(),
        //     &ctx.accounts.owner.key(),
        //     Some(&ctx.accounts.owner.key()),
        //     2, // decimals: u8,
        // )?;
        // // solana_program::program::invoke_signed(
        // solana_program::program::invoke(
        //     &ix_init_mint,
        //     //   0. `[writable]` The mint to initialize.
        //     //   1. `[]` Rent sysvar
        //     &[
        //         ctx.accounts.mint.clone(),
        //         ctx.accounts.rent.to_account_info(),
        //     ],
        //     // ctx.signer_seeds, //&[],
        // )?;
        // msg!("000");
        // // let (pda, _bump_seed) = Pubkey::find_program_address(&[b"escrow"], ctx.program_id);
        // // token::set_authority(ctx.accounts.into(), AuthorityType::AccountOwner, Some(pda))?;

        Ok(())
    }
}

// #region Events

#[event]
pub struct MyEvent {
    pub data: u64,
    #[index]
    pub label: String,
}

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

// #endregion Synthesis

#[error]
pub enum ErrorCode {
    #[msg("This is an error message clients will automatically display 1234")]
    Test = 1234,
    #[msg("Unauthorized")]
    Unauthorized,
}
