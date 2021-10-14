import { Provider, web3 } from "@project-serum/anchor";
import {
  MintLayout,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

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

/*
token0 base58: 8snoSwNTWKRPC7tvnoexKSNHmyeCVwT6jN6SMny2hYYY
token0 hex: 7504a2d65ccb19973eb7c8853835c9beb819ae5ecb1436f8b485a59d71825711
token1 base58: 9nDtrFdpczr8w3n8TRZMfDgkGLPMGhMiMb9x9jH2G3EJ
token1 hex: 82733607cbd6269cc8f8d5badddc8d48bb86f8cdb5a857a2efacc6bae2ad4633
token2 base58: 89FDqCroGLK39uBArJSCApDJFWPW2DBrdeQV5tUTkL7A
token2 hex: 6a1e88f264c96a15ded538135f9c72b97b3ada23497b49fc867238c253073a09
*/

const keys = [
  new Uint8Array([
    127,  65, 129, 246, 121, 111, 248, 207, 143, 179, 228,
    213, 162, 118, 115, 123, 252, 133,  84, 162,  34,  12,
    118,  17, 106,  88, 102,  87, 188, 203,  39, 155, 117,
      4, 162, 214,  92, 203,  25, 151,  62, 183, 200, 133,
     56,  53, 201, 190, 184,  25, 174,  94, 203,  20,  54,
    248, 180, 133, 165, 157, 113, 130,  87,  17
  ]),
  new Uint8Array([
    183,  18, 111, 232,   2, 172,  93,  10, 206,  21, 240,
    235, 131, 244, 117,   3, 131, 238, 192, 146,  56,  64,
     94, 132,  84,   2, 211, 180, 139,  46,  80, 168, 130,
    115,  54,   7, 203, 214,  38, 156, 200, 248, 213, 186,
    221, 220, 141,  72, 187, 134, 248, 205, 181, 168,  87,
    162, 239, 172, 198, 186, 226, 173,  70,  51
  ]),
  new Uint8Array([
    211, 242, 171, 107, 122, 188,  61, 152,  91,  61,  57,
     54,  75,  40,  34, 201, 115,  88, 143, 174,  64,  51,
    178,  84, 157,  16, 210,  71, 180, 117, 239,  12, 106,
     30, 136, 242, 100, 201, 106,  21, 222, 213,  56,  19,
     95, 156, 114, 185, 123,  58, 218,  35,  73, 123,  73,
    252, 134, 114,  56, 194,  83,   7,  58,   9
  ]),
];

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
    const address = desc.address.substr(2);
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

async function createMint(
  mintAccount: web3.Keypair,
  connection: web3.Connection,
  payer: web3.Signer,
  mintAuthority: web3.PublicKey,
  freezeAuthority: web3.PublicKey | null,
  decimals: number,
  programId: web3.PublicKey,
  helper: SolanaHelper,
): Promise<Token> {
  // const mintAccount = Keypair.generate();
  const token = new Token(
    connection,
    mintAccount.publicKey,
    programId,
    payer,
  );

  // Allocate memory for the account
  const balanceNeeded = await Token.getMinBalanceRentForExemptMint(
    connection,
  );

  const transaction = new web3.Transaction();
  transaction.add(
    web3.SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mintAccount.publicKey,
      lamports: balanceNeeded,
      space: MintLayout.span,
      programId,
    }),
  );

  transaction.add(
    Token.createInitMintInstruction(
      programId,
      mintAccount.publicKey,
      decimals,
      mintAuthority,
      freezeAuthority,
    ),
  );

  // Send the two instructions
  await helper.sendAndConfirmTransaction(
    'createAccount and InitializeMint',
    // connection,
    transaction,
    payer,
    mintAccount,
  );

  return token;
}

async function createReals(
  connection: web3.Connection,
  accAdmin: web3.Keypair,
  factory: BridgeFactory,
  helper: SolanaHelper,
) {
  // const keys = [1, 2, 3].map(() => web3.Keypair.generate().secretKey);
  // logger.log('keys', JSON.stringify(keys, null, 2));
  logger.log('keys', keys);


  for (let index = 0; index < keys.length; index++) {
    const accMint = web3.Keypair.fromSecretKey( keys[index]);

    let aiMint;
    try {
      aiMint = await connection.getAccountInfo(accMint.publicKey);
      // console.log('aiMint', aiMint);
    } catch (ex) {
      console.log(ex);
    }
    if ( !aiMint ) {
      const mint = await createMint(
        accMint,
        connection,
        accAdmin,
        accAdmin.publicKey,
        accAdmin.publicKey,
        6,
        TOKEN_PROGRAM_ID,
        helper,
      );
      const pubToken = mint.publicKey;
      logger.logPublicKey(`token${ index }`, pubToken);
    }
    logger.logPublicKey(`mint${ index }`, accMint.publicKey);

    logger.log(await factory.main.fetchSettings());

    const tx = new web3.Transaction();
    const ix = await factory.main.createRepresentationRequest(
      accMint.publicKey,
      accAdmin.publicKey,
    );
    tx.add(ix);
    await helper.sendAndConfirmTransaction(
      `createRepresentationRequest ${ accMint.publicKey.toBase58() }`,
      tx,
      accAdmin,
    );

    logger.log(await factory.main.fetchSettings());
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

  await createReals(connection, accAdmin, factory, helper);
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
