use anchor_lang::{
    prelude::*,
    prelude::borsh::BorshDeserialize,
    AnchorSerialize,
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
    pub settings: Account<'info, crate::state::Settings>,
    #[account(signer)]
    pub owner: AccountInfo<'info>,
    // #[account(signer)]
    // bridge: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReceiveRequest<'info> {
    #[account(signer)]
    pub proposer: AccountInfo<'info>,
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
    pub signer: AccountInfo<'info>, // portal-synthesis || relayer
    // #[account(signer, mut)]
    // pub nonce_master_account: AccountInfo<'info>,
    // #[account(mut)]
    // pub bridge_nonce: AccountInfo<'info>,
    pub system_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
}
