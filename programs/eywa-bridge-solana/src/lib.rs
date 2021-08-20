use anchor_lang::{
    Key,
    prelude::*,
    prelude::borsh::BorshDeserialize,
    solana_program::{
        instruction::Instruction,
        keccak,
        program_error::ProgramError,
        program::{
            invoke,
            // invoke_signed,
        },
        system_program,
    },
    AnchorSerialize,
    AnchorDeserialize,
};
use anchor_spl::token::{
    self,
    // Mint,
    // TokenAccount,
    Transfer,
};
use spl_token::ID as SPL_TOKEN_PID;

/*
pub fn read_u8(current: &mut usize, data: &[u8]) -> Result<u8> {
    if data.len() < *current + 1 {
        return Err(ErrorCode::IndexOutOfBounds.into());
    }
    let e = data[*current];
    *current += 1;
    Ok(e)
}

pub fn read_pubkey(current: &mut usize, data: &[u8]) -> Result<Pubkey> {
    let len = std::mem::size_of::<Pubkey>();
    if data.len() < *current + len {
        return Err(ErrorCode::IndexOutOfBounds.into());
    }
    let e = Pubkey::new(&data[*current..*current + len]);
    *current += len;
    Ok(e)
}
*/

#[program]
pub mod eywa_bridge_solana {
    use super::*;

    // Singleton Data Account
    #[state]
    pub struct Settings {
        pub owner: Pubkey,
        // pub param: u64,
        // address public _listNode;
        // uint256 public requestCount = 1;
        pub portal_request_count: u64,
        pub bridge: Pubkey,
    }
    impl Settings {
        pub fn new(ctx: Context<Auth>) -> Result<Self> {
            Ok(Self {
                owner: *ctx.accounts.owner.key,
                // param: 100,
                portal_request_count: 0,
                bridge: ctx.accounts.bridge.key(),
            })
        }

    /*
        pub fn increment(&mut self, ctx: Context<Auth>) -> Result<()> {
            if &self.owner != ctx.accounts.owner.key {
                return Err(ErrorCode::Unauthorized.into());
            }
            self.param += 1;
            Ok(())
        }
    }

        // #region Portal

    #[state]
    pub struct Portal {
        pub request_count: u64,
        pub bridge: Pubkey,
    }

    impl Portal {
        pub fn new(_ctx: Context<PortalInit>) -> Result<Self> {
            Ok(Self {
                request_count: 0,
                bridge: _ctx.accounts.bridge.key(),
            })
        }
    */

        // #region Portal

