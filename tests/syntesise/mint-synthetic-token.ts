// import assert from 'assert';
// import { expect } from 'chai';

import {
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
// import * as anchor from '@project-serum/anchor';
import {
  BN,
  web3,
  workspace,
} from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

import { sendAndConfirmTransaction } from '../utils/send-and-confirm-transaction';

import type { Provider } from '@project-serum/anchor';
import type { AsyncParam } from '../utils/async-param';

import BridgeFactory, { SolanaHelper } from '../../bridge-ts';
import { BridgeUserClient } from '../../bridge-ts/bridge-user-client';

import { Logger } from '../../utils-ts';


const logger = new Logger();

export const MintSyntheticTokenTests = ({
  provider,
  admin,
  // apSettings,
}: {
  provider: Provider;
  admin: AsyncParam;
  // apSettings: AsyncParam;
  // apSettings: {
  //   pubSettings: PublicKey,
  //   bumpSettings: number,
  // };
}) => describe('Mint synthetic token', () => {
  let accAdmin: web3.Keypair;

  const helper = new SolanaHelper(provider);
  const factory = new BridgeFactory(provider.connection);
  const { main } = factory;

  before(async () => {
    accAdmin = (await admin.createPromise()) as web3.Keypair;
    logger.logPublicKey('accAdmin', accAdmin.publicKey);
    // const s = (await apSettings.createPromise()) as ISettings;
    // pubSettings = s.pubSettings;
    // bumpSettings = s.bumpSettings;
    // logPublicKey('pubSettings', pubSettings);
  });

  it("should mint synt", async () => {
    const program = workspace.EywaPortalSynthesis;
    // console.log('MintLayout.span: ', MintLayout.span)

    const realToken = /* 0x */"1234567890123456789012345678901234567890";
    // const accTo = web3.Keypair.generate();

    const txId = /* 0x */"1234567890123456789012345678901234567890123456789012";

    const [pubkeyMint, bumpSeedMint] = await PublicKey.findProgramAddress([
      // Buffer.from(anchor.utils.bytes.utf8.encode("mint-synt")),
      Buffer.from('mint-synt', 'utf-8'),
      Buffer.from(realToken, 'hex'),
    ], program.programId);
    logger.logPublicKey('pubkeyMint', pubkeyMint);

    const [pubkeyData, bumpSeedData] = await PublicKey.findProgramAddress([
      Buffer.from('mint-data', 'utf-8'),
      Buffer.from(realToken, 'hex'),
    ], program.programId);
    logger.logPublicKey('pubkeyData', pubkeyData);

    const mintAccount = new Token(
      program.provider.connection,
      pubkeyMint,
      TOKEN_PROGRAM_ID,
      accAdmin,
    );
    // const mintInfo = await mintAccount.getMintInfo();
    // console.log('mintInfo:', mintInfo);

    const walUser = await mintAccount.createAssociatedTokenAccount(accAdmin.publicKey);
    logger.logPublicKey('walUser', walUser);
    logger.logPublicKey('thisProgram', program.programId);

    const ixMintSyntheticToken = await program.instruction.mintSyntheticToken(
      bumpSeedMint, // : u8,
      // bumpSeedData, // : u8,
      new BN(realToken, 16).toArray(), // U160
      new BN(txId, 16).toArray(), // H256
      new BN(3), // amount
      // 'Some Synt Name', // synt name
      // 'SSN', // synt short name
    {
      accounts: {
        settings: await main.getSettingsAddress(),
        to: walUser, // accTo.publicKey,
        mintSynt: pubkeyMint,
        mintData: pubkeyData,
        thisProgram: program.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        // systemProgram: anchor.web3.SystemProgram.programId,
        // rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        owner: accAdmin.publicKey,
      },
    });

    const transaction = new web3.Transaction();
    transaction.add(ixMintSyntheticToken);

    // Send the two instructions
    await sendAndConfirmTransaction(
      'mint synt',
      provider.connection,
      transaction,
      accAdmin,
    );

    const mintInfo = await mintAccount.getMintInfo();
    console.log('mintInfo:', mintInfo);

    const walUserInfo = await mintAccount.getAccountInfo(walUser);
    console.log('walUserInfo:', walUserInfo);

    console.log('mintData:');
    console.log(await program.account.mintData.fetch(pubkeyData));

    const settings = await main.fetchSettings();
    console.log('settings');
    console.log(settings);

    logger.logPublicKey('TOKEN_PROGRAM_ID', TOKEN_PROGRAM_ID);
    const client = new BridgeUserClient(provider.connection);

    (await client.fetchAllUserTokenAccountInfos(accAdmin.publicKey))
    .forEach(b => console.log(b));

    console.log('balances');
    console.log(await client.fetchAllUserTokenBalances(accAdmin.publicKey));
  });
});
