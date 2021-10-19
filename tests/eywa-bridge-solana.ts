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

import { AsyncParam } from './utils/async-param';

import BridgeFactory, { SolanaHelper } from '../bridge-ts';


import { SyntesiseTests } from './syntesise';
// import { BridgeTests } from './bridge';


describe('eywa-bridge-solana', () => {
  const provider = Provider.env();
  setProvider(provider);

  const accAdmin = web3.Keypair.generate();

  const helper = new SolanaHelper(provider);
  const factory = new BridgeFactory(provider.connection);
  const { main } = factory;

  const admin = new AsyncParam();

  before(async () => {
    await helper.transfer(new BN('10000000000000000'), accAdmin.publicKey);
    admin.resolve(accAdmin);
  });

  const INIT_SETTINGS = 'Init settings';
  it(INIT_SETTINGS, async () => {
    const tx1 = new web3.Transaction();
    tx1.add(await main.init(accAdmin.publicKey));
    await helper.sendAndConfirmTransaction(INIT_SETTINGS, tx1, accAdmin);

    const account = await main.fetchSettings();
    expect(account.owner.toString()).eq(accAdmin.publicKey.toString());
  });

  it("Serialize", async () => {
    const acc1 = web3.Keypair.fromSecretKey(new Uint8Array([
      149,  63,   8,  13, 195, 113, 123, 153, 126,  15,   4, 101, 143,  60, 220, 156,
       29, 214, 199, 157, 191, 177, 203, 175,  46, 149, 166, 158, 102,  83, 216,  44,
      248,  25, 187,  98,  43,  69, 174, 113, 217, 102,  82,   6, 216,  36, 167,  12,
       17,  72, 239,  18,  53, 151, 205, 223, 163, 161, 179, 168, 209, 227,  62, 136
    ]));
    // printKeypair('Account 1', acc1);

    const acc2 = web3.Keypair.fromSecretKey(new Uint8Array([
      236, 209, 137, 239,  82, 251, 157,  49,  53,  26, 123,  13, 116,  58,  82,  4,
       82, 193, 186, 166, 178, 198,  85,  97, 132,  87,  62, 155, 167, 208, 128,  17,
       49,  37,  74, 165,  32,  37,   2,  56, 161, 156,  85, 158,  83, 201,  10, 138,
       178, 15,  24, 190, 168,  61,  59, 246, 235,  14, 228, 251,  39,  44,  93, 180
    ]));
    // printKeypair('Account 2', acc2);

    const acc3 = web3.Keypair.fromSecretKey(new Uint8Array([
      177, 195, 151,   5, 114, 131,  84, 157, 252, 147,  58,  29, 222, 187, 193, 190,
      150,  64, 154,  78,   6, 143,  77, 124,  94,  59, 202, 248, 193, 220,  95, 202,
       99,  58, 197, 235, 243, 202,  24,  12, 209, 126,  99,  66, 247,  72, 228, 109,
      165, 245, 100, 215, 117, 166,  11, 142,  29, 155,  64, 116,  80, 215,  98,  48
    ]));
    // printKeypair('Account 3', acc3);

    const recentBlockhash = 'FU6qerSujsjVNhY1z88pwdqEdyT594fD4wLyBGnTGvaG';
    console.log('recentBlockhash', recentBlockhash);

    const accAdmin = acc1;
    // const accMintSynt = acc2
    // const accMintSyntData = acc3

    const ixCreateRepresentation = await main.createRepresentation(
      'Some Synt Name', // synt name
      'SSN', // synt short name
      2, // decimals
      /* 0x */ Buffer.from('1234567890123456789012345678901234567890', 'hex'), // token_real: [u8; 20]
      accAdmin.publicKey,
    );

    const transaction = new web3.Transaction();
    transaction.add(ixCreateRepresentation);
    transaction.recentBlockhash = recentBlockhash;
    transaction.sign(
      accAdmin,
    );
    const bufTx = transaction.serialize();
    console.log('signed transaction');
    console.log(bufTx.toString('hex'));
  });

  SyntesiseTests({
    provider,
    admin,
    // apSettings,
  });

  // BridgeTests({
  //   provider,
  //   admin,
  // });
});
