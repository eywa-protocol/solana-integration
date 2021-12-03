use anchor_lang::{
    prelude::*,
    solana_program::{
        declare_id,
        pubkey::Pubkey,
    },
};

declare_id!("DMzorxwVcxZR8gat6YiSKs87nC3Ew1MLupcsJDRpv8Ce");

#[program]
pub mod test_stub {
    use super::*;

    pub fn hello(
        ctx: Context<Hello>,
        name: String,
    ) -> ProgramResult {
        let message = format!(
            "Hello, {}!\n{}",
            name,
            ctx.accounts.person.key,
        );
        msg!("\n{}", message);

        Ok(())
    }

    pub fn hello_signed(
        ctx: Context<HelloSigned>,
        name: String,
    ) -> ProgramResult {
        let message = format!(
            "Hello, {}! (Signed)\n{}",
            name,
            ctx.accounts.person.key,
        );
        msg!("\n{}", message);

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Hello<'info> {
    person: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct HelloSigned<'info> {
    #[account(signer)]
    person: AccountInfo<'info>,
}
