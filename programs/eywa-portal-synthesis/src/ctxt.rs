use anchor_lang::{
    prelude::*,
    prelude::borsh::BorshDeserialize,
    AnchorSerialize,
};
// use eywa_bridge::program::EywaBridge;
use crate::state::{
    MintData,
    Settings,
    SynthesizeRequestInfo,
};

pub const PDA_MASTER_SEED: &[u8] = b"eywa-pda";

#[derive(Accounts)]
#[instruction(
    bump_seed: u8,
)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = owner,
        seeds = [ PDA_MASTER_SEED.as_ref() ],
        bump = bump_seed,
    )]
    pub settings: Account<'info, Settings>,
    #[account(mut, signer)]
    pub owner: AccountInfo<'info>,
    // pub owner: Signer<'info>,
    pub bridge: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

/*
#[derive(Accounts)]
pub struct PortalInit<'info> {
    #[account(signer)]
    bridge: AccountInfo<'info>,
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
*/

#[derive(Accounts)]
#[instruction(
    bump_seed_mint: u8,
    bump_seed_data: u8,
    token_real: [u8; 20],
    synt_decimals: u8,
)]
pub struct CreateRepresentation<'info> {
    pub settings: Account<'info, crate::state::Settings>,
    #[account(
        init,
        seeds = [ b"mint-synt".as_ref(), &token_real[..] ],
        bump = bump_seed_mint,
        mint::decimals = synt_decimals,
        mint::authority = owner,
        payer = owner,
    )]
    pub mint_synt: Account<'info, anchor_spl::token::Mint>,
    #[account(
        init,
        seeds = [ b"mint-data".as_ref(), &token_real[..] ],
        bump = bump_seed_data,
        payer = owner,
        space = 1000,
    )]
    pub mint_data: Account<'info, MintData>,
    pub token_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub owner: Signer<'info>,
}

/*
#[derive(Accounts)]
#[instruction(nonce: u8)]
pub struct CreateSplAssociatedAccount<'info> {
    #[account(
        init,
        token = mint,
        authority = owner,
        seeds = [b"my-token-seed".as_ref(), &[nonce]],
        payer = owner,
        space = TokenAccount::LEN,
    )]
    account: CpiAccount<'info, TokenAccount>,
    token_program: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
    mint: CpiAccount<'info, Mint>,
    #[account(signer, mut)]
    pub owner: AccountInfo<'info>,
    rent: Sysvar<'info, Rent>,
}
*/

#[derive(Accounts)]
#[instruction(
    bump_seed_mint: u8,
    token_real: [u8; 20],
)]
pub struct MintSyntheticToken<'info> {
    #[account(
        mut,
        seeds = [ b"mint-synt".as_ref(), &token_real[..] ],
        bump = bump_seed_mint,
    )]
    pub mint_synt: Account<'info, anchor_spl::token::Mint>,
    #[account(mut, constraint = &to.owner == owner.key)]
    pub to: Account<'info, anchor_spl::token::TokenAccount>,
    // #[account(mut)]
    pub mint_data: ProgramAccount<'info, MintData>,
    pub this_program: AccountInfo<'info>,
    pub token_program: AccountInfo<'info>,
    // #[account(signer)]
    // pub owner: AccountInfo<'info>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct EmergencyUnsyntesizeRequest<'info> {
    #[account(mut)]
    pub mint: AccountInfo<'info>,
    #[account(mut)]
    pub mint_data: ProgramAccount<'info, MintData>,
}

#[derive(Accounts)]
pub struct BurnSyntheticToken<'info> {
    #[account(mut)]
    pub mint: AccountInfo<'info>,
    #[account(mut)]
    pub mint_data: ProgramAccount<'info, MintData>,
}

#[derive(Accounts)]
pub struct EmergencyUnburn<'info> {
    #[account(mut)]
    pub mint: AccountInfo<'info>,
    #[account(mut)]
    pub mint_data: ProgramAccount<'info, MintData>,
}

