
use anchor_lang::prelude::*;
use anchor_spl::token;

use crate::state as state;


#[derive(Accounts)]
#[instruction(
    settings_bump: u8,
)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = owner,
        seeds = [ state::Settings::SEED.as_ref() ],
        bump = settings_bump,
    )]
    pub settings: Account<'info, state::Settings>,
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(
    bump_mint: u8,
    bump_mint_data: u8,
    // symbol: [u8; 8], // String,
    symbol: String,
)]
pub struct CreateMint<'info> {
    // #[account(
    //     mut,
    //     seeds = [ state::Settings::SEED.as_ref() ],
    //     bump = settings.bump
    // )]
    pub settings: Account<'info, state::Settings>,
    #[account(
        init,
        seeds = [
            state::MintData::MINT_SEED.as_ref(),
            // &symbol[..]
            symbol.as_bytes()
        ],
        bump = bump_mint,
        payer = owner,
        mint::decimals = 6,
        mint::authority = settings
    )]
    pub mint: Account<'info, token::Mint>,
    #[account(
        init,
        seeds = [
            state::MintData::DATA_SEED.as_ref(),
            // &symbol[..]
            symbol.as_bytes()
        ],
        bump = bump_mint_data,
        payer = owner,
        space = 1000
    )]
    pub mint_data: Account<'info, state::MintData>,
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: AccountInfo<'info>,
}

#[derive(Accounts)]
// #[instruction(
//     bump_mint: u8,
// )]
pub struct MintTo<'info> {
    // #[account(
    //     mut,
    //     seeds = [ state::Settings::SEED.as_ref() ],
    //     bump = settings.bump
    // )]
    pub settings: Account<'info, state::Settings>,
    // #[account(
    //     mut,
    //     seeds = [
    //         state::MintData::MINT_SEED.as_ref(),
    //         // &mint_data.symbol[..]
    //         mint_data.symbol.as_bytes()
    //     ],
    //     // bump = bump_mint,
    //     bump = mint_data.bump_mint,
    //     // payer = owner,
    //     // mint::decimals = 6,
    //     // mint::authority = settings
    // )]
    #[account(mut)]
    pub mint: Account<'info, token::Mint>,
    // #[account(
    //     mut,
    //     seeds = [
    //         state::MintData::DATA_SEED.as_ref(),
    //         mint_data.symbol.to_bytes()
    //     ],
    //     bump = bump_seed_data,
    //     // payer = owner,
    //     // space = 10000,
    // )]
    pub mint_data: Account<'info, state::MintData>,
    #[account(mut)]
    pub wallet: AccountInfo<'info>,
    pub user: Signer<'info>,
    // pub system_program: Program<'info, System>,
    // pub rent: Sysvar<'info, Rent>,
    pub token_program: AccountInfo<'info>,
}
impl<'info> MintTo<'info> {
    pub fn into_mint_to_context(
        &self
    ) -> CpiContext<'_, '_, '_, 'info, anchor_spl::token::MintTo<'info>> {
        CpiContext::new(
            self.token_program.clone(),
            anchor_spl::token::MintTo {
                mint: self.mint.to_account_info(),
                to: self.wallet.to_account_info(),
                authority: self.settings.to_account_info(),
            }
        )
    }
}
