use anchor_lang::prelude::*;

use crate::state as state;

// pub const PDA_MASTER_SEED: &[u8] = b"eywa-pda";
pub const PDA_RECEIVE_REQUEST_SEED: &[u8] = b"receive-request";


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
        // space = state::Settings::LEN,
        // space = 10000,
    )]
    pub settings: Account<'info, state::Settings>,
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(
    bump_seed: u8,
    opposite_bridge: [u8; 20],
)]
pub struct AddContractSendBind<'info> {
    #[account(
        mut,
        seeds = [ state::Settings::SEED.as_ref() ],
        bump = settings.bump
    )]
    pub settings: Account<'info, state::Settings>,
    #[account(
        init,
        payer = owner,
        seeds = [
            state::ContractSendBind::SEED.as_ref(),
            contract.key().as_ref(),
            &opposite_bridge[..]
        ],
        bump = bump_seed,
        // space = 10000,
    )]
    pub contract_bind: Account<'info, state::ContractSendBind>,
    pub bind_authority: AccountInfo<'info>,
    pub contract: AccountInfo<'info>,
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(
    bump_seed: u8,
    opposite_bridge: [u8; 20],
    contract: [u8; 20],
)]
pub struct AddContractReceiveBind<'info> {
    #[account(
        mut,
        seeds = [ state::Settings::SEED.as_ref() ],
        bump = settings.bump
    )]
    pub settings: Account<'info, state::Settings>,
    #[account(
        init,
        payer = owner,
        seeds = [
            state::ContractReceiveBind::SEED.as_ref(),
            contract.as_ref(),
            &opposite_bridge[..]
        ],
        bump = bump_seed,
        // space = 10000,
    )]
    pub contract_bind: Account<'info, state::ContractReceiveBind>,
    // pub bind_authority: AccountInfo<'info>,
    // pub contract: AccountInfo<'info>,
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReceiveRequest<'info> {
    #[account(
        mut,
        seeds = [ state::Settings::SEED.as_ref() ],
        bump = settings.bump
    )]
    pub settings: Account<'info, state::Settings>,
    pub request_id: AccountInfo<'info>,
    pub proposer: Signer<'info>,
    pub contract_bind: Account<'info, state::ContractReceiveBind>,
}

#[derive(Accounts)]
#[instruction(
    receive_side: [u8; 20],
)]
pub struct TransmitRequest<'info> {
    #[account(
        mut,
        seeds = [ state::Settings::SEED.as_ref() ],
        bump = settings.bump
    )]
    pub settings: Account<'info, state::Settings>,
    #[account(signer)]
    pub signer: AccountInfo<'info>,
    // pub signer: Signer<'info>,
    // #[account(signer, mut)]
    // pub nonce_master_account: AccountInfo<'info>,
    // #[account(mut)]
    // pub bridge_nonce: AccountInfo<'info>,
    pub system_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
}