        /*
            Тут к нам прилетают заапрувленные SPLки мы их забираем на свой аккаунт и
            через бридж сообщаем эфириумному синтезису, что надо генерить синты.
            Запоминаем id отправленной синтезису транзы, чтобы далее мониторить её состояние.

            На входе нам нужно:
            1. id (pubkey) spl-token`а и pubkey юзера, чтобы рассчитать аккаунт, с которого забирать
            2. Кол-во токенов
            3. chain_id
            4. адрес синтезиса в chain_id чейне
            5. адрес кошелька юзера в chain_id чейне
            6. адрес бриджа в chain_id чейне
        */
        pub fn synthesize(
            &mut self,
            ctx: Context<Synthesize>,
            real_token: [u8; 20], // String, // H160, // real token for synt
            amount: u64,
            chain_to_address: [u8; 20],
            receive_side: [u8; 20],
            opposite_bridge: [u8; 20],
            chain_id: u64,
        ) -> ProgramResult {
            /*
            // Залочить SPLки
            TransferHelper.safeTransferFrom(_token, _msgSender(), address(this), _amount);
            // Запомнить состояние
            balanceOf[_token] = balanceOf[_token].add(_amount);

            // посчитать внутренний идентификатор
            txID = keccak256(abi.encodePacked(this, requestCount));

            // сгенерировать вызов
            bytes memory out  = abi.encodeWithSelector(bytes4(
                keccak256(bytes('mintSyntheticToken(bytes32,address,uint256,address)'))
            ), txID, _token, _amount, _chain2address);
            // и передать наружу бэкенду
            IBridge(bridge).transmitRequestV2(out,_receiveSide, _oppositeBridge, _chainID);
            //  transmitRequestV2(
                    bytes memory _selector,
                    address receiveSide,
                    address oppositeBridge,
                    uint chainId
                ) onlyTrustedDex
            bytes32 requestId = prepareRqId(_selector, receiveSide, oppositeBridge, chainId);
            //  function prepareRqId(
                    bytes memory  _selector,
                    address receiveSide,
                    address oppositeBridge,
                    uint chainId
                )
            bytes32 requestId = keccak256(
                abi.encodePacked(this, nonce[oppositeBridge], _selector, receiveSide, oppositeBridge, chainId));
            nonce[oppositeBridge] = nonce[oppositeBridge] + 1;

            emit!(EvOracleRequest {
                "setRequest",
                address(this),
                requestId,
                _selector,
                receiveSide,
                oppositeBridge,
                chainId,
            });
            // end transmitRequestV2
            TxState storage txState = requests[txID];
            txState.recipient    = _msgSender();
            txState.chain2address    = _chain2address;
            txState.rtoken     = _token;
            txState.amount     = _amount;
            txState.state = RequestState.Sent;

            requestCount +=1;

            emit EvSynthesizeRequest(txID, _msgSender(), _chain2address, _amount, _token);
            */

            let cpi_accounts = Transfer {
                from: ctx.accounts.source_account.clone(),
                to: ctx.accounts.destination_account.clone(),
                authority: ctx.accounts.owner_account.clone(),
            };
            let cpi_program = ctx.accounts.spl_token_account.clone();
            let cpi_ctx = CpiContext::new(cpi_program.clone(), cpi_accounts);
            token::transfer(cpi_ctx, amount)?;

            let mut hasher = keccak::Hasher::default();
            hasher.hash(
                <(Pubkey, u64) as borsh::BorshSerialize>::try_to_vec(&(
                    *ctx.program_id,
                    self.portal_request_count,
                ))
                .map_err(|_| ProgramError::InvalidArgument)?
                .as_slice(),
            );
            let tx_id = hasher.result().0;

            let mut hasher = keccak::Hasher::default();
            hasher.hash(b"mintSyntheticToken(bytes32,address,uint256,address)");
            let title = hasher.result().0;

            let mut hasher = keccak::Hasher::default();
            hasher.hash(
                <([u8;32], [u8;32], [u8;20], u64, [u8;20]) as borsh::BorshSerialize>::try_to_vec(&(
                    title,
                    tx_id,
                    real_token,
                    amount,
                    chain_to_address))
                    .map_err(|_| ProgramError::InvalidArgument)?.as_slice());

            let out = hasher.result().0;

            let mut bridge_nonce: BridgeNonce = get_or_create_account_data(
                &ctx.accounts.bridge_nonce,
                &ctx.accounts.nonce_master_account,
                &ctx.accounts.system_program,
                &ctx.accounts.rent,
                8,
                //str::from_utf8(&opposite_bridge).map_err(|_| ProgramError::InvalidArgument)?,
                //TODO: Take seed from params
                "0,1,2,3,4,5,6,7,8",
                &[],
                ctx.program_id,
            )?;

            transmit_request(
                &out,
                receive_side,
                opposite_bridge,
                chain_id,
                &mut bridge_nonce.nonce,
                ctx.program_id,
            );

            bridge_nonce.serialize(&mut *ctx.accounts.bridge_nonce.try_borrow_mut_data()?)?;

            let synthesize_request = &mut ctx.accounts.synthesize_request;
            synthesize_request.tx_id = tx_id;
            synthesize_request.recipient = ctx.accounts.source_account.key();
            synthesize_request.chain_to_address = chain_to_address;
            synthesize_request.real_token = real_token;
            synthesize_request.amount = amount;
            synthesize_request.state = RequestState::Sent;

            self.portal_request_count += 1;

            let event = EvSynthesizeRequest {
                tx_id,
                from: ctx.accounts.source_account.key(),
                to: chain_to_address,
                amount,
                real_token,
            };
            emit!(event);

            Ok(())
        }


        /*
            can called only by bridge after initiation on a second chain

            Тут к нам прилетают через бридж отмены лока SPLек.
            Изменяем статус отправленной синтезису транзы по ранее сохранённому id.
            Возвращаем SPLки со своего аккаунта обратно владельцу.

            На входе нам нужно:
            1. tx_id, которую отменяем, остальное мы должны хранить сами

            onlyBridge
        */
        pub fn emergency_unsynthesize(
            &self,
            ctx: Context<EmergencyUnsynthesize>,
            tx_id: [u8; 32],
        ) -> ProgramResult {
            if *ctx.accounts.bridge.key != self.bridge {
                msg!("Portal: required bridge signature");
                return ProgramResult::Err(ProgramError::InvalidAccountData);
            }
            if *ctx.accounts.destination_account.key != ctx.accounts.synthesize_request.recipient {
                msg!("Portal: destination account doesn't match with recipient");
                msg!("{} {}", *ctx.accounts.destination_account.key, ctx.accounts.synthesize_request.recipient);
                return ProgramResult::Err(ProgramError::InvalidAccountData);
            }
            if ctx.accounts.synthesize_request.tx_id != tx_id {
                msg!("Portal: got synthesize_request account with another tx_id");
                msg!("{:?} {:?}", ctx.accounts.synthesize_request.tx_id, tx_id);
                return ProgramResult::Err(ProgramError::InvalidAccountData);
            }
            if ctx.accounts.synthesize_request.state != RequestState::Sent {
                msg!("Portal:state not open or tx does not exist");
                return ProgramResult::Err(ProgramError::InvalidAccountData);
            }

            ctx.accounts.synthesize_request.state = RequestState::Reverted;

            let cpi_accounts = Transfer {
                from: ctx.accounts.source_account.clone(),
                to: ctx.accounts.destination_account.clone(),
                authority: ctx.accounts.owner_account.clone(),
            };
            let cpi_program = ctx.accounts.spl_token_account.clone();
            let cpi_ctx = CpiContext::new(cpi_program.clone(), cpi_accounts);
            token::transfer(cpi_ctx, ctx.accounts.synthesize_request.amount)?;

            let event = EvRevertSynthesizeCompleted {
                id: tx_id,
                to: ctx.accounts.synthesize_request.recipient,
                amount: ctx.accounts.synthesize_request.amount,
                token: ctx.accounts.synthesize_request.real_token,
            };
            emit!(event);

            Ok(())
        }
    /*
    pub fn initialize(ctx: Context<Initialize>, admin: Pubkey, data: u64) -> ProgramResult {
        let acc_data = &mut ctx.accounts.data;

        acc_data.owner = admin;
        acc_data.data = data;

        Ok(())
    }

    pub fn update(ctx: Context<Update>, data: u64) -> Result<()> {
        let acc_data = &mut ctx.accounts.data;

        if data == 1234 {
            return Err(ErrorCode::Test.into());
        }

        acc_data.data = data;

        emit!(MyEvent {
            data,
            label: "hello".to_string(),
        });

        Ok(())
    }

    pub fn create_mint(ctx: Context<CreateMint>) -> ProgramResult {
        ctx.accounts.mint.supply = 0;
        Ok(())
    }
    */

