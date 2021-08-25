use anchor_lang::{
    // Key,
    prelude::*,
    prelude::borsh::BorshDeserialize,
    solana_program::{
        declare_id,
        instruction::Instruction,
        // keccak,
        program_error::ProgramError,
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
use anchor_lang::solana_program::keccak;

declare_id!("TestBridge111111111111111111111111111111111");


#[program]
pub mod eywa_bridge {
    use super::*;
    use eywa_lib::get_or_create_account_data;
    use anchor_lang::solana_program::keccak;

    // Singleton Data Account
    #[state]
    pub struct Settings {
        pub owner: Pubkey,
        nonce: u64,
    }

    impl Settings {
        pub fn new(ctx: Context<Auth>) -> Result<Self> {
            Ok(Self {
                owner: *ctx.accounts.owner.key,
                nonce: 0,
            })
        }

        /*
            function receiveRequestV2(
                bytes32 reqId,
                bytes memory b,
                address receive_side,
                address bridgeFrom
            ) external onlyTrustedNode {

                // TODO check and repair this function
                // bytes32 recreateReqId = keccak256(abi.encodePacked(bridgeFrom, nonce[bridgeFrom], b, receive_side, this, block.chainId));
                // require(reqId == recreateReqId, 'CONSISTENCY FAILED');
                require(dexBind[receive_side] == true, 'UNTRUSTED DEX');

                (bool success, bytes memory data) = receive_side.call(b);
                require(success && (data.length == 0 || abi.decode(data, (bool))), 'FAILED');

                nonce[bridgeFrom] = nonce[bridgeFrom] + 1;

                emit ReceiveRequest(reqId, receive_side, reqId);
            }
        */
        pub fn receive_request(
            &mut self,
            ctx: Context<ReceiveRequest>,
            req_id: [u8; 32], // bytes32 reqId,
            sinst: StandaloneInstruction,
            // bytes memory b, address receive_side,
            bridge_from: [u8; 20], // address bridgeFrom
        ) -> Result<()> {
            // use std::convert::*;
            // TODO: check whether the sender is included in the list of trusted nodes
            // TODO: check pidTarget
            msg!("{}", format!("bridge_from: {:?}", bridge_from));
            msg!("{}", format!("req_id: {:?}", req_id));

            let ix = Instruction {
                program_id: sinst.program_id,
                accounts: sinst
                .accounts
                .iter()
                .map(|acc| {
                    msg!("{}", format!("acc.pubkey: {}", acc.pubkey));
                    if acc.is_writable {
                        AccountMeta::new(acc.pubkey, acc.is_signer)
                    } else {
                        AccountMeta::new_readonly(acc.pubkey, acc.is_signer)
                    }
                })
                .collect(),
                data: sinst.data,
            };

            let seeds = &[
                b"receive-request-seed".as_ref(),
            ];
            let signer = &[&seeds[..]];

            invoke_signed(
                &ix,
                &ctx.remaining_accounts,
                signer,
            )?;

            // nonce[bridgeFrom] = nonce[bridgeFrom] + 1;

            emit!(EvReceiveRequest {
                req_id,
                receive_side: sinst.program_id,
                tx_id: req_id, // ???
            });
            msg!("EvReceiveRequest {:?}", req_id);

            Ok(())
        }

        pub fn transmit_request(
            &mut self,
            ctx: Context<TransmitRequest>,
            selector: Vec<u8>,
            receive_side: String,//[u8; 20],
            opposite_bridge: String,//[u8; 20],
            chain_id: u64,
        ) -> ProgramResult {
            // TODO: check whether the sender is included in the list of trusted nodes

            let request_id = prepare_rq_id(&selector, opposite_bridge.clone(), chain_id, receive_side.clone());

            let mut bridge_nonce: BridgeNonce = get_or_create_account_data(
                &ctx.accounts.bridge_nonce,
                &ctx.accounts.nonce_master_account,
                &ctx.accounts.system_program,
                &ctx.accounts.rent,
                8,
                (opposite_bridge.clone() + receive_side.as_str()).as_str(),
                &[],
                ctx.program_id,
            )?;
            bridge_nonce.nonce += 1;
            bridge_nonce.serialize(&mut *ctx.accounts.bridge_nonce.try_borrow_mut_data()?)?;
            
            let event = OracleRequest{
                request_type: "setRequest".to_string(),
                bridge: *ctx.program_id,
                request_id,
                selector,
                receive_side,
                opposite_bridge,
                chainid: 0
            };
            emit!(event);

            Ok(())
        }
    }
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

#[derive(Accounts)]
pub struct Auth<'info> {
    #[account(signer)]
    pub owner: AccountInfo<'info>,
    // #[account(signer)]
    // bridge: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct ReceiveRequest<'info> {
    #[account(signer)]
    proposer: AccountInfo<'info>,
}

#[derive(Accounts)]
#[instruction(
    receive_side: [u8; 20],
)]
pub struct TransmitRequest<'info> {
    #[account(signer)]
    signer: AccountInfo<'info>, // portal-synthesis
    #[account(signer, mut)]
    nonce_master_account: AccountInfo<'info>,
    #[account(mut)]
    bridge_nonce: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
    rent: Sysvar<'info, Rent>,
}

#[account]
pub struct ContractBind {
    sender_side: [u8; 20],
}

#[account]
#[derive(Default)]
pub struct BridgeNonce {
    nonce: u64,
}

#[derive(
    AnchorSerialize,
    AnchorDeserialize,
    Clone,
    PartialEq,
)]
pub struct TransactionAccount {
    pubkey: Pubkey,
    is_signer: bool,
    is_writable: bool,
}

impl From<TransactionAccount> for AccountMeta {
    fn from(account: TransactionAccount) -> AccountMeta {
        match account.is_writable {
            false => AccountMeta::new_readonly(account.pubkey, account.is_signer),
            true => AccountMeta::new(account.pubkey, account.is_signer),
        }
    }
}

#[derive(
    AnchorSerialize,
    AnchorDeserialize,
    Clone,
    PartialEq,
)]
pub struct StandaloneInstruction {
    accounts: Vec<TransactionAccount>,
    program_id: Pubkey,
    data: Vec<u8>,
}

/*
    event ReceiveRequest(
        bytes32 reqId,
        address receive_side,
        bytes32 tx
    );
*/
#[event]
pub struct EvReceiveRequest {
    req_id: [u8; 32],
    receive_side: Pubkey,
    tx_id: [u8; 32],
}

#[event]
pub struct OracleRequest {
    request_type: String ,
    bridge: Pubkey,
    request_id: [u8; 32],
    selector: Vec<u8>,
    receive_side: String, //[u8; 20],
    opposite_bridge: String, //[u8; 20],
    chainid: u64,

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
