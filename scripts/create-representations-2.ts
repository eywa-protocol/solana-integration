import { Provider, web3 } from "@project-serum/anchor";

import StubWallet from "../bridge-ts/stub-wallet";
import BridgeFactory, { SolanaHelper } from '../bridge-ts';
import { Logger } from '../utils-ts';

import keyAdmin from '../keys/admin-keypair.json';


// const connectionString = 'https://api.devnet.solana.com';
const connectionString = process.env.CNN_URL || 'http://localhost:8899';

const logger = new Logger();
logger.log({ connectionString });

const symbols = [
  'SOL',
  'EYWA',
  'USDT',
];

async function initFaucet(
  accAdmin: web3.Keypair,
  factory: BridgeFactory,
  helper: SolanaHelper,
) {
  const ixInit = await factory.faucet.init(accAdmin.publicKey);
  const tx = new web3.Transaction();
  tx.add(ixInit);
  tx.recentBlockhash = await helper.getRecentBlockhash();

  await helper.sendAndConfirmTransaction('Initialize faucet', tx, accAdmin);
}

async function createReals(
  accAdmin: web3.Keypair,
  factory: BridgeFactory,
  helper: SolanaHelper,
  connection: web3.Connection,
) {

  await initFaucet(
    accAdmin,
    factory,
    helper,
  );

  for(let i in symbols) {
    const symbol = symbols[i];

    try {
      const ixCreateMint = await factory.faucet.createMint(
        symbol, // name,
        symbol,
        accAdmin.publicKey,
      );
      const tx2 = new web3.Transaction();
      tx2.add(ixCreateMint);

      tx2.recentBlockhash = await helper.getRecentBlockhash();
      await helper.sendAndConfirmTransaction('Create mint', tx2, accAdmin);
    } catch (ex) {
      console.log(ex);
    }

    const pubToken = await factory.faucet.getMintAddress(symbol);
    logger.logPublicKey(`token(${ symbol })`, pubToken);
    logger.log(await connection.getAccountInfo(pubToken));
    logger.log(await factory.faucet.fetchMintData(symbol));

    const tx = new web3.Transaction();
    const ix = await factory.main.createRepresentationRequest(
      pubToken,
      accAdmin.publicKey,
    );
    tx.add(ix);
    await helper.sendAndConfirmTransaction(
      `createRepresentationRequest ${ pubToken.toBase58() }`,
      tx,
      accAdmin,
    );
  }

  logger.log(await factory.main.fetchSettings());
}

async function main() {
  const connection = new web3.Connection(connectionString);
  logger.log('EpochInfo:', await connection.getEpochInfo());

  const accAdmin = web3.Keypair.fromSecretKey(Buffer.from(keyAdmin));
  logger.logPublicKey('accAdmin:', accAdmin.publicKey);

  const provider = new Provider(
    connection,
    StubWallet.instance,
    Provider.defaultOptions()
  );
  const helper = new SolanaHelper(provider);
  const factory = new BridgeFactory(connection);

  await createReals(accAdmin, factory, helper, connection);
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
