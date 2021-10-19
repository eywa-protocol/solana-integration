use anchor_lang::prelude::*;

use crate::state as state;


#[derive(Accounts)]
#[instruction(
    bump_seed: u8,
)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = owner,
        seeds = [ state::Settings::SEED.as_ref() ],
        bump = bump_seed,
        // space = 8 + 8 + 32 * 50 + 8 + 32 * 250 + 77,
        space = 10000,
    )]
    pub settings: Account<'info, state::Settings>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub bridge: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetBridge<'info> {
    #[account(
        mut,
        // constraint = &settings.owner == owner.key,
        seeds = [ state::Settings::SEED.as_ref() ],
        bump = settings.bump
    )]
    pub settings: Account<'info, state::Settings>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub bridge: AccountInfo<'info>,
    // pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetOwner<'info> {
    #[account(
        mut,
        // constraint = &settings.owner == owner.key,
        seeds = [ state::Settings::SEED.as_ref() ],
        bump = settings.bump
    )]
    pub settings: Account<'info, state::Settings>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub new_owner: AccountInfo<'info>,
    // pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(
    bump_seed_mint: u8,
    bump_seed_data: u8,
    token_real: [u8; 20],
    synt_decimals: u8,
)]
pub struct CreateRepresentation<'info> {
    #[account(
        mut,
        // constraint = &settings.owner == owner.key,
    )]
    pub settings: Account<'info, state::Settings>,
    #[account(
        init,
        seeds = [
            state::MintData::SYNT_SEED.as_ref(),
            token_real.as_ref()
        ],
        bump = bump_seed_mint,
        mint::decimals = synt_decimals,
        mint::authority = settings,
        payer = owner,
    )]
    pub mint_synt: Account<'info, anchor_spl::token::Mint>,
    #[account(
        init,
        seeds = [
            state::MintData::DATA_SEED.as_ref(),
            token_real.as_ref()
        ],
        bump = bump_seed_data,
        payer = owner,
        space = 10000,
    )]
    pub mint_data: Account<'info, state::MintData>,
    pub token_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    // pub pda_signer: AccountInfo<'info>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(
    bump_mint: u8,
    bump_request: u8,
)]
pub struct MintSyntheticToken<'info> {
    pub settings: Account<'info, state::Settings>,
    #[account(
        mut,
        seeds = [
            state::MintData::SYNT_SEED.as_ref(),
            mint_data.token_real.as_ref()
        ],
        bump = mint_data.bump_mint,
    )]
    pub mint_synt: Account<'info, anchor_spl::token::Mint>,
    pub mint_data: ProgramAccount<'info, state::MintData>,
    #[account(
        init,
        seeds = [
            state::SynthesizeStateData::SEED.as_ref(),
            mint_data.token_real.as_ref()
        ],
        bump = bump_request,
        payer = owner
    )]
    pub synthesize_state: ProgramAccount<'info, state::SynthesizeStateData>,
    #[account(mut)]
    pub to: Account<'info, anchor_spl::token::TokenAccount>,
    pub this_program: AccountInfo<'info>,
    pub token_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub owner: Signer<'info>,
}
impl<'info> MintSyntheticToken<'info> {
    pub fn into_mint_to_context(
        &self
    ) -> CpiContext<'_, '_, '_, 'info, anchor_spl::token::MintTo<'info>> {
        CpiContext::new(
            self.token_program.clone(),
            anchor_spl::token::MintTo {
                mint: self.mint_synt.to_account_info(),
                to: self.to.to_account_info(),
                authority: self.settings.to_account_info(),
            }
        )
    }
}

#[derive(Accounts)]
pub struct EmergencyUnsyntesizeRequest<'info> {
    pub settings: Account<'info, state::Settings>,
    #[account(
        mut,
        seeds = [
            state::SynthesizeStateData::SEED.as_ref(),
            real_token.key().as_ref()
        ],
        bump = synthesize_request.bump,
    )]
    pub synthesize_request: ProgramAccount<'info, state::SynthesizeStateData>,
    pub real_token: Account<'info, anchor_spl::token::Mint>,
    #[account(mut)]
    pub bridge_settings: Account<'info, eywa_bridge::state::Settings>,
    pub bridge_program: Program<'info, eywa_bridge::program::EywaBridge>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
