use anchor_lang::{
    Key,
    prelude::*,
    prelude::borsh::BorshDeserialize,
    solana_program::{
        keccak,
        program_error::ProgramError,
    },
    AnchorSerialize,
    AnchorDeserialize,
};
use anchor_spl::token;


pub mod events;
pub mod state;
pub mod ctxt;

use state::*;
use ctxt::*;


declare_id!("7gRLkKiavHbYX29kjPrm2jXcrFYYEKZUrNUxmBTMBDtU");



#[program]
pub mod eywa_portal_synthesis {
    use super::*;
    use eywa_lib::get_or_create_account_data;

    // constructor
    pub fn initialize(
        ctx: Context<Initialize>,
        bump_seed: u8,
    ) -> ProgramResult {
        ctx.accounts.settings.owner = ctx.accounts.owner.key();
        ctx.accounts.settings.portal_nonce = 0;
        ctx.accounts.settings.bridge = ctx.accounts.bridge.key();
        ctx.accounts.settings.bump = bump_seed;

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
        _bump_seed_mint: u8,
        token_real: [u8; 20], // real token for synt
        tx_id: [u8; 32],   // H256, // id for replay protection
        amount: u64, // от 0 до 18 446 744 073 709 551 615
        // to: Pubkey, // destination for minting synt
    ) -> ProgramResult { // onlyOwner
        let a = ctx.accounts.mint_synt.mint_authority.unwrap();
        let message = format!(
            "MintSyntheticToken: tx_id={:?}, token_real={:?}, amount={}, to={}, authority={}",
            tx_id, token_real, amount, ctx.accounts.to.key(),
            a, // to,
        );
        msg!("{}", message);

        // TODO add chek to Default - чтобы не было по бриджу
        // require(
        //     synthesizeStates[_txID] == SynthesizeState.Default,
        //     "Synt: emergencyUnsynthesizedRequest called or tokens has been already synthesized"
        // );

        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.clone(),
            token::MintTo {
                mint: ctx.accounts.mint_synt.to_account_info(),
                to: ctx.accounts.to.to_account_info(),
                // authority: ctx.accounts.this_program.clone(),
                authority: ctx.accounts.owner.to_account_info(),
            }
        );
        token::mint_to(cpi_ctx, amount)?;

        // TODO state
        // synthesizeStates[_txID] = SynthesizeState.Synthesized;

        emit!(events::SynthesizeCompleted {
            id: tx_id,
            to: ctx.accounts.to.key(),
            amount,
            token: token_real,
        });

