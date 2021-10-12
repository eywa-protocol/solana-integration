use anchor_lang::prelude::*;


pub const PDA_MASTER_SEED: &[u8] = b"eywa-pda";
pub const PDA_RECEIVE_REQUEST_SEED: &[u8] = b"receive-request";


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
    pub settings: Account<'info, crate::state::Settings>,
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReceiveRequest<'info> {
    pub proposer: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(
    receive_side: [u8; 20],
)]
pub struct TransmitRequest<'info> {
    #[account(
        mut,
        seeds = [ PDA_MASTER_SEED.as_ref() ],
        bump = settings.bump
    )]
    pub settings: Account<'info, crate::state::Settings>,
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
