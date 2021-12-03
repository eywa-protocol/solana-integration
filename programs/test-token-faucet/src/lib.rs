use anchor_lang::prelude::*;
use anchor_spl::token;


pub mod events;
pub mod state;
pub mod ctxt;

use ctxt::*;


declare_id!("5Rup5ySbtRPZr9aJb2PW9UMFhMvBwxKAQcXGyQRoYEXJ");


#[program]
pub mod test_token_faucet {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        settings_bump: u8,
    ) -> ProgramResult {
        ctx.accounts.settings.owner = *ctx.accounts.owner.key;
        // ctx.accounts.settings.nonce = 1;
        ctx.accounts.settings.bump = settings_bump;

        Ok(())
    }

    pub fn create_mint(
        ctx: Context<CreateMint>,
        bump_mint: u8,
        _bump_mint_data: u8,
        // symbol: [u8; 8], // String,
        symbol: String,
        name: String,
    ) -> ProgramResult {
        // ctx.accounts.settings.nonce += 1;
        ctx.accounts.mint_data.name = name;
        ctx.accounts.mint_data.symbol = symbol;
        ctx.accounts.mint_data.bump_mint = bump_mint;

        Ok(())
    }

    pub fn mint_to(
        ctx: Context<MintTo>,
        // bump_seed: u8,
        // _bump_request: u8,
        amount: u64, // от 0 до 18 446 744 073 709 551 615
    ) -> ProgramResult {

        let seeds = &[
            state::Settings::SEED.as_ref(),
            &[ctx.accounts.settings.bump],
        ];

        token::mint_to(
            ctx.accounts.into_mint_to_context()
            .with_signer(&[&seeds[..]]),
            amount,
        )?;

        emit!(events::Minted {
            token: ctx.accounts.mint.key(),
            to: ctx.accounts.wallet.key(),
            amount,
        });

        Ok(())
    }
}

#[error]
pub enum ErrorCode {
    #[msg("Unknown Error")]
    UnknownError = 8000,
}
