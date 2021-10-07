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

use eywa_bridge::{
    id,
    instruction,
    state::{
        Settings,
        StandaloneInstruction,
        TransactionAccount,
    },
};

pub fn program_test() -> ProgramTest {
    ProgramTest::new(
        "eywa_bridge",
        id(),
        processor!(eywa_bridge::entry),
    )
}

#[tokio::test]
async fn test_state_new() {
    let (mut banks_client, payer, recent_blockhash) = program_test().start().await;

    let (pda_settings, nonce) = Pubkey::find_program_address(&[b"settings".as_ref()], &id());
    // let (program_signer, nonce) = Pubkey::find_program_address(&[], &id());
    // let seed = anchor_lang::ProgramState::<Settings>::seed();
    // let owner = id();
    // let program_state = Pubkey::create_with_seed(&program_signer, seed, &owner).unwrap();

    let ix_state_new = Instruction {
        program_id: id(),
        accounts: vec![
            AccountMeta::new(pda_settings, false),
            AccountMeta::new_readonly(payer.pubkey(), true),
            // AccountMeta::new(program_state, false),
            // AccountMeta::new_readonly(program_signer, false),
            AccountMeta::new_readonly(system_program::id(), false),
            // AccountMeta::new_readonly(id(), false),
            // AccountMeta::new_readonly(sysvar::rent::id(), false),
            // Accounts.Auth
            // AccountMeta::new_readonly(payer.pubkey(), false),
        ],
        data: InstructionData::data(
            &instruction::Initialize {
                bump_seed: nonce,
            },
        ),
    };

    let mut transaction = Transaction::new_with_payer(
        &[ ix_state_new ],
        Some(&payer.pubkey()),
    );

    transaction.sign(&[&payer], recent_blockhash);
    let res = banks_client.process_transaction(transaction).await.unwrap();
    println!("statuses: {:?}", res);
}

/*
#[tokio::test]
async fn test_receive_request() {
    let (mut banks_client, payer, recent_blockhash) = program_test().start().await;

    let accounts: Vec<TransactionAccount> = vec![];
    let ix_receive_request = Instruction {
        program_id: id(),
        accounts: vec![
        ],
        data: InstructionData::data(
            &instruction::ReceiveRequest {
                req_id: [0u8; 32],
                sinst: StandaloneInstruction {
                    accounts,
                    program_id: id(),
                    data: vec![0u8; 10],
                },
                bridge_from: [2u8; 20],
            },
        ),
    };

    let mut transaction = Transaction::new_with_payer(
        &[ ix_receive_request ],
        Some(&payer.pubkey()),
    );

    transaction.sign(&[&payer], recent_blockhash);
    let res = banks_client.process_transaction(transaction).await.unwrap();
    println!("statuses: {:?}", res);
}
*/
