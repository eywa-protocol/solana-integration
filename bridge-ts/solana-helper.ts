import {
  BN,
  Provider,
  web3,
} from '@project-serum/anchor';
import {
  Keypair,
  PublicKey,
} from '@solana/web3.js';

// import { sendAndConfirmTransaction } from '../tests/utils/send-and-confirm-transaction';


// export
// function sendAndConfirmTransaction(
//   title: string,
//   connection: web3.Connection,
//   transaction: web3.Transaction,
//   ...signers: Array<web3.Signer>
// ): Promise<web3.TransactionSignature> {
//   console.log(title);
//   return web3.sendAndConfirmTransaction(connection, transaction, signers, {
//     skipPreflight: false,
//   });
// }


export
class SolanaHelper {

  public constructor(
    private provider: Provider,
  ) {
    //
  }

  private get connection(): web3.Connection {
    return this.provider.connection;
  }

  public async getRecentBlockhash(): Promise<web3.Blockhash> {
    const { blockhash } = await this.connection
    .getRecentBlockhash('finalized');
    return blockhash;
  }

  public async transfer(
    amount: BN,
    pubTo: PublicKey,
    accFrom?: Keypair,
  ): Promise<web3.TransactionSignature> {
    const fromPubkey = accFrom?.publicKey ?? this.provider.wallet.publicKey;

    const params: web3.TransferParams = {
      fromPubkey,
      toPubkey: pubTo,
      // @ts-ignore
      lamports: amount,
    };

    const tx = new web3.Transaction();
    tx.add(web3.SystemProgram.transfer(params));

    let txId;
    if ( accFrom ) {
      tx.recentBlockhash = await this.getRecentBlockhash();
      txId = await this.sendAndConfirmTransaction(
        'transfer',
        tx,
        accFrom,
      );
    } else {
      txId = await this.provider.send(tx);
    }

    return txId;
  }

  public async sendAndConfirmTransaction(
    title: string,
    transaction: web3.Transaction,
    ...signers: Array<web3.Signer>
  ): Promise<web3.TransactionSignature> {
    console.log(title);
    return web3.sendAndConfirmTransaction(
      this.connection,
      transaction,
      signers,
      { skipPreflight: false },
    );
  }
}