        // synthesizeWithPermit – позже подумаем

        /*
            Тут к нам прилетают через бридж запросы на разлок SPLек при бёрнинге синтов.
            Проверяем состояние внешней tx_id в нашем аакаунте (должно быть Default)
            Отправляем SPLки со своего аккаунта обратно владельцу.
            Устанавливаем состояние внешней tx_id в нашем аакаунте в Unsynthesized

            На входе нам нужно:
            1. tx_id, для реплэй протекшена
            2. Кол-во токенов
            3. id (pubkey) spl-token`а и pubkey юзера, чтобы рассчитать аккаунты

            can called only by bridge after initiation on a second chain

            onlyBridge
        */
        pub fn unsynthesize( // BurnCompleted
            &self,
            ctx: Context<Unsynthesize>,
            token: Pubkey,
            tx_id: String,
            amount: u64,
        ) -> ProgramResult {
            if *ctx.accounts.bridge.key != self.bridge {
                msg!("Portal: required bridge signature");
                return ProgramResult::Err(ProgramError::InvalidAccountData);
            }
            let mut unsynthesize_state: UnsynthesizeStatesInfo = get_or_create_account_data(
                &ctx.accounts.unsynthesize_state,
                &ctx.accounts.states_master_account,
                &ctx.accounts.system_program,
                &ctx.accounts.rent,
                1,
                tx_id.as_str(),
                &[],
                ctx.program_id,
            )?;

            if unsynthesize_state.state != UnsynthesizeStates::Default {
                msg!("Portal: syntatic tokens emergencyUnburn");
                return ProgramResult::Err(ProgramError::InvalidArgument);
            }

            let cpi_accounts = Transfer {
                from: ctx.accounts.source_account.clone(),
                to: ctx.accounts.destination_account.clone(),
                authority: ctx.accounts.owner_account.clone(),
            };
            let cpi_program = ctx.accounts.spl_token_account.clone();
            let cpi_ctx = CpiContext::new(cpi_program.clone(), cpi_accounts);
            token::transfer(cpi_ctx, amount)?;

            unsynthesize_state.state = UnsynthesizeStates::Unsynthesized;
            unsynthesize_state
                .serialize(&mut *ctx.accounts.unsynthesize_state.try_borrow_mut_data()?)?;

            let event = BurnCompleted {
                id: tx_id,
                to: *ctx.accounts.destination_account.key,
                amount,
                token,
            };
            emit!(event);

            Ok(())
        }

