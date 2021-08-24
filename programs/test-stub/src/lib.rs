use anchor_lang::{
    prelude::*,
    solana_program::{
        declare_id,
        pubkey::Pubkey,
    },
};

declare_id!("TestStub11111111111111111111111111111111111");

#[program]
pub mod test_stub {
    use super::*;

    // pub fn initialize(_ctx: Context<Initialize>) -> ProgramResult {
    //     Ok(())
    // }

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
}

// #[derive(Accounts)]
// pub struct Initialize {}


#[derive(Accounts)]
pub struct Hello<'info> {
    // #[account(signer)]
    person: AccountInfo<'info>,
}