impl<'info> EmergencyUnsyntesizeRequest<'info> {
    pub fn into_transmit_request_context(
        &self
    ) -> CpiContext<'_, '_, '_, 'info, eywa_bridge::ctxt::TransmitRequest<'info>> {
        CpiContext::new(
            self.bridge_program.to_account_info(),
            eywa_bridge::ctxt::TransmitRequest {
                signer: self.settings.to_account_info(),
                settings: self.bridge_settings.clone(),
                system_program: self.system_program.to_account_info(),
                rent: self.rent.clone(),
            },
        )
    }
}

#[derive(Accounts)]
#[instruction(
    bump: u8,
    // token_real: [u8; 20],
)]
pub struct BurnSyntheticToken<'info> {
    pub settings: Account<'info, state::Settings>,
    #[account(
        init,
        seeds = [
            state::TxState::SEED.as_ref(),
            mint_synt.key().as_ref()
        ],
        bump = bump,
        payer = client,
    )]
    pub tx_state: ProgramAccount<'info, state::TxState>,
    #[account(
        mut,
        seeds = [
            state::MintData::SYNT_SEED.as_ref(),
            mint_data.token_real.as_ref()
        ],
        bump = mint_data.bump_mint
    )]
    pub mint_synt: Account<'info, anchor_spl::token::Mint>,
    pub mint_data: ProgramAccount<'info, state::MintData>,
    #[account(signer, mut)]
    pub client: AccountInfo<'info>,
    #[account(mut)]
    pub to: Account<'info, anchor_spl::token::TokenAccount>,
    #[account(mut)]
    pub bridge_settings: Account<'info, eywa_bridge::state::Settings>,
    pub bridge_program: Program<'info, eywa_bridge::program::EywaBridge>,
    pub token_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
impl<'info> BurnSyntheticToken<'info> {
    pub fn into_burn_context(
        &self
    ) -> CpiContext<'_, '_, '_, 'info, anchor_spl::token::Burn<'info>> {
        CpiContext::new(
            self.bridge_program.to_account_info(),
            anchor_spl::token::Burn {
                mint: self.mint_synt.to_account_info(),
                to: self.to.to_account_info(),
                authority: self.settings.to_account_info(),
            },
        )
    }
    pub fn into_transmit_request_context(
        &self
    ) -> CpiContext<'_, '_, '_, 'info, eywa_bridge::ctxt::TransmitRequest<'info>> {
        CpiContext::new(
            self.bridge_program.to_account_info(),
            eywa_bridge::ctxt::TransmitRequest {
                signer: self.settings.to_account_info(),
                settings: self.bridge_settings.clone(),
                system_program: self.system_program.to_account_info(),
                rent: self.rent.clone(),
            },
        )
    }
}

#[derive(Accounts)]
pub struct EmergencyUnburn<'info> {
    pub settings: Account<'info, state::Settings>,
    #[account(
        mut,
        seeds = [
            state::TxState::SEED.as_ref(),
            mint_synt.key().as_ref()
        ],
        bump = tx_state.bump,
    )]
    pub tx_state: ProgramAccount<'info, state::TxState>,
    #[account(
        mut,
        seeds = [
            state::MintData::SYNT_SEED.as_ref(),
            mint_data.token_real.as_ref()
        ],
        bump = mint_data.bump_mint
    )]
    pub mint_synt: Account<'info, anchor_spl::token::Mint>,
    pub mint_data: ProgramAccount<'info, state::MintData>,
    #[account(mut)]
    pub to: Account<'info, anchor_spl::token::TokenAccount>,
    pub token_program: AccountInfo<'info>,

    pub bridge_signer: Signer<'info>,
}
impl<'info> EmergencyUnburn<'info> {
    pub fn into_mint_to_context(
        &self
    ) -> CpiContext<'_, '_, '_, 'info, anchor_spl::token::MintTo<'info>> {
        CpiContext::new(
            self.token_program.clone(),
            anchor_spl::token::MintTo {
                mint: self.mint_synt.to_account_info(),
                to: self.to.to_account_info(),
                authority: self.settings.to_account_info(),
            }
        )
    }
}

