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
import { utf8 } from '@project-serum/anchor/dist/cjs/utils/bytes';


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
  const { main, bridge } = factory;

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

    const txId = /* 0x */"1234567890123456789012345678901234567890123456789012345678901234";

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

    const [
      pubSynthesizeState,
      bumpSynthesizeState,
    ] = await PublicKey.findProgramAddress([
      Buffer.from('eywa-synthesize-state', 'utf-8'),
      // Buffer.from(realToken, 'hex'),
      Buffer.from(txId, 'hex'),
    ], program.programId);
    logger.logPublicKey('pubSynthesizeState', pubSynthesizeState);
    // logger.log('Buffer.from', Buffer.from('eywa-synthesize-request', 'utf-8').toString('utf8'));
    // logger.log('Buffer.from', Buffer.from([101, 121, 119, 97, 45, 115, 121, 110, 116, 104, 101, 115, 105, 122, 101, 45, 115, 116, 97, 116, 101]).toString('utf8'));

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
    // logger.logPublicKey('thisProgram', program.programId);

    const ixMintSyntheticToken = await program.instruction.mintSyntheticToken(
      Buffer.from(txId, 'hex'), // txId,
      // bumpSeedMint, // : u8,
      bumpSynthesizeState, // : u8, // bumpRequest,
      // bumpSeedData, // : u8,
      // new BN(realToken, 16).toArray(), // U160
      // new BN(txId, 16).toArray(), // H256
      new BN(3), // amount
      // 'Some Synt Name', // synt name
      // 'SSN', // synt short name
    {
      accounts: {
        settings: await main.getSettingsAddress(),
        mintSynt: pubkeyMint,
        mintData: pubkeyData,
        synthesizeState: pubSynthesizeState,
        to: walUser, // accTo.publicKey,
        // thisProgram: program.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
        // owner: accAdmin.publicKey,
        // bridgeSigner: accAdmin.publicKey,
        bridge: accAdmin.publicKey, // bridge.getSettingsAddress(),
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
    console.log('settings IPortalSyntesizeSettings');
    console.log(settings);

    logger.logPublicKey('TOKEN_PROGRAM_ID', TOKEN_PROGRAM_ID);
    const client = new BridgeUserClient(provider.connection);

    (await client.fetchAllUserTokenAccountInfos(accAdmin.publicKey))
    .forEach(b => console.log(b));

    console.log('balances { [publickey: string]: u64 }');
    console.log(await client.fetchAllUserTokenBalances(accAdmin.publicKey));
  });
});
