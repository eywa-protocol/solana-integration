#![cfg(feature = "test-bpf")]

use anchor_lang::{
    InstructionData,
    solana_program::{
        instruction::{
            AccountMeta,
            Instruction,
        },
        pubkey::Pubkey,
        system_program,
        // sysvar,
    },
};
use solana_program_test::*;
use solana_sdk::{
    signature::Signer,
    transaction::Transaction,
};
use anchor_lang::AnchorSerialize;

pub fn program_test() -> ProgramTest {

    ProgramTest::new(
        "test_token_faucet",
        test_token_faucet::id(),
        processor!(test_token_faucet::entry),
    )
}

/*
#[tokio::test]
async fn test_initialize() {
    let (mut banks_client, payer, recent_blockhash) = program_test().start().await;

    let (pda_settings, nonce) = Pubkey::find_program_address(
        &[eywa_bridge::state::Settings::SEED.as_ref()],
        &eywa_bridge::id(),
    );

    let ix_initialize = Instruction {
        program_id: eywa_bridge::id(),
        accounts: vec![
            AccountMeta::new(pda_settings, false),
            AccountMeta::new_readonly(payer.pubkey(), true),
            AccountMeta::new_readonly(system_program::id(), false),
        ],
        data: InstructionData::data(
            &eywa_bridge::instruction::Initialize {
                bump_seed: nonce,
            },
        ),
    };

    let mut transaction = Transaction::new_with_payer(
        &[ ix_initialize ],
        Some(&payer.pubkey()),
    );

    transaction.sign(&[&payer], recent_blockhash);
    let _res = banks_client.process_transaction(transaction).await.unwrap();
    // println!("statuses: {:?}", res);
}
*/