#[derive(Accounts)]
pub struct CreateRepresentationRequest<'info> {
    #[account(
        mut,
        seeds = [ PDA_MASTER_SEED.as_ref() ],
        bump = settings.bump
    )]
    pub settings: Account<'info, Settings>,
    // #[account(
    //     init,
    //     seeds = [b"my-mint-seed".as_ref()],
    //     bump = mint_bump,
    //     payer = authority,
    //     mint::decimals = 6,
    //     mint::authority = authority
    // )]
    // pub mint: Account<'info, Mint>,
    pub real_token: Account<'info, anchor_spl::token::Mint>,
    // #[account(
    //     init,
    //     // seeds = [ PDA_MASTER_SEED.as_ref() ],
    //     // bump = settings.bump,
    //     payer = owner,
    //     token::mint = real_token,
    //     token::authority = owner
    // )]
    // pub associated: Account<'info, anchor_spl::token::TokenAccount>,
    #[account(mut)]
    pub associated: AccountInfo<'info>,
    pub associated_token_program: AccountInfo<'info>,
    pub token_program: AccountInfo<'info>,
    pub system_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub owner: Signer<'info>,
}


#[derive(Accounts)]
#[instruction(
    bump_seed_synthesize_request: u8,
    amount: u64,
)]
pub struct Synthesize<'info> {
    // #[account(mut)]
    pub settings: Account<'info, Settings>,
    #[account(
        init,
        seeds = [
            b"synthesize-request".as_ref(),
            real_token.key().as_ref()
        ],
        bump = bump_seed_synthesize_request,
        // authority = pda_master,
        payer = client
    )]
    pub synthesize_request: ProgramAccount<'info, SynthesizeRequestInfo>,
    pub real_token: Account<'info, anchor_spl::token::Mint>,
    #[account(
        mut,
        constraint = source.amount >= amount
    )]
    pub source: Account<'info, anchor_spl::token::TokenAccount>,
    #[account(mut)]
    pub destination: Account<'info, anchor_spl::token::TokenAccount>,
    #[account(signer, mut)]
    pub client: AccountInfo<'info>,
    pub pda_master: AccountInfo<'info>,
    #[account(mut)]
    pub bridge_settings: Account<'info, eywa_bridge::state::Settings>,
    pub bridge_program: Program<'info, eywa_bridge::program::EywaBridge>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, anchor_spl::token::Token>,
    pub rent: Sysvar<'info, Rent>,
}
impl<'info> Synthesize<'info> {
    pub fn into_transfer_context(
        &self
    ) -> CpiContext<'_, '_, '_, 'info, anchor_spl::token::Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            anchor_spl::token::Transfer {
                from: self.source.to_account_info().clone(),
                to: self.destination.to_account_info().clone(),
                authority: self.pda_master.clone(),
            },
        )
    }
    pub fn into_transmit_request_context(
        &self
    ) -> CpiContext<'_, '_, '_, 'info, eywa_bridge::ctxt::TransmitRequest<'info>> {
        CpiContext::new(
            self.bridge_program.to_account_info(),
            eywa_bridge::ctxt::TransmitRequest {
                // puppet: ctx.accounts.puppet.clone(),
                // #[account(signer)]
                // pub signer: AccountInfo<'info>, // portal-synthesis
                signer: self.pda_master.clone(),
                // #[account(signer, mut)]
                // pub nonce_master_account: AccountInfo<'info>,
                // #[account(mut)]
                // pub bridge_nonce: AccountInfo<'info>,
                settings: self.bridge_settings.clone(),
                // pub system_program: AccountInfo<'info>,
                system_program: self.system_program.to_account_info(),
                // pub rent: Sysvar<'info, Rent>,
                rent: self.rent.clone(),
            },
        )
    }
}

