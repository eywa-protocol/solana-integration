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


describe('token-faucet', () => {
  const provider = Provider.env();
  setProvider(provider);

  const helper = new SolanaHelper(provider);
  const factory = new BridgeFactory(provider.connection);
  const { faucet } = factory;

  const accAdmin = web3.Keypair.generate();

  before(async () => {
    await helper.transfer(new BN('10000000000000000'), accAdmin.publicKey);
  });

  const INIT_FAUCET = 'Initialize faucet';
  it(INIT_FAUCET, async () => {
    const ixInit = await faucet.init(accAdmin.publicKey);
    const tx = new web3.Transaction();
    tx.add(ixInit);
    tx.recentBlockhash = await helper.getRecentBlockhash();

    await helper.sendAndConfirmTransaction(INIT_FAUCET, tx, accAdmin);

    const pubSettings = await faucet.getSettingsAddress();
    const settings = await faucet.fetchSettings();
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

    const accUser = web3.Keypair.generate();
    await helper.transfer(new BN('10000000000000000'), accUser.publicKey);

    const pubMint = await faucet.getMintAddress(symbol);

    const token = new Token(
      provider.connection,
      pubMint,
      TOKEN_PROGRAM_ID,
      accUser,
    );

    const pubWallet = await token.createAssociatedTokenAccount(
      accUser.publicKey,
    );

    const aiWallet = await token.getAccountInfo(pubWallet);
    console.log('aiWallet');
    console.log(aiWallet);

    const client = new BridgeUserClient(provider.connection);
    const ixMintTo = await client.mintTestTokenBySymbol('T1', accUser.publicKey, new BN(123456789));

    const tx3 = new web3.Transaction();
    tx3.add(ixMintTo);

    tx3.recentBlockhash = await helper.getRecentBlockhash();
    await helper.sendAndConfirmTransaction('Mint to', tx3, accUser);

    console.log('fetchTokenAccountInfo');
    console.log(await faucet.fetchTokenAccountInfo('T1', accUser.publicKey));
  });
});
