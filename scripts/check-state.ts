import { web3 } from "@project-serum/anchor";

import BridgeFactory from '../bridge-ts';
import { Logger } from '../utils-ts';

// const connectionString = 'https://api.devnet.solana.com';
const connectionString = process.env.CNN_URL || 'http://localhost:8899';

const logger = new Logger();
logger.log({ connectionString });

async function main() {
  const connection = new web3.Connection(connectionString);
  logger.log('EpochInfo:', await connection.getEpochInfo());

  const factory = new BridgeFactory(connection);

  logger.log(await factory.main.fetchSettings());
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
