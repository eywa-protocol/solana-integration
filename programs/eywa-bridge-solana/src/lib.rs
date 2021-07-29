use anchor_lang::prelude::*;

#[program]
pub mod eywa_bridge_solana {
    use super::*;

    // Singleton Data Account
    #[state]
    pub struct Settings {
        pub owner: Pubkey,
        pub param: u64,
    }
    impl Settings {
        pub fn new(ctx: Context<Auth>) -> Result<Self> {
            Ok(Self {
                owner: *ctx.accounts.owner.key,
                param: 100,
            })
        }

        pub fn increment(&mut self, ctx: Context<Auth>) -> Result<()> {
            if &self.owner != ctx.accounts.owner.key {
                return Err(ErrorCode::Unauthorized.into());
            }
            self.param += 1;
            Ok(())
        }
    }

    pub fn initialize(
        ctx: Context<Initialize>,
        admin: Pubkey,
        data: u64,
    ) -> ProgramResult {
        let acc_data = &mut ctx.accounts.data;

        acc_data.admin = admin;
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

    pub fn create_token(ctx: Context<CreateToken>) -> ProgramResult {
        let token = &mut ctx.accounts.token;
        token.amount = 0;
        token.authority = *ctx.accounts.authority.key;
        token.mint = *ctx.accounts.mint.to_account_info().key;
        Ok(())
    }
}

#[event]
pub struct MyEvent {
    pub data: u64,
    #[index]
    pub label: String,
}

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

#[account]
pub struct Mint {
    pub supply: u32,
}

#[associated]
#[derive(Default)]
pub struct Token {
    pub amount: u32,
    pub authority: Pubkey,
    pub mint: Pubkey,
}

#[derive(Accounts)]
pub struct Auth<'info> {
    #[account(signer)]
    owner: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init)]
    pub data: ProgramAccount<'info, DataAccount>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut, has_one = admin)]
    pub data: ProgramAccount<'info, DataAccount>,
    #[account(signer)]
    pub admin: AccountInfo<'info>,
}

#[account]
pub struct DataAccount {
    pub admin: Pubkey,
    pub data: u64,
}

#[error]
pub enum ErrorCode {
    #[msg("This is an error message clients will automatically display 1234")]
    Test = 1234,
    #[msg("Unauthorized")]
    Unauthorized,
}
