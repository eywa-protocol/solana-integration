use anchor_lang::{
    prelude::*,
    solana_program::{
        declare_id,
        instruction::Instruction,
        program::{
            invoke_signed,
        },
        pubkey::Pubkey,
    },
};

pub mod events;
pub mod state;
pub mod ctxt;

use state::*;
use ctxt::*;

std::include!("pid.in");

/*
pub fn get_hex_rep(byte_array: &[u8]) -> String {
    let build_string_vec: Vec<String> = byte_array
        .iter()
        .map(|d| { format!("{:02x}", &d) })
        .collect();

    build_string_vec.join("")
}
*/

#[program]
pub mod eywa_bridge {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        bump_seed: u8,
    ) -> ProgramResult {
        ctx.accounts.settings.owner = *ctx.accounts.owner.key;
        ctx.accounts.settings.nonce = 1;
        ctx.accounts.settings.bump = bump_seed;

        Ok(())
    }

    pub fn receive_request(
        ctx: Context<ReceiveRequest>,
        bridge_from: [u8; 20],
        sinst: StandaloneInstruction,
    ) -> Result<()> {
        let req_id = ctx.accounts.request_id.key();
        // TODO: check whether the sender is included in the list of trusted nodes
        // TODO: check pidTarget
        msg!("{}", format!("bridge_from: {:?}", bridge_from));
        msg!("{}", format!("req_id: {:?}", req_id));
        msg!("{}", format!("pid: {:?}", ctx.program_id));

        let sender_side = ctx.accounts.contract_bind.contract;

        let (signer, bump_seed) = Pubkey::find_program_address(
            &[PDA_RECEIVE_REQUEST_SEED],
            ctx.program_id,
        );
        msg!("{}", format!("signer: [{}]{:?}", bump_seed, signer));

        let mut accounts : std::vec::Vec<AccountMeta> = sinst
        .accounts
        .iter()
        .map(|acc| {
            msg!(
                "acc: {} (W: {}, S: {})",
                acc.pubkey, acc.is_writable, acc.is_signer,
            );
            if acc.is_writable {
                AccountMeta::new(acc.pubkey, acc.is_signer)
            } else {
                AccountMeta::new_readonly(acc.pubkey, acc.is_signer)
            }
        })
        .collect();
        accounts.push(AccountMeta::new_readonly(signer, true));

        let ix = Instruction {
            program_id: sinst.program_id,
            accounts,
            data: sinst.data,
        };

        invoke_signed(
            &ix,
            &ctx.remaining_accounts,
            &[&[&PDA_RECEIVE_REQUEST_SEED[..], &[bump_seed]]],
        )?;

        // nonce[bridgeFrom] = nonce[bridgeFrom] + 1;

        emit!(events::ReceiveRequest {
            req_id,
            receive_side: sinst.program_id,
            bridge_from,
            sender_side,
        });
        msg!("ReceiveRequest {:?}", req_id);

        Ok(())
    }

    pub fn transmit_request(
        ctx: Context<TransmitRequest>,
        selector: Vec<u8>,
        receive_side: [u8; 20],
        opposite_bridge: [u8; 20],
        chain_id: u64,
    ) -> ProgramResult {

        if !is_trusted_contract(
            receive_side,
            opposite_bridge,
            chain_id,
            ctx.program_id,
        ) {
            return ProgramResult::Err(ErrorCode::UntrustedContract.into());
        }

        /*
        msg!("{}", get_hex_rep(&selector[..]));
        */
        let request_id = *ctx.accounts.settings.to_account_info().key;

        ctx.accounts.settings.nonce += 1;

        let event = events::OracleRequest{
            request_type: "setRequest".to_string(),
            bridge: *ctx.program_id,
            request_id,
            selector,
            receive_side,
            opposite_bridge,
            chain_id,
        };
        emit!(event);

        Ok(())
    }

    pub fn test_oracle_request (
        ctx: Context<TestOracleRequest>,
        request_id: Pubkey,
        selector: Vec<u8>,
        receive_side: [u8; 20],
        opposite_bridge: [u8; 20],
        chain_id: u64,
    ) -> ProgramResult {

        let event = events::OracleRequest{
            request_type: "setRequest".to_string(),
            bridge: *ctx.program_id,
            request_id,
            selector,
            receive_side,
            opposite_bridge,
            chain_id: chain_id,
        };
        emit!(event);

        Ok(())
    }


    pub fn add_contract_send_bind(
        ctx: Context<AddContractSendBind>,
        // authority_bump: u8,
        opposite_bridge: [u8; 20],
    ) -> ProgramResult {
        ctx.accounts.contract_bind.contract = *ctx.accounts.contract.key;
        // ctx.accounts.contract_bind.bind_authority = *ctx.accounts.bind_authority.key;
        // ctx.accounts.contract_bind.authority_bump = authority_bump;
        ctx.accounts.contract_bind.opposite_bridge = opposite_bridge;

        Ok(())
    }

    pub fn add_contract_receive_bind(
        ctx: Context<AddContractReceiveBind>,
        _bump: u8,
        opposite_bridge: [u8; 20],
        contract: [u8; 20],
    ) -> ProgramResult {
        ctx.accounts.contract_bind.opposite_bridge = opposite_bridge;
        ctx.accounts.contract_bind.contract = contract;

        Ok(())
    }
}

fn is_trusted_contract(
    receive_side: [u8; 20],
    opposite_bridge: [u8; 20],
    _chain_id: u64,
    program_id: &Pubkey,
) -> bool {
    // TODO: check whether the sender is included in the list of trusted nodes
    let (
        _signer,
        _bump_seed,
    ) = Pubkey::find_program_address(
        &[
            Settings::SEED.as_ref(),
            receive_side.as_ref(),
            opposite_bridge.as_ref(),
        ],
        program_id,
    );

    true
}


#[error]
pub enum ErrorCode {
    #[msg("Unknown Bridge Error")]
    UnknownBridgeError = 5000,
    #[msg("UNTRUSTED CONTRACT")]
    UntrustedContract,
}
