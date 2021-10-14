import { Provider, web3 } from "@project-serum/anchor";

import StubWallet from "../bridge-ts/stub-wallet";
import BridgeFactory, { SolanaHelper } from '../bridge-ts';
import { Logger } from '../utils-ts';

import keyAdmin from '../keys/admin-keypair.json';


// const connectionString = 'https://api.devnet.solana.com';
const connectionString = process.env.CNN_URL || 'http://localhost:8899';

const logger = new Logger();
logger.log({ connectionString });


async function setOwner(
  // connection: web3.Connection,
  accAdmin: web3.Keypair,
  factory: BridgeFactory,
  helper: SolanaHelper,
) {
  logger.log(await factory.main.fetchSettings());
  logger.log(accAdmin.publicKey.toBuffer().toString('hex'));

  const tx = new web3.Transaction();
  const ix = await factory.main.setOwner(
    accAdmin.publicKey,
  );
  tx.add(ix);
  await helper.sendAndConfirmTransaction(
    'setOwner',
    tx,
    accAdmin,
  );

  logger.log(await factory.main.fetchSettings());
}

async function main() {
  const connection = new web3.Connection(connectionString);
  logger.log('EpochInfo:', await connection.getEpochInfo());

  // const accAdmin = web3.Keypair.generate();
  const accAdmin = web3.Keypair.fromSecretKey(Buffer.from(keyAdmin));
  logger.logPublicKey('accAdmin:', accAdmin.publicKey);

  const provider = new Provider(
    connection,
    StubWallet.instance,
    Provider.defaultOptions()
  );
  const helper = new SolanaHelper(provider);
  const factory = new BridgeFactory(connection);

  await setOwner(accAdmin, factory, helper);
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