#[derive(Accounts)]
#[instruction(
    bump_seed_synthesize_request: u8,
    // amount: u64,
)]
pub struct EmergencyUnsynthesize<'info> {
    // #[account(mut)]
    pub settings: Account<'info, Settings>,
    #[account(
        mut,
        seeds = [
            b"synthesize-request".as_ref(),
            real_token.key().as_ref()
        ],
        bump = bump_seed_synthesize_request,
        // authority = pda_master,
        // payer = client
    )]
    pub synthesize_request: ProgramAccount<'info, SynthesizeRequestInfo>,
    pub real_token: Account<'info, anchor_spl::token::Mint>,
    #[account(mut)]
    pub source: AccountInfo<'info>,
    #[account(mut)]
    pub destination: AccountInfo<'info>,
    // #[account(signer, mut)]
    // pub owner_account: AccountInfo<'info>,
    #[account(signer, mut)]
    pub client: AccountInfo<'info>,
    pub pda_master: AccountInfo<'info>,
    pub bridge_program: Program<'info, eywa_bridge::program::EywaBridge>,
    // pub system_program: Program<'info, System>,
    pub token_program: Program<'info, anchor_spl::token::Token>,
    // pub rent: Sysvar<'info, Rent>,
    // #[account(signer)]
    // pub bridge: AccountInfo<'info>,
}
impl<'info> EmergencyUnsynthesize<'info> {
    pub fn into_transfer_context(
        &self
    ) -> CpiContext<'_, '_, '_, 'info, anchor_spl::token::Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            anchor_spl::token::Transfer {
                from: self.source.to_account_info().clone(),
                to: self.destination.to_account_info().clone(),
                authority: self.pda_master.clone(),
            },
        )
    }
}

#[derive(Accounts)]
pub struct Unsynthesize<'info> {
    // #[account(mut)]
    pub settings: Account<'info, Settings>,
    #[account(mut)]
    pub unsynthesize_state: AccountInfo<'info>,
    #[account(mut, signer)]
    pub states_master_account: AccountInfo<'info>,
    #[account(mut)]
    pub source_account: AccountInfo<'info>,
    #[account(mut)]
    pub destination_account: AccountInfo<'info>,
    #[account(signer, mut)]
    pub owner_account: AccountInfo<'info>,
    pub spl_token_account: AccountInfo<'info>,
    pub system_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
    #[account(signer)]
    pub bridge: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct EmergencyUnburnRequest<'info> {
    // #[account(mut)]
    pub settings: Account<'info, Settings>,
    #[account(mut)]
    pub unsynthesize_state: AccountInfo<'info>,
    //unsynthesize_state: ProgramAccount<'info, UnsynthesizeStatesInfo>,
    #[account(mut, signer)]
    pub states_master_account: AccountInfo<'info>,
    #[account(signer, mut)]
    pub nonce_master_account: AccountInfo<'info>,
    #[account(mut)]
    pub bridge_nonce: AccountInfo<'info>,
    #[account(signer)]
    pub message_sender: AccountInfo<'info>,
    pub pda_master: AccountInfo<'info>,
    #[account(mut)]
    pub bridge_settings: Account<'info, eywa_bridge::state::Settings>,
    pub bridge_program: Program<'info, eywa_bridge::program::EywaBridge>,
    pub system_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
}
impl<'info> EmergencyUnburnRequest<'info> {
    // pub fn into_transfer_context(
    //     &self
    // ) -> CpiContext<'_, '_, '_, 'info, anchor_spl::token::Transfer<'info>> {
    //     CpiContext::new(
    //         self.token_program.to_account_info(),
    //         anchor_spl::token::Transfer {
    //             from: self.source.to_account_info().clone(),
    //             to: self.destination.to_account_info().clone(),
    //             authority: self.pda_master.clone(),
    //         },
    //     )
    // }
    pub fn into_transmit_request_context(
        &self
    ) -> CpiContext<'_, '_, '_, 'info, eywa_bridge::ctxt::TransmitRequest<'info>> {
        CpiContext::new(
            self.bridge_program.to_account_info(),
            eywa_bridge::ctxt::TransmitRequest {
                // puppet: ctx.accounts.puppet.clone(),
                // #[account(signer)]
                // pub signer: AccountInfo<'info>, // portal-synthesis
                signer: self.pda_master.clone(),
                // #[account(signer, mut)]
                // pub nonce_master_account: AccountInfo<'info>,
                // #[account(mut)]
                // pub bridge_nonce: AccountInfo<'info>,
                settings: self.bridge_settings.clone(),
                system_program: self.system_program.to_account_info(),
                // pub rent: Sysvar<'info, Rent>,
                rent: self.rent.clone(),
            },
        )
    }
}
