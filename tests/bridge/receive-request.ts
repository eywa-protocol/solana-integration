import assert from 'assert';
import { expect } from 'chai';

import {
  web3,
  workspace,
} from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

import { sendAndConfirmTransaction } from '../utils/send-and-confirm-transaction';

import type { Provider } from '@project-serum/anchor';
import type { AsyncParam } from '../utils/async-param';

import { Logger } from '../../utils-ts';


interface TransactionAccount {
  pubkey: PublicKey;
  isSigner: Boolean;
  isWritable: Boolean;
}
interface StandaloneInstruction {
  programId: PublicKey;
  accounts: TransactionAccount[];
  data: Buffer;
}

const logger = new Logger();

export const ReceiveRequestTests = ({
  provider,
  admin,
}: {
  provider: Provider;
  admin: AsyncParam;
}) => describe('Receive request', () => {
  let accAdmin: web3.Keypair;

  before(async () => {
    accAdmin = (await admin.createPromise()) as web3.Keypair;
    logger.logPublicKey('accAdmin', accAdmin.publicKey);
  });

  it.skip("Hello World", async () => {
    const program = workspace.EywaBridgeSolana;

    const ixHello = await program.instruction.hello('World', {
      accounts: {
        // person: provider.wallet.publicKey,
        person: accAdmin.publicKey,
      },
    });

    const si: StandaloneInstruction = {
      programId: ixHello.programId,
      accounts: ixHello.keys as TransactionAccount[],
      data: ixHello.data,
    }
    const ixReceiveRequest = await program.state.instruction.receiveRequest(
      Buffer.from('1122334455667788990011223344556677889900112233445566778899001122', 'hex'), // req_id: [u8; 32], // bytes32 reqId,
      si, // sinst: StandaloneInstruction, // bytes memory b, address receiveSide,
      Buffer.from('1122334455667788990011223344556677889900', 'hex'), // bridge_from: [u8; 20], // address bridgeFrom
    {
      accounts: {
        proposer: accAdmin.publicKey,
      },
      remainingAccounts: [
        { pubkey: program.programId, isWritable: false, isSigner: false },
        // { pubkey: provider.wallet.publicKey, isWritable: false, isSigner: false },
        { pubkey: accAdmin.publicKey, isWritable: false, isSigner: false },
      ],
    });
    const transaction = new web3.Transaction();
    transaction.add(ixReceiveRequest);
    const { blockhash } = await provider.connection.getRecentBlockhash('finalized');
    transaction.recentBlockhash = blockhash;
    transaction.sign(accAdmin);

    const transaction2 = new web3.Transaction();
    transaction2.add(ixHello);
    transaction2.recentBlockhash = PublicKey.decode(Buffer.from(
      '1122334455667788990011223344556677889900112233445566778899001122', 'hex')).toBase58();
    transaction2.sign(accAdmin);
    const bufTx = transaction2.serialize();
    console.log('signed transaction');
    console.log(bufTx.toString('hex'));

    let listener = null;
    let event, slot;
    try {
      [event, slot] = await new Promise((resolve, reject) => {
        console.log('setting listener');
        listener = program.addEventListener(
          'ReceiveRequest',
          (event, slot) => resolve([event, slot]),
        );

        sendAndConfirmTransaction(
          'createAccount and InitializeMint',
          provider.connection,
          transaction,
          accAdmin,
        )
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
      await program.removeEventListener(listener);
    }

    // console.log(slot, event);
    assert.ok(slot > 0);
    const receiveSide = event.receiveSide.toString();
    const programId = ixHello.programId.toString();
    console.log({ receiveSide, programId });
    expect(receiveSide).eq(programId);
  });

  /*
    01
    e2fe190b11963994db3ececbeb4dc77e01fda23b4f301dff1721e87103748feb
    1b38785df859d986c0f42f441ccbdc3a9d15fc5ee31542fd3337327264057009
    01
    00
    01
    03
    5452c64aecb2b837edd5fcd03f78bd554fae621ae7e5a31f7a976c8105900b57
    ad5dbbc2d1b9f569e18312800a127ce31e121b49955d47ab0605199571d58817
    7ed5e109f6a55b74e1d1f8e7592453f8ff6d83b68efdc7a229e1e32132b575b1
    4c958442a762095cc4d36c703d19084fd4f286141dfba574c2008789cce4e10a
    01
    02
    04
    01
    00
    02
    0097015c2e6c2ab340088b
    1122334455667788990011223344556677889900112233445566778899001122

    01
    00

    00
    00
    5452c64aecb2b837edd5fcd03f78bd554fae621ae7e5a31f7a976c8105900b57
    00
    00
    7ed5e109f6a55b74e1d1f8e7592453f8ff6d83b68efdc7a229e1e32132b575b1

    11
    00
    00
    00
    95763bdcc47fa1b3
    05000000
    576f726c64

    1122334455667788990011223344556677889900
  */
});