        Ok(())
    }

    // emergencyUnsyntesizeRequest
    // Revert synthesize() operation, can be called several times
    pub fn emergency_unsyntesize_request(
        ctx: Context<EmergencyUnsyntesizeRequest>,
        tx_id: [u8; 32],   // H256, // id for replay protection
    ) -> ProgramResult {
        let token_real = ctx.accounts.mint_data.token_real;
        let message = format!(
            "EmergencyUnsyntesizeRequest: tx_id={:?}, token_real={:?}",
            tx_id, token_real,
        );
        msg!("{}", message);

        /*
        require(synthesizeStates[_txID]!= SynthesizeState.Synthesized, "Synt: syntatic tokens already minted");
        synthesizeStates[_txID] = SynthesizeState.RevertRequest;// close
        bytes memory out  = abi.encodeWithSelector(bytes4(keccak256(bytes('emergencyUnsynthesize(bytes32)'))),_txID);
        // TODO add payment by token
        IBridge(bridge).transmitRequestV2(out,_receiveSide, _oppositeBridge, _chainID);

        emit RevertSynthesizeRequest(_txID, _msgSender());
        */

        Ok(())
    }

    // burnSyntheticToken
    // sToken -> Token on a second chain
    pub fn burn_synthetic_token(
        ctx: Context<BurnSyntheticToken>,
        tx_id: [u8; 32],   // H256, // id for replay protection
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

        /*
        ISyntERC20(_stoken).burn(_msgSender(), _amount);
        txID = keccak256(abi.encodePacked(this, requestCount));

        bytes memory out  = abi.encodeWithSelector(bytes4(keccak256(bytes('unsynthesize(bytes32,address,uint256,address)'))),txID, representationReal[_stoken], _amount, _chain2address);
        // TODO add payment by token
        IBridge(bridge).transmitRequestV2(out, _receiveSide, _oppositeBridge, _chainID);
        TxState storage txState = requests[txID];
        txState.recipient    = _msgSender();
        txState.chain2address    = _chain2address;
        txState.stoken     = _stoken;
        txState.amount     = _amount;
        txState.state = RequestState.Sent;

        requestCount += 1;

        emit BurnRequest(txID, _msgSender(), _chain2address, _amount, _stoken);
        */

        Ok(())
    }

    // burnSyntheticTokenWithPermit

    // emergencyUnburn onlyBridge
    // can called only by bridge after initiation on a second chain
    pub fn emergency_unburn(
        ctx: Context<EmergencyUnburn>,
        tx_id: [u8; 32],   // H256, // id for replay protection
    ) -> ProgramResult {
        let token_real = ctx.accounts.mint_data.token_real;
        let message = format!(
            "EmergencyUnburn: tx_id={:?}, token_real={:?}",
            tx_id, token_real,
        );
        msg!("{}", message);

        /*
        TxState storage txState = requests[_txID];
        require(txState.state ==  RequestState.Sent, 'Synt: state not open or tx does not exist');
        txState.state = RequestState.Reverted; // close
        ISyntERC20(txState.stoken).mint(txState.recipient, txState.amount);

        emit RevertBurnCompleted(_txID, txState.recipient, txState.amount, txState.stoken);
        */

        Ok(())
    }

    // createRepresentation onlyOwner
    pub fn create_representation(
        ctx: Context<CreateRepresentation>,
        _bump_seed_mint: u8,
        _bump_seed_data: u8,
        token_real: [u8; 20],
        _synt_decimals: u8,
        synt_name: String,
        synt_symbol: String,
    ) -> ProgramResult {
        ctx.accounts.mint_data.name = synt_name;
        ctx.accounts.mint_data.symbol = synt_symbol;
        ctx.accounts.mint_data.token_real = token_real;
        ctx.accounts.mint_data.token_synt = ctx.accounts.mint_synt.key();

        Ok(())
    }

    // getListRepresentation

    // #endregion Synthesis
    // #region Portal

    /*
        event RepresentationRequest(address indexed _rtoken);
        event ApprovedRepresentationRequest(address indexed _rtoken);

        function createRepresentationRequest(address _rtoken) external {
            emit RepresentationRequest(_rtoken);
        }

        // implies manual verification point
        function approveRepresentationRequest(address _rtoken) external /**onlyOwner */ {
            tokenData[_rtoken] = abi.encode(IERC20(_rtoken).name(), IERC20(_rtoken).symbol());
            emit ApprovedRepresentationRequest(_rtoken);
        }
    */

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
        _bump_seed_synthesize_request: u8,
        amount: u64,
        chain_to_address: [u8; 20],
        receive_side: [u8; 20],
        opposite_bridge: [u8; 20],
        chain_id: u64,
    ) -> ProgramResult {
        let seeds = &[
            &PDA_MASTER_SEED[..],
            &[ctx.accounts.settings.bump],
        ];
        /*
        // Залочить SPLки
        TransferHelper.safeTransferFrom(_token, _msgSender(), address(this), _amount);
        // Запомнить состояние
        balanceOf[_token] = balanceOf[_token].add(_amount);
        */
        token::transfer(
            ctx.accounts.into_transfer_context()
            .with_signer(&[&seeds[..]]),
            amount,
        )?;
        /*
        // посчитать внутренний идентификатор
        txID = keccak256(abi.encodePacked(this, requestCount));
        */
        let tx_id = ctx.accounts.synthesize_request.key();
        /*
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
        */
        eywa_bridge::cpi::transmit_request(
            ctx.accounts.into_transmit_request_context()
            .with_signer(&[&seeds[..]]),
            (&[ 1, 2, 3 ]).to_vec(), // &[ 1, 2, 3 ], // &out,
            "receive_side".to_string(), // receive_side,
            "opposite_bridge".to_string(), // opposite_bridge,
            chain_id,
        )?;
        /*
        transmit_request(
            &[ 1, 2, 3 ], // &out,
            receive_side,
            opposite_bridge,
            chain_id,
            &mut nonce, // &mut bridge_nonce.nonce,
            ctx.program_id,
        );
        // end transmitRequestV2
        TxState storage txState = requests[txID];
        txState.recipient    = _msgSender();
        txState.chain2address    = _chain2address;
        txState.rtoken     = _token;
        txState.amount     = _amount;
        txState.state = RequestState.Sent;
        */
        let synthesize_request = &mut ctx.accounts.synthesize_request;
        // synthesize_request.tx_id = tx_id;
        synthesize_request.recipient = ctx.accounts.source.key();
        synthesize_request.chain_to_address = chain_to_address;
        synthesize_request.real_token = ctx.accounts.real_token.key();
        synthesize_request.amount = amount;
        synthesize_request.state = RequestState::Sent;
        /*
        requestCount +=1;
        */
        ctx.accounts.settings.portal_nonce += 1;
        /*
        emit events::SynthesizeRequest(txID, _msgSender(), _chain2address, _amount, _token);
        */
        emit!(events::SynthesizeRequest {
            id: tx_id,
            from: ctx.accounts.source.key(),
            to: chain_to_address,
            amount,
            real_token: ctx.accounts.real_token.key(),
        });

        Ok(())
    }

    // synthesizeWithPermit – позже подумаем

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
        if *ctx.accounts.destination.key != ctx.accounts.synthesize_request.recipient {
            msg!("Portal: destination account doesn't match with recipient");
            msg!("{} {}", *ctx.accounts.destination.key, ctx.accounts.synthesize_request.recipient);
            return ProgramResult::Err(ProgramError::InvalidAccountData);
        }
        // if ctx.accounts.synthesize_request.key() != tx_id {
        //     msg!("Portal: got synthesize_request account with another tx_id");
        //     msg!("{:?} {:?}", ctx.accounts.synthesize_request.key(), tx_id);
        //     return ProgramResult::Err(ProgramError::InvalidAccountData);
        // }
        if ctx.accounts.synthesize_request.state != RequestState::Sent {
            msg!("Portal:state not open or tx does not exist");
            return ProgramResult::Err(ProgramError::InvalidAccountData);
        }

        ctx.accounts.synthesize_request.state = RequestState::Reverted;

        let seeds = &[
            &PDA_MASTER_SEED[..],
            &[ctx.accounts.settings.bump],
        ];

        token::transfer(
            ctx.accounts.into_transfer_context()
            .with_signer(&[&seeds[..]]),
            ctx.accounts.synthesize_request.amount, // amount,
        )?;

        emit!(events::RevertSynthesizeCompleted {
            id: ctx.accounts.synthesize_request.key(),
            to: ctx.accounts.synthesize_request.recipient,
            amount: ctx.accounts.synthesize_request.amount,
            token: ctx.accounts.synthesize_request.real_token,
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
        token: Pubkey,
        tx_id: String,
        amount: u64,
    ) -> ProgramResult {
        /*
        if *ctx.accounts.bridge.key != ctx.accounts.settings.bridge {
            msg!("Portal: required bridge signature");
            return ProgramResult::Err(ProgramError::InvalidAccountData);
        }
        */
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

        let cpi_accounts = token::Transfer {
            from: ctx.accounts.source_account.clone(),
            to: ctx.accounts.destination_account.clone(),
            authority: ctx.accounts.owner_account.clone(),
        };
        let cpi_program = ctx.accounts.spl_token_account.clone();
        let cpi_ctx = CpiContext::new(
            cpi_program.clone(),
            cpi_accounts,
        );
        token::transfer(cpi_ctx, amount)?;

        unsynthesize_state.state = UnsynthesizeStates::Unsynthesized;
        unsynthesize_state
            .serialize(&mut *ctx.accounts.unsynthesize_state.try_borrow_mut_data()?)?;

        let event = events::BurnCompleted {
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

        let seeds = &[
            &PDA_MASTER_SEED[..],
            &[ctx.accounts.settings.bump],
        ];

        eywa_bridge::cpi::transmit_request(
            ctx.accounts.into_transmit_request_context()
            .with_signer(&[&seeds[..]]),
            (&[ 1, 2, 3 ]).to_vec(), // &[ 1, 2, 3 ], // &out,
            "receive_side".to_string(), // receive_side,
            "opposite_bridge".to_string(), // opposite_bridge,
            chain_id,
        )?;
        /*
        transmit_request(
            &out,
            receive_side,
            opposite_bridge,
            chain_id,
            &mut bridge_nonce.nonce,
            ctx.program_id,
        );
        */

        emit!(events::RevertBurnRequest {
            id: tx_id,
            to: *ctx.accounts.message_sender.key,
        });

        Ok(())
    }

    // #endregion Portal

}
/*
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
*/
