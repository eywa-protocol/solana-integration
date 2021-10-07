use anchor_lang::{
    prelude::*,
    prelude::borsh::BorshDeserialize,
    solana_program::{
        declare_id,
        instruction::Instruction,
        keccak,
        program::{
            // invoke,
            invoke_signed,
        },
        pubkey::Pubkey,
        // system_program,
    },
    AnchorSerialize,
    AnchorDeserialize,
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
    // use eywa_lib::get_or_create_account_data;

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
            // &mut self,
            ctx: Context<ReceiveRequest>,
            req_id: [u8; 32], // bytes32 reqId,
            sinst: StandaloneInstruction,
            // bytes memory b, address receiveSide,
            bridge_from: [u8; 20], // address bridgeFrom
        ) -> Result<()> {
            // use std::convert::*;
            // TODO: check whether the sender is included in the list of trusted nodes
            // TODO: check pidTarget
            msg!("{}", format!("bridge_from: {:?}", bridge_from));
            msg!("{}", format!("req_id: {:?}", req_id));
            msg!("{}", format!("pid: {:?}", ctx.program_id));

            let seed = b"receive-request-seed";
            let (signer, bump_seed) = Pubkey::find_program_address(&[seed], ctx.program_id);
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
            // accounts.push(AccountMeta::new(signer, true));

            let ix = Instruction {
                program_id: sinst.program_id,
                accounts,
                data: sinst.data,
            };

            invoke_signed(
                &ix,
                &ctx.remaining_accounts,
                &[&[&seed[..], &[bump_seed]]],
            )?;

            // nonce[bridgeFrom] = nonce[bridgeFrom] + 1;

            emit!(events::ReceiveRequest {
                req_id,
                receive_side: sinst.program_id,
                tx_id: req_id, // ???
            });
            msg!("ReceiveRequest {:?}", req_id);

            Ok(())
        }

        pub fn transmit_request(
            // &mut self,
            ctx: Context<TransmitRequest>,
            selector: Vec<u8>,
            receive_side: String,//[u8; 20],
            opposite_bridge: String,//[u8; 20],
            chain_id: u64,
        ) -> ProgramResult {
            // TODO: check whether the sender is included in the list of trusted nodes

            let request_id = prepare_rq_id(
                &selector,
                opposite_bridge.clone(),
                chain_id,
                receive_side.clone(),
            );

            ctx.accounts.settings.nonce += 1;

            let event = events::OracleRequest{
                request_type: "setRequest".to_string(),
                bridge: *ctx.program_id,
                request_id,
                selector,
                receive_side,
                opposite_bridge,
                chainid: chain_id, // : 0
            };
            emit!(event);

            Ok(())
        }
    // }
}

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


#[error]
pub enum ErrorCode {
    #[msg("This is an error message clients will automatically display 1234")]
    Test = 1234,
    #[msg("Unauthorized")]
    Unauthorized = 2000,
    #[msg("UNTRUSTED DEX")]
    UntrustedDex,
    #[msg("index out of bounds")]
    IndexOutOfBounds,
    #[msg("value out of bounds")]
    ValueOutOfBounds,
    #[msg("invalid value")]
    InvalidValue,
}
