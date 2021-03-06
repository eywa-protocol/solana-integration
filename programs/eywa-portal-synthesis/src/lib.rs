use anchor_lang::{
    Key,
    prelude::*,
    solana_program::{
        // keccak,
        program_error::ProgramError,
    },
    AnchorSerialize,
    AnchorDeserialize,
};
use anchor_spl::token;


pub mod events;
pub mod state;
pub mod ctxt;

use ctxt::*;


std::include!("pid.in");

#[program]
pub mod eywa_portal_synthesis {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        bump_seed: u8,
    ) -> ProgramResult {
        ctx.accounts.settings.owner = ctx.accounts.owner.key();
        ctx.accounts.settings.synthesis_request_count = 0;
        ctx.accounts.settings.portal_request_count = 0;
        ctx.accounts.settings.bridge = ctx.accounts.bridge.key();
        ctx.accounts.settings.bump = bump_seed;

        Ok(())
    }

    pub fn set_bridge(
        ctx: Context<SetBridge>,
    ) -> ProgramResult {
        ctx.accounts.settings.bridge = ctx.accounts.bridge.key();

        Ok(())
    }

    pub fn set_owner(
        ctx: Context<SetOwner>,
    ) -> ProgramResult {
        ctx.accounts.settings.owner = ctx.accounts.new_owner.key();

        Ok(())
    }


    // changeBridge onlyOwner
    // should be restricted in mainnets

    // versionRecipient
    // return "2.0.1";


    // #region Synthesis

    // mintSyntheticToken onlyBridge
    // can called only by bridge after initiation on a second chain
    pub fn mint_synthetic_token(
        ctx: Context<MintSyntheticToken>,
        // _bump_mint: u8,
        _tx_id: [u8; 32],   // H256, // id for replay protection
        _bump_request: u8,
        amount: u64, // от 0 до 18 446 744 073 709 551 615
    ) -> ProgramResult {
        // msg!("123");

        let seeds = &[
            state::Settings::SEED.as_ref(),
            &[ctx.accounts.settings.bump],
        ];

        // TODO add chek to Default - чтобы не было по бриджу
        /*
        if ctx.accounts.bridge_signer.key() != ctx.accounts.settings.bridge_signer {
            return ProgramResult::Err(ErrorCode::OnlyBridge.into());
        }
        */
        // require(
        //     synthesizeStates[_txID] == SynthesizeState.Default,
        //     "Synt: emergencyUnsynthesizedRequest called or tokens has been already synthesized"
        // );
        /*
        if ctx.accounts.synthesize_request { // checked by Anchor 'init' account
            // "Synt: emergencyUnsynthesizedRequest called or tokens has been already synthesized"
            return ProgramResult::Err(ErrorCode::OnlyBridge.into());
        }
        */
        token::mint_to(
            ctx.accounts.into_mint_to_context()
            .with_signer(&[&seeds[..]]),
            amount,
        )?;

        // synthesizeStates[_txID] = SynthesizeState.Synthesized;
        ctx.accounts.synthesize_state.state = crate::state::SynthesizeState::Synthesized;
        // ctx.accounts.synthesize_state.tx_id = tx_id; // ???

        emit!(events::SynthesizeCompleted {
            id: ctx.accounts.synthesize_state.key(),
            to: ctx.accounts.to.key(),
            amount,
            token: ctx.accounts.mint_data.token_real,
        });

        Ok(())
    }

    // emergencyUnsyntesizeRequest
    // Revert synthesize() operation, can be called several times
    pub fn emergency_unsyntesize_request(
        ctx: Context<EmergencyUnsyntesizeRequest>,
    ) -> ProgramResult {
        let token_real = ctx.accounts.real_token.key();
        let tx_id = ctx.accounts.synthesize_request.key();

        let seeds = &[
            &crate::state::Settings::SEED[..],
            &[ctx.accounts.settings.bump],
        ];

        let f = ethabi::Function {
            name: "emergencyUnsynthesize".to_owned(),
            inputs: vec![
                ethabi::Param { name: "_txID".to_owned(), kind: ethabi::ParamType::FixedBytes(32), internal_type: None },
            ],
			outputs: vec![],
			constant: false,
			state_mutability: ethabi::StateMutability::default(),
        };
        let calldata = f.encode_input(&[ethabi::Token::FixedBytes(tx_id.to_bytes().to_vec())]).unwrap();

        eywa_bridge::cpi::transmit_request(
            ctx.accounts.into_transmit_request_context()
            .with_signer(&[&seeds[..]]),
            calldata,
            ctx.accounts.synthesize_request.chain_to_address,
            ctx.accounts.synthesize_request.opposite_bridge,
            ctx.accounts.synthesize_request.chain_id,
        )?;

        // emit RevertSynthesizeRequest(_txID, _msgSender());
        emit!(events::RevertSynthesizeRequest {
            id: tx_id,
            to: ctx.accounts.synthesize_request.recipient,
        });

        Ok(())
    }

    // burnSyntheticToken
    // sToken -> Token on a second chain
    pub fn burn_synthetic_token(
        ctx: Context<BurnSyntheticToken>,
        bump: u8,
        amount: u64,
        chain_to_address: [u8; 20],
        opposite_bridge: [u8; 20],
        chain_id: u64,
    ) -> ProgramResult {
        let tx_id = ctx.accounts.tx_state.key();

        let seeds = &[
            &crate::state::Settings::SEED[..],
            &[ctx.accounts.settings.bump],
        ];

        token::burn(
            ctx.accounts.into_burn_context()
            .with_signer(&[&seeds[..]]),
            amount,
        )?;

        ctx.accounts.tx_state.recipient = ctx.accounts.client.key();
        ctx.accounts.tx_state.chain_to_address = chain_to_address;
        ctx.accounts.tx_state.synt_token = ctx.accounts.mint_synt.key();
        ctx.accounts.tx_state.amount = amount;
        ctx.accounts.tx_state.state = crate::state::RequestState::Sent;
        ctx.accounts.tx_state.opposite_bridge = opposite_bridge;
        ctx.accounts.tx_state.chain_id = chain_id;
        ctx.accounts.tx_state.bump = bump;

        let f = ethabi::Function {
            name: "unsynthesize".to_owned(),
            inputs: vec![
                ethabi::Param { name: "_txID".to_owned(), kind: ethabi::ParamType::FixedBytes(32), internal_type: None },
                ethabi::Param { name: "_token".to_owned(), kind: ethabi::ParamType::Address, internal_type: None },
                ethabi::Param { name: "_amount".to_owned(), kind: ethabi::ParamType::Uint(32), internal_type: None },
                ethabi::Param { name: "_to".to_owned(), kind: ethabi::ParamType::Address, internal_type: None },
            ],
			outputs: vec![],
			constant: false,
			state_mutability: ethabi::StateMutability::default(),
        };
        let calldata = f.encode_input(&[
            ethabi::Token::FixedBytes(tx_id.to_bytes().to_vec()),
            ethabi::Token::Address(ethereum_types::Address::from(ctx.accounts.mint_data.token_real)),
            ethabi::Token::Uint(ethereum_types::U256::from(amount)),
            ethabi::Token::Address(ethereum_types::Address::from(chain_to_address)),
        ]).unwrap();

        eywa_bridge::cpi::transmit_request(
            ctx.accounts.into_transmit_request_context()
            .with_signer(&[&seeds[..]]),
            calldata,
            ctx.accounts.tx_state.chain_to_address,
            ctx.accounts.tx_state.opposite_bridge,
            ctx.accounts.tx_state.chain_id,
        )?;

        ctx.accounts.settings.synthesis_request_count += 1;

        emit!(events::BurnRequest {
            id: tx_id,
            from: ctx.accounts.client.key(),
            to: chain_to_address,
            amount,
            token: ctx.accounts.tx_state.synt_token.key(),
        });

        Ok(())
    }

    // emergencyUnburn onlyBridge
    // can called only by bridge after initiation on a second chain
    pub fn emergency_unburn(
        ctx: Context<EmergencyUnburn>,
        // tx_id: [u8; 32],   // H256, // id for replay protection
    ) -> ProgramResult {
        let seeds = &[
            &crate::state::Settings::SEED[..],
            &[ctx.accounts.settings.bump],
        ];

        /*
        let message = format!(
            "EmergencyUnburn: tx_id={:?}, token_real={:?}",
            tx_id,
            ctx.accounts.mint_data.token_real,
        );
        msg!("{}", message);
        */

        if ctx.accounts.bridge_signer.key() != ctx.accounts.settings.bridge_signer {
            return ProgramResult::Err(ErrorCode::OnlyBridge.into());
        }

        /*
        TxState storage txState = requests[_txID];
        require(
            txState.state ==  RequestState.Sent,
            'Synt: state not open or tx does not exist'
        );
        */
        if ctx.accounts.tx_state.state != crate::state::RequestState::Sent {
            return ProgramResult::Err(ErrorCode::StateNotOpen.into());
        }
        // txState.state = RequestState.Reverted; // close
        ctx.accounts.tx_state.state = crate::state::RequestState::Reverted;
        // ISyntERC20(txState.stoken).mint(txState.recipient, txState.amount);
        token::mint_to(
            ctx.accounts.into_mint_to_context()
            .with_signer(&[&seeds[..]]),
            ctx.accounts.tx_state.amount,
        )?;

        // emit RevertBurnCompleted(_txID, txState.recipient, txState.amount, txState.stoken);
        emit!(events::RevertBurnCompleted {
            id: ctx.accounts.tx_state.key(),
            to: ctx.accounts.tx_state.recipient,
            amount: ctx.accounts.tx_state.amount,
            token: ctx.accounts.tx_state.synt_token,
        });

        Ok(())
    }

    // createRepresentation onlyOwner
    pub fn create_representation(
        ctx: Context<CreateRepresentation>,
        bump_seed_mint: u8,
        _bump_seed_data: u8,
        token_real: [u8; 20],
        _synt_decimals: u8,
        synt_name: String,
        synt_symbol: String,
        // chain_id: u64, // ???
    ) -> ProgramResult {
        let mint_synt = *ctx.accounts.mint_synt.to_account_info().key;
        let mint_data = *ctx.accounts.mint_data.to_account_info().key;

        let pos = ctx.accounts.settings.synt_tokens.iter()
        .position(|&pk| mint_synt == pk);
        if pos != None {
            return ProgramResult::Err(ErrorCode::TokenAlreadyRegistred.into());
        }

        ctx.accounts.mint_data.name = synt_name;
        ctx.accounts.mint_data.symbol = synt_symbol;
        ctx.accounts.mint_data.token_real = token_real;
        ctx.accounts.mint_data.token_synt = ctx.accounts.mint_synt.key();
        ctx.accounts.mint_data.bump_mint = bump_seed_mint;

        ctx.accounts.settings.synt_tokens.push(mint_data);

        emit!(events::CreatedRepresentation {
            rtoken: token_real,
            stoken: mint_synt,
        });

        Ok(())
    }

    // getListRepresentation

    // #endregion Synthesis
    // #region Portal

    // createRepresentationRequest onlyOwner
    pub fn create_representation_request(
        ctx: Context<CreateRepresentationRequest>,
    ) -> ProgramResult {
        msg!(
            "Portal: real_tokens: {}",
            ctx.accounts.settings.real_tokens.iter().count(),
        );

        let rtoken = *ctx.accounts.real_token.to_account_info().key;
        let pos = ctx.accounts.settings.real_tokens.iter()
        .position(|&pk| rtoken == pk);
        if pos != None {
            return ProgramResult::Err(ErrorCode::TokenAlreadyRegistred.into());
        }

        let seeds = &[
            &crate::state::Settings::SEED[..],
            &[ctx.accounts.settings.bump],
        ];

        let ix = spl_associated_token_account::create_associated_token_account(
            ctx.accounts.owner.key,
            ctx.accounts.settings.to_account_info().key,
            &rtoken,
        );
        solana_program::program::invoke_signed(
            &ix,
            &[
                ctx.accounts.owner.to_account_info(),
                ctx.accounts.associated.to_account_info(),
                ctx.accounts.settings.to_account_info(),
                ctx.accounts.real_token.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
                ctx.accounts.rent.to_account_info(),
            ],
            &[&seeds[..]],
        )?;

        ctx.accounts.settings.real_tokens.push(rtoken);

        emit!(events::RepresentationRequest { rtoken });
        emit!(events::ApprovedRepresentationRequest { rtoken });

        Ok(())
    }

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
        ctx: Context<Synthesize>,
        bump_seed_synthesize_request: u8,
        amount: u64,
        chain_to_address: [u8; 20],
        receive_side: [u8; 20],
        opposite_bridge: [u8; 20],
        chain_id: u64,
    ) -> ProgramResult {
        let seeds = &[
            &crate::state::Settings::SEED[..],
            &[ctx.accounts.settings.bump],
        ];

        token::transfer(
            ctx.accounts.into_transfer_context()
            .with_signer(&[&seeds[..]]),
            amount,
        )?;

        let tx_id = ctx.accounts.tx_state.key();

        let f = ethabi::Function {
            name: "mintSyntheticToken".to_owned(),
            inputs: vec![
                ethabi::Param { name: "_txID".to_owned(), kind: ethabi::ParamType::FixedBytes(32), internal_type: None },
                ethabi::Param { name: "_tokenReal".to_owned(), kind: ethabi::ParamType::Address, internal_type: None },
                ethabi::Param { name: "_amount".to_owned(), kind: ethabi::ParamType::Uint(32), internal_type: None },
                ethabi::Param { name: "_to".to_owned(), kind: ethabi::ParamType::Address, internal_type: None },
            ],
			outputs: vec![],
			constant: false,
			state_mutability: ethabi::StateMutability::default(),
        };

        let calldata = f.encode_input(&[
            ethabi::Token::FixedBytes(tx_id.to_bytes().to_vec()),
            ethabi::Token::Address(ethereum_types::Address::from(chain_to_address)),
            ethabi::Token::Uint(ethereum_types::U256::from(amount)),
            ethabi::Token::Address(ethereum_types::Address::from(receive_side)),
        ]).unwrap();

        eywa_bridge::cpi::transmit_request(
            ctx.accounts.into_transmit_request_context()
            .with_signer(&[&seeds[..]]),
            calldata,
            receive_side,
            opposite_bridge,
            chain_id,
        )?;

        ctx.accounts.tx_state.bump = bump_seed_synthesize_request;
        ctx.accounts.tx_state.recipient = ctx.accounts.source.key();
        ctx.accounts.tx_state.chain_to_address = chain_to_address;
        ctx.accounts.tx_state.opposite_bridge = opposite_bridge;
        ctx.accounts.tx_state.chain_id = chain_id;
        ctx.accounts.tx_state.synt_token = ctx.accounts.real_token.key(); // ???
        ctx.accounts.tx_state.amount = amount;
        ctx.accounts.tx_state.state = crate::state::RequestState::Sent;

        ctx.accounts.settings.portal_request_count += 1;

        emit!(events::SynthesizeRequest {
            id: tx_id,
            from: ctx.accounts.source.key(),
            to: chain_to_address,
            amount,
            real_token: ctx.accounts.real_token.key(),
        });

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
        ctx: Context<EmergencyUnsynthesize>,
        _bump_seed_synthesize_request: u8,
    ) -> ProgramResult {
        /*
        if *ctx.accounts.bridge.key != ctx.accounts.settings.bridge {
            msg!("Portal: required bridge signature");
            return ProgramResult::Err(ProgramError::InvalidAccountData);
        }
        */
        // if *ctx.accounts.destination.key != ctx.accounts.synthesize_request.recipient {
        if *ctx.accounts.destination.key != ctx.accounts.tx_state.recipient {
            msg!("Portal: destination account doesn't match with recipient");
            // msg!("{} {}", *ctx.accounts.destination.key, ctx.accounts.synthesize_request.recipient);
            msg!("{} {}", *ctx.accounts.destination.key, ctx.accounts.tx_state.recipient);
            return ProgramResult::Err(ProgramError::InvalidAccountData);
        }
        // if ctx.accounts.synthesize_request.key() != tx_id {
        //     msg!("Portal: got synthesize_request account with another tx_id");
        //     msg!("{:?} {:?}", ctx.accounts.synthesize_request.key(), tx_id);
        //     return ProgramResult::Err(ProgramError::InvalidAccountData);
        // }
        // if ctx.accounts.synthesize_request.state != crate::state::RequestState::Sent {
        if ctx.accounts.tx_state.state != crate::state::RequestState::Sent {
            msg!("Portal:state not open or tx does not exist");
            return ProgramResult::Err(ProgramError::InvalidAccountData);
        }

        // // ctx.accounts.synthesize_request.state = crate::state::RequestState::Reverted;
        ctx.accounts.tx_state.state = crate::state::RequestState::Reverted;

        let seeds = &[
            &crate::state::Settings::SEED[..],
            &[ctx.accounts.settings.bump],
        ];

        token::transfer(
            ctx.accounts.into_transfer_context()
            .with_signer(&[&seeds[..]]),
            // ctx.accounts.synthesize_request.amount, // amount,
            ctx.accounts.tx_state.amount,
        )?;

        emit!(events::RevertSynthesizeCompleted {
            id: ctx.accounts.tx_state.key(),
            to: ctx.accounts.tx_state.recipient,
            amount: ctx.accounts.tx_state.amount,
            token: ctx.accounts.tx_state.synt_token,
        });

        Ok(())
    }

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
        ctx: Context<Unsynthesize>,
        // token: Pubkey,
        // tx_id: String,
        amount: u64,
    ) -> ProgramResult {
        let token = ctx.accounts.real_token.key(); // : Pubkey,
        let tx_id = ctx.accounts.unsynthesize_state.key(); //: String,
        /*
        if *ctx.accounts.bridge.key != ctx.accounts.settings.bridge {
            msg!("Portal: required bridge signature");
            return ProgramResult::Err(ProgramError::InvalidAccountData);
        }
        let mut unsynthesize_state: UnsynthesizeStateData = get_or_create_account_data(
            &ctx.accounts.unsynthesize_state,
            &ctx.accounts.settings.to_account_info(),
            &ctx.accounts.system_program,
            &ctx.accounts.rent,
            1,
            tx_id,
            &[],
            ctx.program_id,
        )?;

        if unsynthesize_state.state != UnsynthesizeStates::Default {
            msg!("Portal: syntatic tokens emergencyUnburn");
            return ProgramResult::Err(ProgramError::InvalidArgument);
        }
        */

        // let cpi_accounts = token::Transfer {
        //     from: ctx.accounts.source_account.clone(),
        //     to: ctx.accounts.destination_account.clone(),
        //     authority: ctx.accounts.owner_account.clone(),
        // };
        // let cpi_program = ctx.accounts.token_program.clone();
        // let cpi_ctx = CpiContext::new(
        //     cpi_program.clone(),
        //     cpi_accounts,
        // );
        // token::transfer(cpi_ctx, amount)?;

        let seeds = &[
            &crate::state::Settings::SEED[..],
            &[ctx.accounts.settings.bump],
        ];

        token::transfer(
            ctx.accounts.into_transfer_context()
            .with_signer(&[&seeds[..]]),
            amount,
        )?;

        ctx.accounts.unsynthesize_state.state = crate::state::UnsynthesizeState::Unsynthesized;

        let event = events::BurnCompleted {
            id: tx_id,
            to: *ctx.accounts.destination.key,
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
        ctx: Context<EmergencyUnburnRequest>,
        // tx_id: String,
        receive_side: [u8; 20],
        opposite_bridge: [u8; 20],
        chain_id: u64,
    ) -> ProgramResult {
        let tx_id = ctx.accounts.unsynthesize_state.key(); //: String,

        /*
        let key = Pubkey::create_with_seed(
            &ctx.accounts.states_master_account.key,
            tx_id.as_str(),
            &ctx.program_id,
        )?;
        if key != *ctx.accounts.unsynthesize_state.key {
            msg!("Portal: got unsynthesize_state account with another tx_id");
            return ProgramResult::Err(ProgramError::InvalidAccountData);
        }
        let mut unsynthesize_states_info = UnsynthesizeStateData::try_from_slice(
            *ctx.accounts.unsynthesize_state.data.borrow(),
        )?;
        if unsynthesize_states_info.state != UnsynthesizeState::Unsynthesized {
            msg!("Portal: Real tokens already transfered");
            return ProgramResult::Err(ProgramError::InvalidAccountData);
        }
        */
        ctx.accounts.unsynthesize_state.state = crate::state::UnsynthesizeState::RevertRequest;

        let f = ethabi::Function {
            name: "emergencyUnburn".to_owned(),
            inputs: vec![
                ethabi::Param { name: "_txID".to_owned(), kind: ethabi::ParamType::FixedBytes(32), internal_type: None },
            ],
			outputs: vec![],
			constant: false,
			state_mutability: ethabi::StateMutability::default(),
        };
        let calldata = f.encode_input(&[ethabi::Token::FixedBytes(tx_id.to_bytes().to_vec())]).unwrap();

        let seeds = &[
            &crate::state::Settings::SEED[..],
            &[ctx.accounts.settings.bump],
        ];

        eywa_bridge::cpi::transmit_request(
            ctx.accounts.into_transmit_request_context()
            .with_signer(&[&seeds[..]]),
            calldata,
            receive_side,
            opposite_bridge,
            chain_id,
        )?;

        emit!(events::RevertBurnRequest {
            id: tx_id,
            to: *ctx.accounts.message_sender.key,
        });

        Ok(())
    }

    // #endregion Portal

}

#[error]
pub enum ErrorCode {
    #[msg("Unknown Error")]
    UnknownError = 2000,
    #[msg("OnlyBridge access constraint")]
    OnlyBridge,
    #[msg("Token already registred")]
    TokenAlreadyRegistred,
    #[msg("Unknown Portal Error")]
    UnknownPortalError = 3000,
    #[msg("Unknown Synthesis Error")]
    UnknownSynthesisError = 4000,
    #[msg("Synt: state not open or tx does not exist")]
    StateNotOpen,
}