        /*
            Revert burnSyntheticToken() operation, can be called several times

            Запрос от пользователя на отмену сжигания (разлока ???) SPLек.
            Реплей протекшн по состоянию Unsynthesized на оное действо.
            Устанавливаем состояние внешней tx_id в нашем аккаунте в RevertRequest.
            Отправляем в эфириум транзу с вызовом emergencyUnburn через бридж.

            На входе нам нужно:
            1. tx_id, для реплэй протекшена
            3. chain_id
            4. адрес синтезиса в chain_id чейне
            6. адрес бриджа в chain_id чейне

            RevertBurnRequest
        */
        pub fn emergency_unburn_request(
            &self,
            ctx: Context<EmergencyUnburnRequest>,
            tx_id: String,
            receive_side: [u8; 20],
            opposite_bridge: [u8; 20],
            chain_id: u64,
        ) -> ProgramResult {
            let key = Pubkey::create_with_seed(
                &ctx.accounts.states_master_account.key,
                tx_id.as_str(),
                &ctx.program_id,
            )?;
            if key != *ctx.accounts.unsynthesize_state.key {
                msg!("Portal: got unsynthesize_state account with another tx_id");
                return ProgramResult::Err(ProgramError::InvalidAccountData);
            }
            let mut unsynthesize_states_info = UnsynthesizeStatesInfo::try_from_slice(
                *ctx.accounts.unsynthesize_state.data.borrow(),
            )?;
            if unsynthesize_states_info.state != UnsynthesizeStates::Unsynthesized {
                msg!("Portal: Real tokens already transfered");
                return ProgramResult::Err(ProgramError::InvalidAccountData);
            }
            unsynthesize_states_info.state = UnsynthesizeStates::RevertRequest;
            unsynthesize_states_info
                .serialize(&mut *ctx.accounts.unsynthesize_state.try_borrow_mut_data()?)?;

            let mut hasher = keccak::Hasher::default();
            hasher.hash(b"emergencyUnburn(bytes32)");
            let title = hasher.result().0;

            let mut hasher = keccak::Hasher::default();
            hasher.hash(
                <([u8; 32], &str) as borsh::BorshSerialize>::try_to_vec(&(title, tx_id.as_str()))
                    .map_err(|_| ProgramError::InvalidArgument)?
                    .as_slice(),
            );

            let out = hasher.result().0;

            let mut bridge_nonce: BridgeNonce = get_or_create_account_data(
                &ctx.accounts.bridge_nonce,
                &ctx.accounts.nonce_master_account,
                &ctx.accounts.system_program,
                &ctx.accounts.rent,
                8,
                //TODO: Take seed from params
                "0,1,2,3,4,5,6,7,8",
                &[],
                ctx.program_id,
            )?;

            transmit_request(
                &out,
                receive_side,
                opposite_bridge,
                chain_id,
                &mut bridge_nonce.nonce,
                ctx.program_id,
            );

            let event = RevertBurnRequest {
                id: tx_id,
                to: *ctx.accounts.message_sender.key,
            };
            emit!(event);

            Ok(())
        }

        // #endregion Portal
        // #region Bridge

    /*
    pub fn create_token(ctx: Context<CreateToken>) -> ProgramResult {
        let token = &mut ctx.accounts.token;
        token.amount = 0;
        token.authority = *ctx.accounts.authority.key;
        token.mint = *ctx.accounts.mint.to_account_info().key;

        Ok(())
    }
    */

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

            solana_program::program::invoke_signed(
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
    }

    // #endregion Bridge
    // #region Syntesise

    // onlyOwner
    pub fn create_representation(
        ctx: Context<CreateRepresentation>,
        bump_seed_data: u8,
        bump_seed_mint: u8,
        token_real: [u8; 20], // String, // H160, // real token for synt
        // token_synt: Pubkey,
        synt_name: String,   // synt name
        synt_symbol: String, // synt short name
        synt_decimals: u8,
    ) -> ProgramResult {
        msg!("{}", format!(
            "\nbump_seed_data: {}\nbump_seed_mint: {}\n",
            bump_seed_data,
            bump_seed_mint,
        ));

        let ix_init_mint = &spl_token::instruction::initialize_mint(
            &SPL_TOKEN_PID,
            &ctx.accounts.mint.key(),
            &ctx.accounts.owner.key(),
            Some(&ctx.accounts.owner.key()),
            synt_decimals,
        )?;
        invoke(
            &ix_init_mint,
            &[
                ctx.accounts.mint.clone(),
                ctx.accounts.rent.to_account_info(),
                ctx.accounts.token_program.clone(),
            ],
        )?;

        ctx.accounts.mint_data.supply = 0;
        ctx.accounts.mint_data.name = synt_name;
        ctx.accounts.mint_data.symbol = synt_symbol;
        ctx.accounts.mint_data.token_real = token_real;
        ctx.accounts.mint_data.token_synt = ctx.accounts.mint.key();
        ctx.accounts.mint_data.decimals = synt_decimals;

        Ok(())
    }

