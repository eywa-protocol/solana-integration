import {
  // assert,
  expect,
} from 'chai';

import {
  BN,
  Provider,
  setProvider,
  web3,
} from '@project-serum/anchor';
import {
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

import BridgeFactory, { SolanaHelper } from '../bridge-ts';
import { BridgeUserClient } from '../bridge-ts/bridge-user-client';

// import type {
//   StandaloneInstruction,
//   TransactionAccount,
// } from '../bridge-ts/interfaces';
// import type {
//   // UInt256,
//   UInt160,
// } from '../bridge-ts/interfaces/types';

// import { Logger } from '../utils-ts';


// const logger = new Logger();


describe('token-faucet', () => {
  const provider = Provider.env();
  setProvider(provider);

  const helper = new SolanaHelper(provider);
  const factory = new BridgeFactory(provider.connection);
  // const { bridge, stub, main } = factory;
  const { faucet } = factory;

  const accAdmin = web3.Keypair.generate();

  before(async () => {
    await helper.transfer(new BN('10000000000000000'), accAdmin.publicKey);

    // logger.logPublicKey('accAdmin', accAdmin.publicKey);
    // logger.logPublicKey('pidSysProg', web3.SystemProgram.programId);
  });

  const INIT_FAUCET = 'Initialize faucet';
  it(INIT_FAUCET, async () => {
    const ixInit = await faucet.init(accAdmin);
    // logger.logIx('ixInit', ixInit);
    const tx = new web3.Transaction();
    tx.add(ixInit);
    tx.recentBlockhash = await helper.getRecentBlockhash();

    await helper.sendAndConfirmTransaction(INIT_FAUCET, tx, accAdmin);

    const pubSettings = await faucet.getSettingsAddress();
    // logger.logPublicKey('pubSettings', pubSettings);
    const accountInfo = await provider.connection.getAccountInfo(pubSettings);
    // logger.accountInfo('settings accountInfo', accountInfo);
    const settings = await faucet.fetchSettings();
    // logger.logState('settings', settings);
    console.log('settings');
    console.log(settings);

    const name = 'Token 1';
    const symbol = 'T1';
    const ixCreateMint = await faucet.createMint(
      name,
      symbol,
      accAdmin.publicKey,
    );
    const tx2 = new web3.Transaction();
    tx2.add(ixCreateMint);

    tx2.recentBlockhash = await helper.getRecentBlockhash();
    await helper.sendAndConfirmTransaction('Create mint', tx2, accAdmin);

    console.log('fetchMintData');
    console.log(await faucet.fetchMintData(symbol));
    // console.log(await faucet.fetchMintData(symbol.padStart(8, ' ')));

    const accUser = web3.Keypair.generate();
    // logger.logPublicKey('accUser', accUser.publicKey);
    await helper.transfer(new BN('10000000000000000'), accUser.publicKey);
    // logger.log('sponsored');

    const pubMint = await faucet.getMintAddress(symbol);
    // console.log('pubMint', 't');
    // console.log(pubMint);

    const token = new Token(
      provider.connection,
      pubMint,
      TOKEN_PROGRAM_ID,
      accUser,
    );

    const pubWallet = await token.createAssociatedTokenAccount(
      accUser.publicKey,
    );
    // console.log('pubWallet', 't');
    // console.log(pubWallet);
    // const pubWallet2 = await faucet.getAssociatedTokenAddress(pubMint, accUser.publicKey);
    // console.log('pubWallet2', 't');
    // console.log(pubWallet2);

    const aiWallet = await token.getAccountInfo(pubWallet);
    console.log('aiWallet');
    console.log(aiWallet);

    /*
    const ixMintTo = await faucet.mintTo('T1', accUser.publicKey, new BN(123456789));
    */
    const client = new BridgeUserClient(provider.connection);
    const ixMintTo = await client.mintTestTokenBySymbol('T1', accUser.publicKey, new BN(123456789));

    const tx3 = new web3.Transaction();
    tx3.add(ixMintTo);

    tx3.recentBlockhash = await helper.getRecentBlockhash();
    await helper.sendAndConfirmTransaction('Mint to', tx3, accUser);

    console.log('fetchTokenAccountInfo');
    console.log(await faucet.fetchTokenAccountInfo('T1', accUser.publicKey));
  });

  it.skip('Create mint', async () => {
    const ixInit = await faucet.init(accAdmin);
    const ixCreateMint = await faucet.createMint(name, symbol, accAdmin.publicKey);
    const tx = new web3.Transaction();
    tx.add(ixInit);
    tx.add(ixCreateMint);

    tx.recentBlockhash = await helper.getRecentBlockhash();
    await helper.sendAndConfirmTransaction('Create mint', tx, accAdmin);

    const pubSettings = await faucet.getSettingsAddress();
    const settings = await faucet.fetchSettings();

    console.log(settings.nonce);

  });

  it.skip('Mint to', async () => {
    const amount = 123;
    const ixInit = await faucet.init(accAdmin);
    const ixMintTo = await faucet.mintTo(accAdmin, /*amount*/)
    const tx = new web3.Transaction();
    tx.add(ixInit);
    tx.add(ixMintTo);

    tx.recentBlockhash = await helper.getRecentBlockhash();
    await helper.sendAndConfirmTransaction('Create mint', tx, accAdmin);

    const pubSettings = await faucet.getSettingsAddress();
    const settings = await faucet.fetchSettings();

    console.log(settings.nonce);
  });
});
