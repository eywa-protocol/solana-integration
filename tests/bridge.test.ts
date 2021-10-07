import {
  assert,
  // expect,
} from 'chai';

import {
  BN,
  Provider,
  setProvider,
  web3,
} from '@project-serum/anchor';

import BridgeFactory, {
  SolanaHelper,
  StandaloneInstruction,
  TransactionAccount,
} from '../bridge-ts';

// import { Logger } from '../utils-ts';


// const logger = new Logger();


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
    const ixInit = await bridge.init(accAdmin);
    // logger.logIx('ixInit', ixInit);
    const tx = new web3.Transaction();
    tx.add(ixInit);
    tx.recentBlockhash = await helper.getRecentBlockhash();

    await helper.sendAndConfirmTransaction(INIT_BRIDGE, tx, accAdmin);

    const [pubSettings, bump] = await bridge.findSettingsAddress();
    // logger.logPublicKey('pubSettings', pubSettings);
    const accountInfo = await provider.connection.getAccountInfo(pubSettings);
    // logger.accountInfo('settings accountInfo', accountInfo);
    const settings = await bridge.fetchSettings();
    // logger.logState('settings', settings);
  });

  it('Hello World', async () => {
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
      Buffer.from('1122334455667788990011223344556677889900112233445566778899001122', 'hex'),
      Buffer.from('1122334455667788990011223344556677889900', 'hex'),
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
        'createAccount and InitializeMint',
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

    const seedSigner = Buffer.from('receive-request-seed', 'utf-8');
    const [pubSigner, bumpSigner] = await web3.PublicKey.findProgramAddress(
      [seedSigner],
      factory.bridge.pid,
    );
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
      Buffer.from('1122334455667788990011223344556677889900112233445566778899001122', 'hex'),
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

    const seedSigner = Buffer.from('receive-request-seed', 'utf-8');
    const [pubSigner, bumpSigner] = await web3.PublicKey.findProgramAddress(
      [seedSigner],
      factory.bridge.pid,
    );
    // logger.logPublicKey('pubSigner', pubSigner);
    // logger.log('bumpSigner:', bumpSigner);
    await helper.transfer(new BN('10000000000000000'), pubSigner);

    const ixInit = await main.init(pubSigner);
    // logger.logIx('ixInit', ixInit);

    const sinstInit: StandaloneInstruction = {
      programId: ixInit.programId,
      accounts: ixInit.keys as TransactionAccount[],
      data: ixInit.data,
    }

    const ixReceiveRequest = await bridge.receiveRequest(
      Buffer.from('1122334455667788990011223344556677889900112233445566778899001122', 'hex'),
      Buffer.from('1122334455667788990011223344556677889900', 'hex'),
      sinstInit,
      accAdmin.publicKey,
    );
    // logger.logIx('ixReceiveRequest', ixReceiveRequest);

    const tx = new web3.Transaction();
    tx.add(ixReceiveRequest);
    tx.recentBlockhash = await helper.getRecentBlockhash();

    await helper.sendAndConfirmTransaction(INIT_SYNTHESIS, tx, accAdmin);

    // expect(param).eq('100');
    // expect(owner).eq(accAdmin.publicKey.toBase58());
  });
});
