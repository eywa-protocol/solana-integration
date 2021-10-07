#![cfg(feature = "test-bpf")]

use std::str::FromStr;
use anchor_lang::{
    InstructionData,
    solana_program::{
        instruction::{
            AccountMeta,
            Instruction,
        },
        pubkey::Pubkey,
    },
};
use solana_program_test::*;
use solana_sdk::{
    signature::Signer,
    transaction::Transaction,
};

use test_stub::{
    id,
    instruction,
};

pub fn program_test() -> ProgramTest {
    ProgramTest::new(
        "test_stub",
        id(),
        processor!(test_stub::entry),
    )
}

#[tokio::test]
async fn test_hello_world() {
    let (mut banks_client, payer, recent_blockhash) = program_test().start().await;
    let pub_test_acc = Pubkey::from_str("TestPubkey111111111111111111111111111111111").unwrap();

    let ix_hello = Instruction {
        program_id: id(),
        accounts: vec![
            AccountMeta::new_readonly(pub_test_acc, false),
        ],
        data: InstructionData::data(
            &instruction::Hello {
                name: "World".to_string(),
            },
        ),
    };

    let mut transaction = Transaction::new_with_payer(
        &[ ix_hello ],
        Some(&payer.pubkey()),
    );

    transaction.sign(&[&payer], recent_blockhash);
    banks_client.process_transaction(transaction).await.unwrap();
}