    /*
    pub fn create_spl_associated_account(
        ctx: Context<CreateSplAssociatedAccount>,
        nonce: u8,
    ) -> ProgramResult {
        let message = format!(
            "\n1111111111 nonce: {}\n", nonce
        );
        msg!("{}", message);

        if ctx.accounts.account.data_is_empty() {
            let space = 20000;
            let rent = &Rent::from_account_info(&ctx.accounts.rent.to_account_info())?;
            let lamports = rent.minimum_balance(space);
            // let signer_seeds: &[&[_]] = &[b"escrow"];
            // let pda = Pubkey::create_with_seed(ctx.accounts.mint.key, "escrow", ctx.program_id)?;
            let (_pda, bump_seed) = Pubkey::find_program_address(&[b"escrow"], ctx.program_id);
            let seeds = &[&b"escrow"[..], &[bump_seed]];

            let message = format!(
                "\n1111111111PDA: {}\n", _pda
            );
            msg!("{}", message);


            invoke_signed(
                &system_instruction::create_account(
                    ctx.accounts.owner.key,
                    ctx.accounts.account.key,
                    lamports,
                    space as u64,
                    ctx.accounts.spl_program.key,
                ),
                &[ctx.accounts.owner.clone(), ctx.accounts.account.clone(), ctx.accounts.system_program.clone()],
                &[&seeds[..]],
            )?;

        let message = format!(
            "\0000000000000000000000: {}\n", ctx.accounts.token_program.key
        );
        msg!("{}", message);

        }
        let message = format!(
            "\n1111111111Program_id: {}\n", ctx.accounts.spl_program.key
        );
        msg!("{}", message);

        let cpi_accounts = InitializeAccount {
            account: ctx.accounts.account.clone(),
            mint: ctx.accounts.mint.clone(),
            authority: ctx.accounts.owner.clone(),
            rent: ctx.accounts.rent.to_account_info(),
        };
        let cpi_program = ctx.accounts.spl_program.clone();
        // let cpi_ctx = CpiContext::new_with_signer(cpi_program.clone(), cpi_accounts, &[&[b"escrow"]]);
        let cpi_ctx = CpiContext::new(cpi_program.clone(), cpi_accounts);
        token::initialize_account(cpi_ctx)?;

        Ok(())
    }
    */

    pub fn mint_synthetic_token(
        ctx: Context<MintSyntheticToken>,
        tx_id: [u8; 32],   // H256, // id for repley protection
        token_real: [u8; 20], // real token for synt
        amount: u64, // от 0 до 18 446 744 073 709 551 615
        to: Pubkey, // destination for minting synt
    ) -> ProgramResult { // onlyOwner
        let message = format!(
            "MintSyntheticToken: tx_id={:?}, token_real={:?}, amount={}, to={}",
            tx_id, token_real, amount, to,
        );
        msg!("{}", message);

        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.clone(),
            token::MintTo {
                mint: ctx.accounts.mint.clone(),
                to: ctx.accounts.to.clone(),
                authority: ctx.accounts.this_program.clone(),
            }
        );
        token::mint_to(cpi_ctx, amount)?;

        Ok(())
    }

    pub fn emergency_unsyntesize_request(
        ctx: Context<EmergencyUnsyntesizeRequest>,
        tx_id: [u8; 32],   // H256, // id for repley protection
    ) -> ProgramResult {
        let token_real = ctx.accounts.mint_data.token_real;
        let message = format!(
            "EmergencyUnsyntesizeRequest: tx_id={:?}, token_real={:?}",
            tx_id, token_real,
        );
        msg!("{}", message);

        Ok(())
    }

    pub fn burn_synthetic_token(
        ctx: Context<BurnSyntheticToken>,
        tx_id: [u8; 32],   // H256, // id for repley protection
        amount: u64,
        // chain2address ???
        // moved to ctx.accounts.mint_data // token_real: [u8; 20], // real token for synt
    ) -> ProgramResult {
        let token_real = ctx.accounts.mint_data.token_real;
        let message = format!(
            "BurnSyntheticToken: tx_id={:?}, token_real={:?}",
            tx_id, token_real,
        );
        msg!("{}", message);

        Ok(())
    }

    pub fn emergency_unburn( // onlyBridge
        ctx: Context<EmergencyUnburn>,
        tx_id: [u8; 32],   // H256, // id for repley protection
    ) -> ProgramResult {
        let token_real = ctx.accounts.mint_data.token_real;
        let message = format!(
            "EmergencyUnburn: tx_id={:?}, token_real={:?}",
            tx_id, token_real,
        );
        msg!("{}", message);

        Ok(())
    }

    // #endregion Syntesise

    pub fn hello(
        ctx: Context<Hello>,
        name: String,
    ) -> ProgramResult { // onlyOwner
        let message = format!(
            "Hello, {}!\n{}",
            name,
            ctx.accounts.person.key,
        );
        msg!("\n{}", message);

        Ok(())
    }

}

#[derive(Accounts)]
pub struct Hello<'info> {
    // #[account(signer)]
    person: AccountInfo<'info>,
}

pub fn transmit_request(
    selector: &[u8],
    receive_side: [u8; 20],
    opposite_bridge: [u8; 20],
    chain_id: u64,
    nonce: &mut u64,
    bridge: &Pubkey,
) {
    //bytes32 requestId = keccak256(abi.encodePacked(this, nonce[opposite_bridge], _selector, receive_side, opposite_bridge, chainId));
    let mut hasher = keccak::Hasher::default();
    hasher.hash(
        <(u64, &[u8], [u8; 20], [u8; 20], u64) as borsh::BorshSerialize>::try_to_vec(&(
            *nonce,
            selector,
            receive_side,
            opposite_bridge,
            chain_id,
        ))
        .unwrap()
        .as_slice(),
    );
    let request_id = hasher.result().0;
    *nonce += 1;
    let oracle_request = EvOracleRequest{
        request_type: "setRequest".to_string(),
        bridge: *bridge,
        request_id,
        selector: selector.to_vec(),
        receive_side,
        opposite_bridge,
        chain_id,
    };
    emit!(oracle_request);
}

