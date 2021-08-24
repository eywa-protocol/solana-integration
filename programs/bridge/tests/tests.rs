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
        sysvar,
    },
};
use solana_program_test::*;
use solana_sdk::{
    signature::Signer,
    transaction::Transaction,
};

use bridge::{
    id,
    instruction,
    eywa_bridge::Settings,
};

pub fn program_test() -> ProgramTest {
    ProgramTest::new(
        "bridge",
        id(),
        processor!(bridge::entry),
    )
}

#[tokio::test]
async fn test_hello_world() {
    let (mut banks_client, payer, recent_blockhash) = program_test().start().await;

    let (program_signer, _nonce) = Pubkey::find_program_address(&[], &id());
    let seed = anchor_lang::ProgramState::<Settings>::seed();
    let owner = id();
    let program_state = Pubkey::create_with_seed(&program_signer, seed, &owner).unwrap();

    let ix_state_new = Instruction {
        program_id: id(),
        accounts: vec![
            AccountMeta::new_readonly(payer.pubkey(), true),
            AccountMeta::new(program_state, false),
            AccountMeta::new_readonly(program_signer, false),
            AccountMeta::new_readonly(system_program::id(), false),
            AccountMeta::new_readonly(id(), false),
            AccountMeta::new_readonly(sysvar::rent::id(), false),
            // Accounts.Auth
            AccountMeta::new_readonly(payer.pubkey(), false),
        ],
        data: InstructionData::data(
            &instruction::state::New { },
        ),
    };

    let mut transaction = Transaction::new_with_payer(
        &[ ix_state_new ],
        Some(&payer.pubkey()),
    );

    transaction.sign(&[&payer], recent_blockhash);
    banks_client.process_transaction(transaction).await.unwrap();
}
