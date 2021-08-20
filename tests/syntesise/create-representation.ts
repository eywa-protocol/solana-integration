// import assert from 'assert';
// import { expect } from 'chai';

import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as anchor from '@project-serum/anchor';
import {
  BN,
  web3,
  workspace,
} from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

import { sendAndConfirmTransaction } from '../utils/send-and-confirm-transaction';

import type { Provider } from '@project-serum/anchor';
import type { AsyncParam } from '../utils/async-param';


interface TransactionAccount {
  pubkey: PublicKey;
  isSigner: Boolean;
  isWritable: Boolean;
}
interface StandaloneInstruction {
  programId: PublicKey;
  accounts: TransactionAccount[];
  data: Buffer;
}

const logPublicKey = (title: string, key: PublicKey) => {
  console.log(title, 'base58:', key.toBase58());
  console.log(title, 'hex:', key.toBuffer().toString('hex'));
}

// const logNumber = (title: string, n: number) => {
//   console.log(`${title}:`, n);
// }


export const CreateRepresentationTests = ({
  provider,
  admin,
}: {
  provider: Provider;
  admin: AsyncParam;
}) => describe('Create representation', () => {
  let accAdmin: web3.Keypair;

  before(async () => {
    accAdmin = (await admin.createPromise()) as web3.Keypair;
    logPublicKey('accAdmin', accAdmin.publicKey);
  });

  it("should create new representation", async () => {
    const program = workspace.EywaBridgeSolana;
    // console.log('MintLayout.span: ', MintLayout.span)

    const realToken = /* 0x */"1234567890123456789012345678901234567890";

    const [pubkeyMint, bumpSeedMint] = await PublicKey.findProgramAddress([
      Buffer.from('mint', 'utf-8'),
      Buffer.from(realToken, 'hex'),
    ], program.programId);
    logPublicKey('pubkeyMint', pubkeyMint);

    const [pubkeyData, bumpSeedData] = await PublicKey.findProgramAddress([
      Buffer.from('mint-data', 'utf-8'),
      Buffer.from(realToken, 'hex'),
    ], program.programId);
    logPublicKey('pubkeyData', pubkeyData);

    const ixCreateRepresentation = await program.instruction.createRepresentation(
      bumpSeedData, // : u8,
      bumpSeedMint, // : u8,
      new BN(realToken, 16).toArray(), // u160
      'Some Synt Name', // synt name
      'SSN', // synt short name
      2, // decimals
    {
      accounts: {
        mint: pubkeyMint,
        mintData: pubkeyData,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        owner: accAdmin.publicKey,
      },
    });


    const transaction = new web3.Transaction();
    transaction.add(ixCreateRepresentation);

    // Send the two instructions
    await sendAndConfirmTransaction(
      'createAccount and InitializeMint',
      provider.connection,
      transaction,
      accAdmin,
    );

    /*
    const token = new Token(
      provider.connection,
      mintSynt.publicKey,
      TOKEN_PROGRAM_ID,
      accAdmin,
    );
    const mintInfo = await token.getMintInfo();
    console.log('mintInfo:', mintInfo);

    const spaceToAssoc = 1000; // 8 + 32 + 8;
    const lamp = await provider.connection.getMinimumBalanceForRentExemption(spaceToAssoc);
    // const newAccSplPk = await PublicKey.createWithSeed(mintSynt.publicKey, "escrow", program.programId);
    const [newAccSplPk, zxc] = await PublicKey.findProgramAddress([Buffer.from("my-token-seed")], program.programId);
    console.log(111111111, newAccSplPk.toBase58());
    */

    // console.log('PDA', newAccSplPk.toBase58());
    // const ixCreateSplAcc = await program.instruction.createSplAssociatedAccount({
    //   accounts: {
    //     account: newAccSplPk,
    //     mint: mintSynt.publicKey,
    //     rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    //     splProgram: TOKEN_PROGRAM_ID,
    //     systemProgram: anchor.web3.SystemProgram.programId,
    //     owner: accAdmin.publicKey,
    //   },
    // });
    // const txCreateSplAssociatedAccount = new web3.Transaction();
    // txCreateSplAssociatedAccount.add(ixCreateSplAcc);
    // await sendAndConfirmTransaction(
    //   'create spl assoc acc',
    //   provider.connection,
    //   txCreateSplAssociatedAccount,
    //   accAdmin,
    // );


    // const newAccSplPk = anchor.web3.Keypair.generate();
    // const ix = web3.SystemProgram.createAccount({
    //   fromPubkey: accAdmin.publicKey,
    //   newAccountPubkey: newAccSplPk.publicKey,
    //   space,
    //   lamports,
    //   programId: program.programId,
    // });
    // const tx = new web3.Transaction();
    // tx.add(ix);
    // await sendAndConfirmTransaction(
    //   'create spl assoc acc',
    //   provider.connection,
    //   tx,
    //   accAdmin,
    // );
    // console.log(1);


    /*
    const ixCreateSplAcc = await program.instruction.createSplAssociatedAccount(
      zxc,
    {
      accounts: {
        account: newAccSplPk,
        mint: mintSynt.publicKey,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        owner: accAdmin.publicKey,
      },
    });
    const txCreateSplAssociatedAccount = new web3.Transaction();
    txCreateSplAssociatedAccount.add(ixCreateSplAcc);
    await sendAndConfirmTransaction(
      'create spl assoc acc',
      provider.connection,
      txCreateSplAssociatedAccount,
      accAdmin,
    );
    console.log(3);
    */
  });

});
