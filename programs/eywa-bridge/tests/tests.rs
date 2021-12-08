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

/*
use eywa_bridge::{
    id,
    instruction,
    state::{
        Settings,
        StandaloneInstruction,
        TransactionAccount,
    },
};
*/

pub fn program_test() -> ProgramTest {

    ProgramTest::new(
        "eywa_bridge",
        eywa_bridge::id(),
        processor!(eywa_bridge::entry),
    )
}

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

#[tokio::test]
async fn test_receive_request() {
    /*
    let (mut banks_client, payer, recent_blockhash) = program_test().start().await;

    let (pda_settings, nonce) = Pubkey::find_program_address(
        &[eywa_bridge::state::Settings::SEED.as_ref()],
        &eywa_bridge::id(),
    );
    */

    let accounts: Vec<eywa_bridge::state::TransactionAccount> = vec![
        eywa_bridge::state::TransactionAccount {
            pubkey: Pubkey::new(&[34u8; 32]),
            is_signer: true,
            is_writable: false,
        },
        eywa_bridge::state::TransactionAccount {
            pubkey: Pubkey::new(&[68u8; 32]),
            is_signer: false,
            is_writable: true,
        },
        eywa_bridge::state::TransactionAccount {
            pubkey: Pubkey::new(&[119u8; 32]),
            is_signer: true,
            is_writable: true,
        },
    ];
    let sinst = eywa_bridge::state::StandaloneInstruction {
        accounts,
        program_id: eywa_bridge::id(),
        data: vec![85u8; 10],
    };
    let ix_receive_request = eywa_bridge::instruction::ReceiveRequest {
        bridge_from: [51u8; 20],
        sinst,
    };
    let data = InstructionData::data(&ix_receive_request);
    let str_sinst = data.iter().map(|b| format!("{:02X}", b)).collect::<String>();
    // let str_sinst = sinst.clone().try_to_vec().expect("Should always serialize").iter().map(|b| format!("{:02X}", b)).collect::<String>();
    println!("sinst: {:?}", str_sinst);
    /*
    assert_eq!(
        str_sinst,
        [
            "973B4B20920798E2",
            // ix_receive_request.discriminator().iter().map(|b| format!("{:02X}", b)).collect::<String>(),
            "3333333333333333333333333333333333333333",
            "03000000",
            "2222222222222222222222222222222222222222222222222222222222222222",
            "01",
            "00",
            "4444444444444444444444444444444444444444444444444444444444444444",
            "00",
            "01",
            "7777777777777777777777777777777777777777777777777777777777777777",
            "01",
            "01",
            "BA1A71993E6176E6D52BB39CC098D52400A9142448DAA756E9C1FF8F40C2AA44",
            "0A000000",
            "55555555555555555555",
        ].join(""),
        // ].iter().map(|s| s.to_string()).collect::<String>(),
    );

    let ix_receive_request = Instruction {
        program_id: eywa_bridge::id(),
        accounts: vec![
            AccountMeta::new(pda_settings, false),
            // pub request_id: AccountInfo<'info>,
            AccountMeta::new_readonly(Pubkey::new(&[0u8; 32]), false),
            AccountMeta::new_readonly(payer.pubkey(), true),
            // pub contract_bind: Account<'info, state::ContractReceiveBind>,
            AccountMeta::new_readonly(Pubkey::new(&[0u8; 32]), false),
        ],
        data,
    };

    let mut transaction = Transaction::new_with_payer(
        &[ ix_receive_request ],
        Some(&payer.pubkey()),
    );

    transaction.sign(&[&payer], recent_blockhash);
    let res = banks_client.process_transaction(transaction).await.unwrap();
    println!("statuses: {:?}", res);
    */
}