pub fn create_account<'info>(
    data_account: &AccountInfo<'info>,
    master_account: &AccountInfo<'info>,
    system_program: &AccountInfo<'info>,
    rent: &Sysvar<'info, Rent>,
    space: u64,
    seed: &[&[&[u8]]],
) -> ProgramResult {
    let lamports = rent.minimum_balance(std::convert::TryInto::try_into(space).unwrap());
    let ix = anchor_lang::solana_program::system_instruction::create_account(
        master_account.key,
        data_account.key,
        lamports,
        space,
        master_account.owner,
    );

    let accounts = [
        master_account.clone(),
        data_account.clone(),
        system_program.clone(),
    ];

    anchor_lang::solana_program::program::invoke_signed(&ix, &accounts, seed)
}

pub fn create_account_with_seed<'info>(
    data_account: &AccountInfo<'info>,
    master_account: &AccountInfo<'info>,
    system_program: &AccountInfo<'info>,
    rent: &Sysvar<'info, Rent>,
    space: u64,
    seed: &str,
    seeds: &[&[&[u8]]],
    program_id: &Pubkey,
) -> ProgramResult {
    let lamports = rent.minimum_balance(std::convert::TryInto::try_into(space).unwrap());
    let ix = anchor_lang::solana_program::system_instruction::create_account_with_seed(
        master_account.key,
        data_account.key,
        master_account.key,
        seed,
        lamports,
        space,
        program_id,
    );

    let accounts = [
        master_account.clone(),
        data_account.clone(),
        system_program.clone(),
    ];

    anchor_lang::solana_program::program::invoke_signed(&ix, &accounts, seeds)
}

pub fn get_or_create_account_data<'info, T>(
    data_account: &AccountInfo<'info>,
    master_account: &AccountInfo<'info>,
    system_program: &AccountInfo<'info>,
    rent: &Sysvar<'info, Rent>,
    space: u64,
    seed: &str,
    seeds: &[&[&[u8]]],
    program_id: &Pubkey,
) -> std::result::Result<T, ProgramError>
where
    T: AccountSerialize + AccountDeserialize + Clone + BorshDeserialize,
{
    if *data_account.owner == system_program::ID {
        /*
        let lamports = rent.minimum_balance(std::convert::TryInto::try_into(space).unwrap());
        let ix = anchor_lang::solana_program::system_instruction::create_account_with_seed(
            master_account.key,
            data_account.key,
            master_account.key,
            seed,
            lamports,
        */
        create_account_with_seed(
            data_account,
            master_account,
            system_program,
            rent,
            space,
            seed,
            seeds,
            program_id,
        /*
        );

        let accounts = [
            master_account.clone(),
            data_account.clone(),
            system_program.clone(),
        ];
        anchor_lang::solana_program::program::invoke_signed(&ix, &accounts, seeds)?;
        */
        )?;
    }

    Ok(T::try_from_slice(*data_account.data.borrow())?)
}

// #region Events

#[event]
pub struct MyEvent {
    pub data: u64,
    #[index]
    pub label: String,
}

// #region Bridge

/*
    event OracleRequest(
        string  requestType,
        address bridge,
        bytes32 requestId,
        bytes   selector,
        address receive_side,
        address opposite_bridge,
        uint chainid
    );
*/
#[event]
pub struct EvOracleRequest {
    request_type: String,
    bridge: Pubkey,
    request_id: [u8; 32],
    selector: Vec<u8>,
    receive_side: [u8; 20],
    opposite_bridge: [u8; 20],
    chain_id: u64,
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

// #endregion Bridge
// #region Portal

/*
    event SynthesizeRequest(
        bytes32 indexed _id,
        address indexed _from,
        address indexed _to,
        uint _amount,
        address _token
    );
*/
#[event]
pub struct EvSynthesizeRequest {
    #[index]
    tx_id: [u8; 32], // H256, // id for repley protection
    from: Pubkey, // msgSender
    to: [u8; 20], // chain2address
    amount: u64,
    real_token: [u8; 20],
}
/*
    event RevertBurnRequest(bytes32 indexed _id, address indexed _to);
*/
/*
    event BurnCompleted(bytes32 indexed _id, address indexed _to, uint _amount, address _token);
*/
/*
    event RevertSynthesizeCompleted(bytes32 indexed _id, address indexed _to, uint _amount, address _token);
*/

#[event]
pub struct EvRevertSynthesizeCompleted {
    id: [u8; 32],
    to: Pubkey,
    amount: u64,
    pub token: [u8; 20],
}

// #endregion Portal

// #endregion Events
// #region DataAccounts

/*
#[account]
pub struct Mint {
    pub supply: u32,
}
*/

/* bridge => nonce */
#[account]
#[derive(Default)]
pub struct BridgeNonce {
    nonce: u64,
}

// mapping(address => uint) public nonce;
// mapping(address => bool) public dexBind;

#[account]
pub struct MintData {
    pub supply: u32,
    pub token_real: [u8; 20], // String, // H160, // real token for synt
    pub token_synt: Pubkey,
    pub name: String,   // synt name
    pub symbol: String, // synt short name
    pub decimals: u8,
}

// #[derive(Clone)]
// pub struct Mint(spl_token::state::Mint);

// impl anchor_lang::AccountDeserialize for Mint {
//     fn try_deserialize(buf: &mut &[u8]) -> Result<Self, ProgramError> {
//         Mint::try_deserialize_unchecked(buf)
//     }

//     fn try_deserialize_unchecked(buf: &mut &[u8]) -> Result<Self, ProgramError> {
//         spl_token::state::Mint::unpack(buf).map(Mint)
//     }
// }

// impl Deref for Mint {
//     type Target = spl_token::state::Mint;

//     fn deref(&self) -> &Self::Target {
//         &self.0
//     }
// }

/*
#[associated]
#[derive(Default)]
pub struct Token {
    pub amount: u32,
    pub authority: Pubkey,
    pub mint: Pubkey,
}

#[account]
pub struct DataAccount {
    pub owner: Pubkey,
    pub data: u64,
}
*/

#[derive(
    AnchorSerialize,
    AnchorDeserialize,
    Clone,
    PartialEq,
)]
pub enum RequestState {
    Default,
    Sent,
    Reverted,
}

