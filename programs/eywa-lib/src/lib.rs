use anchor_lang::prelude::{AccountInfo, Rent, ProgramResult, Pubkey, ProgramError};
use anchor_lang::{Sysvar, AccountSerialize, AccountDeserialize};
use anchor_lang::prelude::borsh::BorshDeserialize;
use anchor_lang::solana_program::system_program;

pub fn create_account<'info>(
    data_account: &AccountInfo<'info>,
    master_account: &AccountInfo<'info>,
    system_program: &AccountInfo<'info>,
    rent: &Sysvar<'info, Rent>,
    space: u64,
    seed: &[&[&[u8]]],
) -> ProgramResult {
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

    anchor_lang::solana_program::program::invoke_signed(&ix, &accounts, seed)
}

pub fn create_account_with_seed<'info>(
    data_account: &AccountInfo<'info>,
    master_account: &AccountInfo<'info>,
    system_program: &AccountInfo<'info>,
    rent: &Sysvar<'info, Rent>,
    space: u64,
    seed: &str,
    seeds: &[&[&[u8]]],
    program_id: &Pubkey,
) -> ProgramResult {
    let lamports = rent.minimum_balance(std::convert::TryInto::try_into(space).unwrap());
    let ix = anchor_lang::solana_program::system_instruction::create_account_with_seed(
        master_account.key,
        data_account.key,
        master_account.key,
        seed,
        lamports,
        space,
        program_id,
    );

    let accounts = [
        master_account.clone(),
        data_account.clone(),
        system_program.clone(),
    ];

    anchor_lang::solana_program::program::invoke_signed(&ix, &accounts, seeds)
}

pub fn get_or_create_account_data<'info, T>(
    data_account: &AccountInfo<'info>,
    master_account: &AccountInfo<'info>,
    system_program: &AccountInfo<'info>,
    rent: &Sysvar<'info, Rent>,
    space: u64,
    seed: &str,
    seeds: &[&[&[u8]]],
    program_id: &Pubkey,
) -> std::result::Result<T, ProgramError>
    where
        T: AccountSerialize + AccountDeserialize + Clone + BorshDeserialize,
{
    if *data_account.owner == system_program::ID {
        create_account_with_seed(
            data_account,
            master_account,
            system_program,
            rent,
            space,
            seed,
            seeds,
            program_id,
        )?;
    }

    Ok(T::try_from_slice(*data_account.data.borrow())?)
}