#[derive(Accounts)]
pub struct CreateRepresentationRequest<'info> {
    #[account(
        mut,
        constraint = &settings.owner == owner.key,
        seeds = [
            state::Settings::SEED.as_ref()
        ],
        bump = settings.bump
    )]
    pub settings: Account<'info, state::Settings>,
    pub real_token: Account<'info, anchor_spl::token::Mint>,
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
    #[account(mut)]
    pub settings: Account<'info, state::Settings>,
    #[account(
        init,
        seeds = [
            // state::SynthesizeStateData::SEED.as_ref(),
            state::TxState::SEED.as_ref(),
            real_token.key().as_ref()
        ],
        bump = bump_seed_synthesize_request,
        space = 10000,
        payer = client
    )]
    pub tx_state: ProgramAccount<'info, state::TxState>,
    // pub synthesize_request: ProgramAccount<'info, state::SynthesizeStateData>,
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
                authority: self.settings.to_account_info(),
            },
        )
    }
    pub fn into_transmit_request_context(
        &self
    ) -> CpiContext<'_, '_, '_, 'info, eywa_bridge::ctxt::TransmitRequest<'info>> {
        CpiContext::new(
            self.bridge_program.to_account_info(),
            eywa_bridge::ctxt::TransmitRequest {
                signer: self.settings.to_account_info(),
                settings: self.bridge_settings.clone(),
                system_program: self.system_program.to_account_info(),
                rent: self.rent.clone(),
            },
        )
    }
}

#[derive(Accounts)]
#[instruction(
    bump_seed_synthesize_request: u8,
)]
pub struct EmergencyUnsynthesize<'info> {
    // #[account(mut)]
    pub settings: Account<'info, state::Settings>,
    #[account(
        mut,
        seeds = [
            // state::SynthesizeStateData::SEED.as_ref(),
            state::TxState::SEED.as_ref(),
            real_token.key().as_ref()
        ],
        bump = bump_seed_synthesize_request,
    )]
    pub tx_state: ProgramAccount<'info, state::TxState>,
    pub real_token: Account<'info, anchor_spl::token::Mint>,
    #[account(mut)]
    pub source: AccountInfo<'info>,
    #[account(mut)]
    pub destination: AccountInfo<'info>,
    #[account(signer, mut)]
    pub client: AccountInfo<'info>,
    pub bridge_program: Program<'info, eywa_bridge::program::EywaBridge>,
    pub token_program: Program<'info, anchor_spl::token::Token>,
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
                authority: self.settings.to_account_info(),
            },
        )
    }
}

#[derive(Accounts)]
pub struct Unsynthesize<'info> {
    // #[account(mut)]
    pub settings: Account<'info, state::Settings>,
    pub real_token: Account<'info, anchor_spl::token::Mint>,
    #[account(mut)]
    pub unsynthesize_state: Account<'info, state::UnsynthesizeStateData>,
    // #[account(mut, signer)]
    // pub states_master_account: AccountInfo<'info>,
    #[account(mut)]
    pub source: AccountInfo<'info>,
    #[account(mut)]
    pub destination: AccountInfo<'info>,
    // #[account(signer, mut)]
    // pub owner_account: AccountInfo<'info>,
    pub token_program: AccountInfo<'info>,
    pub system_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
    #[account(signer)]
    pub bridge: AccountInfo<'info>,
}
impl<'info> Unsynthesize<'info> {
    pub fn into_transfer_context(
        &self
    ) -> CpiContext<'_, '_, '_, 'info, anchor_spl::token::Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            anchor_spl::token::Transfer {
                from: self.source.to_account_info().clone(),
                to: self.destination.to_account_info().clone(),
                authority: self.settings.to_account_info(),
            },
        )
    }
}

#[derive(Accounts)]
pub struct EmergencyUnburnRequest<'info> {
    // #[account(mut)]
    pub settings: Account<'info, state::Settings>,
    #[account(mut)]
    pub unsynthesize_state: Account<'info, state::UnsynthesizeStateData>,
    //unsynthesize_state: ProgramAccount<'info, UnsynthesizeStateData>,
    #[account(mut, signer)]
    pub states_master_account: AccountInfo<'info>,
    #[account(signer, mut)]
    pub nonce_master_account: AccountInfo<'info>,
    #[account(mut)]
    pub bridge_nonce: AccountInfo<'info>,
    #[account(signer)]
    pub message_sender: AccountInfo<'info>,
    // pub pda_master: AccountInfo<'info>,
    #[account(mut)]
    pub bridge_settings: Account<'info, eywa_bridge::state::Settings>,
    pub bridge_program: Program<'info, eywa_bridge::program::EywaBridge>,
    pub system_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
}
impl<'info> EmergencyUnburnRequest<'info> {
    pub fn into_transmit_request_context(
        &self
    ) -> CpiContext<'_, '_, '_, 'info, eywa_bridge::ctxt::TransmitRequest<'info>> {
        CpiContext::new(
            self.bridge_program.to_account_info(),
            eywa_bridge::ctxt::TransmitRequest {
                // signer: self.pda_master.clone(),
                signer: self.settings.to_account_info(),
                settings: self.bridge_settings.clone(),
                system_program: self.system_program.to_account_info(),
                rent: self.rent.clone(),
            },
        )
    }
}
