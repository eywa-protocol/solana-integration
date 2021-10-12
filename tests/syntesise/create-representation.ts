import {
  assert,
  // expect,
} from 'chai';

import {
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { web3 } from '@project-serum/anchor';

import BridgeFactory, { SolanaHelper } from '../../bridge-ts';
import { BridgeUserClient } from '../../bridge-ts/bridge-user-client';

import type { Provider } from '@project-serum/anchor';
import type { AsyncParam } from '../utils/async-param';


export const CreateRepresentationTests = ({
  provider,
  admin,
}: {
  provider: Provider;
  admin: AsyncParam;
}) => describe('Create representation', () => {
  let accAdmin: web3.Keypair;

  const helper = new SolanaHelper(provider);
  const factory = new BridgeFactory(provider.connection);
  const { main } = factory;

  before(async () => {
    accAdmin = (await admin.createPromise()) as web3.Keypair;
  });

  const CREATE_NEW_REPRESENTATION = 'create new representation';
  it(`should ${ CREATE_NEW_REPRESENTATION }`, async () => {
    const realToken = /* 0x */"1234567890123456789012345678901234567890";

    const ixCreateRepresentation = await main.createRepresentation(
      'Some Synt Name', // synt name
      'SSN', // synt short name
      2, // decimals
      realToken,
      accAdmin.publicKey,
    );

    const tx = new web3.Transaction();
    tx.add(ixCreateRepresentation);

    await helper
    .sendAndConfirmTransaction(CREATE_NEW_REPRESENTATION, tx, accAdmin);

    const mintAccount = new Token(
      provider.connection,
      await main.getSyntMintAddress(realToken),
      TOKEN_PROGRAM_ID,
      accAdmin,
    );
    const mintInfo = await mintAccount.getMintInfo();
    console.log('mintInfo:', mintInfo);

    console.log('mintData:');
    console.log(await main.fetchSyntDataByReal(realToken));

    const settings = await main.fetchSettings();
    console.log('settings');
    console.log(settings);

    const client = new BridgeUserClient(provider.connection);
    const representations = await client.getListRepresentation();
    console.log('representations');
    console.log(representations);
  });
});
