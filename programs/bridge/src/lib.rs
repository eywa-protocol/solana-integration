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

declare_id!("TestBridge111111111111111111111111111111111");


#[program]
pub mod eywa_bridge {
    use super::*;

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
            &mut self,
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
            receive_side: [u8; 20],
            opposite_bridge: [u8; 20],
            chain_id: u64,
            // nonce: &mut u64,
        ) -> Result<()> {

            Ok(())
        }
    }
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
pub struct TransmitRequest<'info> {
    #[account(signer)]
    signer: AccountInfo<'info>, // portal-synthesis
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
        address receiveSide,
        bytes32 tx
    );
*/
#[event]
pub struct EvReceiveRequest {
    req_id: [u8; 32],
    receive_side: Pubkey,
    tx_id: [u8; 32],
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
