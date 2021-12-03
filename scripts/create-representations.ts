import { Provider, web3 } from "@project-serum/anchor";

import StubWallet from "../bridge-ts/stub-wallet";
import BridgeFactory, { SolanaHelper } from '../bridge-ts';
import { BridgeUserClient } from '../bridge-ts/bridge-user-client';
import { Logger } from '../utils-ts';

import keyAdmin from '../keys/admin-keypair.json';
import jsonTokens from './tokens.json';


// const connectionString = 'https://api.devnet.solana.com';
const connectionString = process.env.CNN_URL || 'http://localhost:8899';

const logger = new Logger();
logger.log({ connectionString });


interface IRealTokenDescription {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  chainId: number;
}

interface IJsonTokens {
  defaultTokens: IRealTokenDescription[];
}

const Chains = {
  4: 'Rinkeby',
  97: 'tBNB',
  256: 'tHeco',
  80001: 'tMatic',
}

async function createSynts(
  accAdmin: web3.Keypair,
  factory: BridgeFactory,
  helper: SolanaHelper,
) {
  const tokens = (jsonTokens as IJsonTokens).defaultTokens;
  // console.log(tokens);

  for (const desc of tokens) {
    const chainId = Chains[desc.chainId] || desc.chainId;
    const name = `e${ desc.name }(${ chainId })`;
    const address = Buffer.from(desc.address.substr(2), 'hex');
    console.log({ name, address });
    // console.log(desc);

    const tx = new web3.Transaction();
    const ix = await factory.main.createRepresentation(
      name, // desc.name,
      name, // desc.symbol,
      6, // desc.decimals,
      address, // desc.address,
      // desc.chainId,
      accAdmin.publicKey,
    );
    tx.add(ix);
    await helper.sendAndConfirmTransaction(
      `createRepresentation ${name}`,
      tx,
      accAdmin,
    );
  }
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

  await createSynts(accAdmin, factory, helper);

  const client = new BridgeUserClient(connection);
  console.log(await client.getListRepresentation());
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