#[account]
#[derive(Default)]
pub struct SynthesizeRequestInfo {
    tx_id: [u8; 32],
    recipient: Pubkey,
    chain_to_address: [u8; 20],
    real_token: [u8; 20],
    amount: u64,
    state: RequestState,
}

impl Default for RequestState {
    fn default() -> Self {
        RequestState::Default
    }
}

// #endregion DataAccounts
// #region for methods

#[derive(Accounts)]
pub struct Auth<'info> {
    #[account(signer)]
    owner: AccountInfo<'info>,
    // #[account(signer)]
    bridge: AccountInfo<'info>,
}

/*
#[derive(Accounts)]
pub struct PortalInit<'info> {
    #[account(signer)]
    bridge: AccountInfo<'info>,
}
*/

// #endregion for methods
// #region for functions

/*
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init)]
    pub data: ProgramAccount<'info, DataAccount>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut, has_one = owner)]
    pub data: ProgramAccount<'info, DataAccount>,
    #[account(signer)]
    pub owner: AccountInfo<'info>,
}
// *
#[derive(Accounts)]
pub struct CreateMint<'info> {
    #[account(init)]
    mint: ProgramAccount<'info, Mint>,
    rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CreateToken<'info> {
    #[account(init, associated = authority, with = mint)]
    token: ProgramAccount<'info, Token>,
    #[account(mut, signer)]
    authority: AccountInfo<'info>,
    mint: ProgramAccount<'info, Mint>,
    rent: Sysvar<'info, Rent>,
    system_program: AccountInfo<'info>,
}
// */
// #endregion for functions
// #region Synthesis

#[derive(Accounts)]
#[instruction(
    bump_seed_data: u8,
    bump_seed_mint: u8,
    token_real: [u8; 20],
)]
pub struct CreateRepresentation<'info> {
    #[account(
        init,
        seeds = [
            b"mint".as_ref(),
            &token_real,
            &[bump_seed_mint],
        ],
        payer = owner,
        space = 82,
        owner = SPL_TOKEN_PID,
    )]
    mint: AccountInfo<'info>,
    #[account(
        init,
        seeds = [
            b"mint-data".as_ref(),
            &token_real,
            &[bump_seed_data],
        ],
        payer = owner,
        space = 222,
        owner = program_id,
    )]
    mint_data: ProgramAccount<'info, MintData>,
    token_program: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
    rent: Sysvar<'info, Rent>,
    // #[account(mut, has_one = owner)]
    // pub data: ProgramAccount<'info, DataAccount>,
    #[account(signer)]
    pub owner: AccountInfo<'info>,
}

/*
#[derive(Accounts)]
#[instruction(nonce: u8)]
pub struct CreateSplAssociatedAccount<'info> {
    #[account(
        init,
        token = mint,
        authority = owner,
        seeds = [b"my-token-seed".as_ref(), &[nonce]],
        payer = owner,
        space = TokenAccount::LEN,
    )]
    account: CpiAccount<'info, TokenAccount>,
    token_program: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
    mint: CpiAccount<'info, Mint>,
    #[account(signer, mut)]
    pub owner: AccountInfo<'info>,
    rent: Sysvar<'info, Rent>,
}
*/

#[derive(Accounts)]
pub struct MintSyntheticToken<'info> {
    #[account(mut)]
    mint: AccountInfo<'info>,
    #[account(mut)]
    to: AccountInfo<'info>,
    #[account(mut)]
    mint_data: ProgramAccount<'info, MintData>,
    this_program: AccountInfo<'info>,
    token_program: AccountInfo<'info>,
    #[account(signer)]
    pub owner: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct EmergencyUnsyntesizeRequest<'info> {
    #[account(mut)]
    mint: AccountInfo<'info>,
    #[account(mut)]
    mint_data: ProgramAccount<'info, MintData>,
}

