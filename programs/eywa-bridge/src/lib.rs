use anchor_lang::{
    prelude::*,
    solana_program::{
        declare_id,
        instruction::Instruction,
        // keccak,
        program::{
            // invoke,
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

declare_id!("DXUDgvk4YH47J2HzRDKAsp5zcrvWDXqsCbD3HTghpyCo");

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

    /*
        function receiveRequestV2(
            bytes32 reqId,
            bytes memory b,
            address receiveSide,
            address bridgeFrom
        ) external onlyTrustedNode {

            // TODO check and repair this function
            // bytes32 recreateReqId = keccak256(abi.encodePacked(bridgeFrom, nonce[bridgeFrom], b, receiveSide, this, block.chainId));
            // require(reqId == recreateReqId, 'CONSISTENCY FAILED');
            require(dexBind[receiveSide] == true, 'UNTRUSTED DEX');

            (bool success, bytes memory data) = receiveSide.call(b);
            require(success && (data.length == 0 || abi.decode(data, (bool))), 'FAILED');

            nonce[bridgeFrom] = nonce[bridgeFrom] + 1;

            emit ReceiveRequest(reqId, receiveSide, reqId);
        }
    */
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
        let request_id = prepare_rq_id(
            &selector,
            opposite_bridge.clone(),
            chain_id,
            receive_side.clone(),
        );
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
            chainid: chain_id,
        };
        emit!(event);

        Ok(())
    }

    /**
        Mandatory for participants who wants to use a own contracts
        1. Contract A (chain A) should be bind with Contract B (chain B) only once!
        It's not allowed to  switch Contract A (chain A) to Contract C (chain B).
        This mandatory for prevent malicious behaviour.
        2. Contract A (chain A) could be bind with several contracts where every contract from another chain.
        For ex: Contract A (chain A) --> Contract B (chain B) + Contract A (chain A) --> Contract B' (chain B') ... etc

        function addContractBind(address from, address oppositeBridge, address to) external {
            require(to   != address(0), "NULL ADDRESS TO");
            require(from != address(0), "NULL ADDRESS FROM");
            require(is_in[to] == false, "TO ALREADY EXIST");
            // for prevent malicious behaviour like switching between older and newer contracts
            require(contractBind[from][oppositeBridge] == address(0), "UPDATE DOES NOT ALLOWED");
            contractBind[from][oppositeBridge] = to;
            is_in[to] = true;

        }
    */

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

/*
    contractBind[msg.sender][oppositeBridge] == receiveSide

    contractBind[from][oppositeBridge] = to;
    is_in[to] = true;
*/
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

/*
pub fn prepare_rq_id(
    selector: &Vec<u8>,
    opposite_bridge: String,//[u8; 20],
    chain_id: u64,
    receive_side: String,//[u8; 20],
) -> [u8;32] {
    let mut hasher = keccak::Hasher::default();
    hasher.hash(
        <(&Vec<u8>, String, u64, String) as borsh::BorshSerialize>::try_to_vec(&(selector, opposite_bridge, chain_id, receive_side))
            .unwrap()
            .as_slice(),
    );
    hasher.result().0
}
*/

#[error]
pub enum ErrorCode {
    /*
    #[msg("This is an error message clients will automatically display 1234")]
    Test = 1234,
    */
    #[msg("Unknown Bridge Error")]
    UnknownBridgeError = 5000,
    /*
    #[msg("Unauthorized")]
    Unauthorized = 2000,
    #[msg("UNTRUSTED DEX")]
    UntrustedDex,
    */
    #[msg("UNTRUSTED CONTRACT")]
    UntrustedContract,
    /*
    #[msg("index out of bounds")]
    IndexOutOfBounds,
    #[msg("value out of bounds")]
    ValueOutOfBounds,
    #[msg("invalid value")]
    InvalidValue,
    */
}
