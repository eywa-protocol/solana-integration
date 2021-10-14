import { BN, Provider, web3 } from "@project-serum/anchor";

import StubWallet from "../bridge-ts/stub-wallet";

import BridgeFactory, {
  SolanaHelper,
  StandaloneInstruction,
  TransactionAccount,
} from '../bridge-ts';

import keyAdmin from '../keys/admin-keypair.json';


const connectionString = process.env.CNN_URL || 'http://localhost:8899';
console.log({ connectionString });
console.log('keyAdmin:', keyAdmin);


async function initBridge(
  accAdmin: web3.Keypair,
  factory: BridgeFactory,
  helper: SolanaHelper,
) {
  const ixInit = await factory.bridge.init(accAdmin);
  const tx = new web3.Transaction();
  tx.add(ixInit);
  // tx.recentBlockhash = await helper.getRecentBlockhash();

  await helper.sendAndConfirmTransaction('init bridge', tx, accAdmin);
}

async function initMain(
  accAdmin: web3.Keypair,
  factory: BridgeFactory,
  helper: SolanaHelper,
) {
  const pubSigner = await factory.bridge.getReceiveRequestAddress();
  await helper.transfer(new BN('10'+'000'+'000'+'000'), pubSigner, accAdmin);

  const ixInit = await factory.main.init(pubSigner);
  // logger.logIx('ixInit', ixInit);

  const sinstInit: StandaloneInstruction = {
    programId: ixInit.programId,
    accounts: ixInit.keys as TransactionAccount[],
    data: ixInit.data,
  }

  const ixReceiveRequest = await factory.bridge.receiveRequest(
    Buffer.from('1122334455667788990011223344556677889900112233445566778899001122', 'hex'),
    Buffer.from('1122334455667788990011223344556677889900', 'hex'),
    sinstInit,
    accAdmin.publicKey,
  );
  // logger.logIx('ixReceiveRequest', ixReceiveRequest);

  const tx = new web3.Transaction();
  tx.add(ixReceiveRequest);
  tx.recentBlockhash = await helper.getRecentBlockhash();

  await helper.sendAndConfirmTransaction('init main', tx, accAdmin);
}

async function main() {
  const connection = new web3.Connection(connectionString);
  console.log('EpochInfo:', await connection.getEpochInfo());

  // const accAdmin = web3.Keypair.generate();
  const accAdmin = web3.Keypair.fromSecretKey(Buffer.from(keyAdmin));

  const provider = new Provider(
    connection,
    StubWallet.instance,
    Provider.defaultOptions()
  );
  const helper = new SolanaHelper(provider);

  const factory = new BridgeFactory(connection);
  const { bridge, main } = factory;

  let settings;
  try {
    settings = await bridge.fetchSettings();
    console.log('settings', settings);
  } catch (ex) {
    console.log(ex);
  }
  if ( settings ) {
    process.exit(1);
  }

  await initBridge(accAdmin, factory, helper);
  console.log('Bridge settings', await bridge.fetchSettings());

  await initMain(accAdmin, factory, helper);
  console.log('Bridge settings', await bridge.fetchSettings());

}

process.on('beforeExit', (code) => {
  console.log(`process beforeExit with code: ${code}`);
});

process.on('uncaughtException', (err) => {
  console.log(err);
  console.log(`process on uncaughtException error: ${err}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err);
  console.log(`process on unhandledRejection error: ${err}`);
});


main().then(console.log);
