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

import BridgeFactory, { SolanaHelper } from '../bridge-ts';

import type {
  StandaloneInstruction,
  TransactionAccount,
} from '../bridge-ts/types';
import type {
  // UInt256,
  UInt160,
} from '../bridge-ts/types';

import { Logger } from '../utils-ts';


const logger = new Logger();


describe('bridge', () => {
  const provider = Provider.env();
  setProvider(provider);

  const helper = new SolanaHelper(provider);
  const factory = new BridgeFactory(provider.connection);
  const { bridge, stub, main } = factory;

  const accAdmin = web3.Keypair.generate();

  before(async () => {
    await helper.transfer(new BN('10000000000000000'), accAdmin.publicKey);

    // logger.logPublicKey('accAdmin', accAdmin.publicKey);
    // logger.logPublicKey('pidSysProg', web3.SystemProgram.programId);
  });

  const INIT_BRIDGE = 'Initialize bridge'
  it(INIT_BRIDGE, async () => {
    const ixInit = await bridge.init(accAdmin.publicKey);
    // logger.logIx('ixInit', ixInit);
    const tx = new web3.Transaction();
    tx.add(ixInit);
    tx.recentBlockhash = await helper.getRecentBlockhash();

    await helper.sendAndConfirmTransaction(INIT_BRIDGE, tx, accAdmin);

    // const pubSettings = await bridge.getSettingsAddress();
    // logger.logPublicKey('pubSettings', pubSettings);
    // const accountInfo = await provider.connection.getAccountInfo(pubSettings);
    // logger.accountInfo('settings accountInfo', accountInfo);
    const settings = await bridge.fetchSettings();
    logger.logState('settings', settings);
  });

  it('Hello World', async () => {
    const addrBridgeFrom: UInt160 = Buffer.from(
      '1122334455667788990011223344556677889900',
      'hex',
    );
    const addrContractFrom: UInt160 = Buffer.from(
      '1122334455667788990011223344556677889900',
      'hex',
    );

    const ixBind = await bridge.addContractReceiveBind(
      addrBridgeFrom,
      addrContractFrom,
      accAdmin.publicKey,
    );
    const tx0 = new web3.Transaction();
    tx0.add(ixBind);
    tx0.recentBlockhash = await helper.getRecentBlockhash();
    await helper.sendAndConfirmTransaction(
    'bridge.addContractReceiveBind',
      tx0,
      accAdmin,
    );

    const ixHello = await stub.hello(
      'provider.wallet',
      provider.wallet.publicKey,
    );
    // logger.logIx('ixHello', ixHello);

    const sinstHello: StandaloneInstruction = {
      programId: ixHello.programId,
      accounts: ixHello.keys as TransactionAccount[],
      data: ixHello.data,
    }

    const ixReceiveRequest = await bridge.receiveRequest(
      new web3.PublicKey(Buffer.from(
        '1122334455667788990011223344556677889900112233445566778899001122',
      'hex')),
      addrBridgeFrom,
      addrContractFrom,
      sinstHello,
      accAdmin.publicKey,
    );

    const tx = new web3.Transaction();
    tx.add(ixReceiveRequest);
    tx.recentBlockhash = await helper.getRecentBlockhash();

    let listener = null;
    let [event, slot] = await new Promise((resolve, _reject) => {
      listener = bridge.addEventListener('ReceiveRequest', (event, slot) => {
        resolve([event, slot]);
      });
      // await
      helper.sendAndConfirmTransaction(
        'Hello World',
        tx,
        accAdmin,
      );
    });
    await bridge.removeEventListener(listener);
    console.log(event);
  });

  it('Hello World Signed', async () => {
    // logger.logPublicKey('accAdmin', accAdmin.publicKey);
    // logger.logPublicKey('pidBridge', factory.bridge.pid);
    // logger.logPublicKey('provider', provider.wallet.publicKey);

    const pubSigner = await bridge.getReceiveRequestAddress();
    await helper.transfer(new BN('1000000000000000'), pubSigner);
    // logger.logPublicKey('pubSigner', pubSigner);
    // logger.log('bumpSigner:', bumpSigner);

    const ixHelloSigned = await stub.helloSigned('EYWA Bridge', pubSigner);
    // logger.logIx('ixHelloSigned', ixHelloSigned);

    const sinstHello: StandaloneInstruction = {
      programId: ixHelloSigned.programId,
      accounts: ixHelloSigned.keys as TransactionAccount[],
      data: ixHelloSigned.data,
    }

    const ixReceiveRequest = await bridge.receiveRequest(
      new web3.PublicKey(Buffer.from(
        '1122334455667788990011223344556677889900112233445566778899001122',
      'hex')),
      Buffer.from('1122334455667788990011223344556677889900', 'hex'),
      Buffer.from('1122334455667788990011223344556677889900', 'hex'),
      sinstHello,
      accAdmin.publicKey,
    );
    // logger.logIx('ixReceiveRequest', ixReceiveRequest);

    const tx = new web3.Transaction();
    tx.add(ixReceiveRequest);
    tx.recentBlockhash = await helper.getRecentBlockhash();

    let listener = null;
    let [event, slot] = await new Promise((resolve, _reject) => {
      listener = bridge.addEventListener("ReceiveRequest", (event, slot) => {
        resolve([event, slot]);
      });
      helper.sendAndConfirmTransaction('ReceiveRequest HelloSigned', tx, accAdmin);
    });
    await bridge.removeEventListener(listener);
    // console.log(event);

    // assert(false, 'show solana log');
  });

  const INIT_SYNTHESIS = 'Init synthesis';
  it(INIT_SYNTHESIS, async () => {
    // logger.logPublicKey('accAdmin', accAdmin.publicKey);
    // logger.logPublicKey('pidBridge', factory.bridge.pid);
    // logger.logPublicKey('provider', provider.wallet.publicKey);

    // const pubSigner = await bridge.getReceiveRequestAddress();

    // logger.logPublicKey('pubSigner', pubSigner);
    // logger.log('bumpSigner:', bumpSigner);
    // await helper.transfer(new BN('10000000000000000'), pubSigner);

    // const ixInit = await main.init(pubSigner);
    const ixInit = await main.init(accAdmin.publicKey);
    // logger.logIx('ixInit', ixInit);

    /*
    const sinstInit: StandaloneInstruction = {
      programId: ixInit.programId,
      accounts: ixInit.keys as TransactionAccount[],
      data: ixInit.data,
    }

    const ixReceiveRequest = await bridge.receiveRequest(
      new web3.PublicKey(Buffer.from(
        '1122334455667788990011223344556677889900112233445566778899001122',
      'hex')),
      Buffer.from('1122334455667788990011223344556677889900', 'hex'),
      Buffer.from('1122334455667788990011223344556677889900', 'hex'),
      sinstInit,
      accAdmin.publicKey,
    );
    // logger.logIx('ixReceiveRequest', ixReceiveRequest);
    */

    const tx = new web3.Transaction();
    // tx.add(ixReceiveRequest);
    tx.add(ixInit);
    tx.recentBlockhash = await helper.getRecentBlockhash();

    await helper.sendAndConfirmTransaction(INIT_SYNTHESIS, tx, accAdmin);

    // expect(param).eq('100');
    // expect(owner).eq(accAdmin.publicKey.toBase58());

    console.log(await main.fetchSettings());
    /*
    const ixSetOwner = await main.setOwner(
      accAdmin.publicKey,
      accAdmin.publicKey,
    );
    const tx2 = new web3.Transaction();
    tx2.add(ixSetOwner);
    tx2.recentBlockhash = await helper.getRecentBlockhash();
    await helper.sendAndConfirmTransaction('setOwner', tx2, accAdmin);
    console.log(await main.fetchSettings());
    */
    console.log(accAdmin.publicKey.toBuffer().toString('hex'));
  });

  const MINT_SYNTHETIC_TOKEN = 'Mint Synthetic Token';
  it(MINT_SYNTHETIC_TOKEN, async () => {
    // logger.logPublicKey('accAdmin', accAdmin.publicKey);
    // logger.logPublicKey('pidBridge', factory.bridge.pid);
    // logger.logPublicKey('provider', provider.wallet.publicKey);

    const pubSigner = await bridge.getReceiveRequestAddress();

    // logger.logPublicKey('pubSigner', pubSigner);
    // logger.log('bumpSigner:', bumpSigner);
    // await helper.transfer(new BN('10000000000000000'), pubSigner);

    const realToken = /* 0x */"1234567890123456789012345678901234567890";
    const txId = /* 0x */"1234567890123456789012345678901234567890123456789012345678901234";
    const user = /* 0x */"1234567890123456789012345678901234567890123456789012345678901234";

    const ixMintSyntheticToken = await main.mintSyntheticToken(
      Buffer.from(realToken, 'hex'),
      Buffer.from(txId, 'hex'),
      new web3.PublicKey(Buffer.from(user, 'hex')),
    ); // init(pubSigner);
    // logger.logIx('ixInit', ixInit);

    const sinstInit: StandaloneInstruction = {
      programId: ixMintSyntheticToken.programId,
      accounts: ixMintSyntheticToken.keys as TransactionAccount[],
      data: ixMintSyntheticToken.data,
    };
    console.log(sinstInit);

    // const tx = new web3.Transaction();
    // tx.add(ixReceiveRequest);
    // tx.recentBlockhash = await helper.getRecentBlockhash();

    // await helper.sendAndConfirmTransaction(INIT_SYNTHESIS, tx, accAdmin);

    // // expect(param).eq('100');
    // // expect(owner).eq(accAdmin.publicKey.toBase58());

    // console.log(await main.fetchSettings());
    // const ixSetOwner = await main.setOwner(accAdmin.publicKey);
    // const tx2 = new web3.Transaction();
    // tx2.add(ixSetOwner);
    // tx2.recentBlockhash = await helper.getRecentBlockhash();
    // await helper.sendAndConfirmTransaction('setOwner', tx2, accAdmin);
    // console.log(await main.fetchSettings());
    // console.log(accAdmin.publicKey.toBuffer().toString('hex'));
  });

  const TEST_ORACLE_REQUEST = 'Test Oracle Request';
  it(TEST_ORACLE_REQUEST, async () => {
    const requestId = new web3.PublicKey(Buffer.from(
      '1122334455667788990011223344556677889900112233445566778899001122',
    'hex')); // : web3.PublicKey,
    const selector = Buffer.from(
      '112233445566',
    'hex'); // : Buffer,
    const receiveSide = Buffer.from(
      '1122334455667788990011223344556677889900',
    'hex'); // : UInt160,
    const oppositeBridge = Buffer.from(
      '1122334455667788990011223344556677889900',
    'hex'); // : UInt160,
    const chainId = new BN(7);

    const ixTestOracleRequest = await bridge.testOracleRequest(
      requestId,
      selector,
      receiveSide,
      oppositeBridge,
      chainId,
      accAdmin.publicKey,
    );

    const tx = new web3.Transaction();
    tx.add(ixTestOracleRequest);
    tx.recentBlockhash = await helper.getRecentBlockhash();

    let listener = null;
    let event, slot;
    try {
      [event, slot] = await new Promise((resolve, reject) => {
        console.log('setting listener');
        listener = bridge.addEventListener(
          'OracleRequest',
          (event, slot) => resolve([event, slot]),
        );

        helper.sendAndConfirmTransaction(TEST_ORACLE_REQUEST, tx, accAdmin)
        .then(console.log)
        .catch(ex => {
          reject(ex);
        });
      });
    } catch (ex) {
      console.log('catch ex:', ex);
      throw ex;
    } finally {
      console.log('removing listener');
      await bridge.removeEventListener(listener);
    }

    console.log('OracleRequest');
    console.log(event);
  });
});