#[derive(Accounts)]
pub struct BurnSyntheticToken<'info> {
    #[account(mut)]
    mint: AccountInfo<'info>,
    #[account(mut)]
    mint_data: ProgramAccount<'info, MintData>,
}

#[derive(Accounts)]
pub struct EmergencyUnburn<'info> {
    #[account(mut)]
    mint: AccountInfo<'info>,
    #[account(mut)]
    mint_data: ProgramAccount<'info, MintData>,
}

// #endregion Synthesis
// #region Portal

#[derive(Accounts)]
pub struct Synthesize<'info> {
    #[account(init)]
    synthesize_request: ProgramAccount<'info, SynthesizeRequestInfo>,
    #[account(mut)]
    source_account: AccountInfo<'info>,
    #[account(mut)]
    destination_account: AccountInfo<'info>,
    #[account(signer, mut)]
    owner_account: AccountInfo<'info>,
    spl_token_account: AccountInfo<'info>,
    #[account(signer, mut)]
    nonce_master_account: AccountInfo<'info>,
    #[account(mut)]
    bridge_nonce: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
    rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct EmergencyUnsynthesize<'info> {
    #[account(mut)]
    synthesize_request: ProgramAccount<'info, SynthesizeRequestInfo>,
    #[account(mut)]
    source_account: AccountInfo<'info>,
    #[account(mut)]
    destination_account: AccountInfo<'info>,
    #[account(signer, mut)]
    owner_account: AccountInfo<'info>,
    spl_token_account: AccountInfo<'info>,
    #[account(signer)]
    bridge: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct Unsynthesize<'info> {
    #[account(mut)]
    unsynthesize_state: AccountInfo<'info>,
    #[account(mut, signer)]
    states_master_account: AccountInfo<'info>,
    #[account(mut)]
    source_account: AccountInfo<'info>,
    #[account(mut)]
    destination_account: AccountInfo<'info>,
    #[account(signer, mut)]
    owner_account: AccountInfo<'info>,
    spl_token_account: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
    rent: Sysvar<'info, Rent>,
    #[account(signer)]
    bridge: AccountInfo<'info>,
}

/*
    #[account(signer)]
    owner_account: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct EmergencyUnsynthesize<'info> {
*/

#[derive(Accounts)]
pub struct EmergencyUnburnRequest<'info> {
    #[account(mut)]
    unsynthesize_state: AccountInfo<'info>,
    //unsynthesize_state: ProgramAccount<'info, UnsynthesizeStatesInfo>,
    #[account(mut, signer)]
    states_master_account: AccountInfo<'info>,
    #[account(signer, mut)]
    nonce_master_account: AccountInfo<'info>,
    #[account(mut)]
    bridge_nonce: AccountInfo<'info>,
    #[account(signer)]
    message_sender: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
    rent: Sysvar<'info, Rent>,
}

// #endregion Portal
// #region Bridge

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

/*
#[account]
#[derive(Default)]
pub struct BridgeNonce {
    nonce: u64,
}

#[account]
#[derive(Default)]
pub struct SynthesizeRequestInfo {
    tx_id: [u8; 32],
    recipient: Pubkey,
    chain_to_address: [u8; 20],
    real_token: [u8; 20],
    amount: u64,
    state: RequestState,
}
*/

#[account]
#[derive(Default, Debug)]
pub struct UnsynthesizeStatesInfo {
    state: UnsynthesizeStates,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug)]
pub enum UnsynthesizeStates {
    Default,
    Unsynthesized,
    RevertRequest,
}

impl Default for UnsynthesizeStates {
    fn default() -> Self {
        UnsynthesizeStates::Default
    }
}

#[event]
pub struct SynthesizeRequest {
    id: [u8; 32],
    from: Pubkey,
    to: [u8; 20],
    amount: u64,
    real_token: [u8; 20],
}

/*
#[event]
pub struct OracleRequest {
    request_type: String,
    bridge: Pubkey,
    request_id: [u8; 32],
    selector: Vec<u8>,
    receive_side: [u8; 20],
    opposite_bridge: [u8; 20],
    chain_id: u64,
}
*/

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

#[event]
pub struct RevertSynthesizeCompleted {
    id: [u8; 32],
    to: Pubkey,
    amount: u64,
    token: [u8; 20],
}

#[event]
pub struct BurnCompleted {
    id: String,
    to: Pubkey,
    amount: u64,
    token: Pubkey,
}

#[event]
pub struct RevertBurnRequest {
    id: String,
    to: Pubkey,
}

/*
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum RequestState {
    Default,
    Sent,
    Reverted,
}

impl Default for RequestState {
    fn default() -> Self {
        RequestState::Default
    }
}
*/

#[derive(Accounts)]
pub struct ReceiveRequest<'info> {
    #[account(signer)]
    proposer: AccountInfo<'info>,
}

// #endregion Bridge
