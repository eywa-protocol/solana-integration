
import { web3 } from "@project-serum/anchor";

import type { Wallet } from "@project-serum/anchor/src/provider";


export default
class StubWallet implements Wallet {
  private static _instance: StubWallet;
  static get instance(): StubWallet {
    if ( !this._instance ) {
      this._instance = new StubWallet(/* payer */);
    }
    return this._instance;
  }

  protected constructor(
    // readonly payer: web3.Keypair,
  ) {
    //
  }

  async signTransaction(tx: web3.Transaction): Promise<web3.Transaction> {
    throw new Error('method signTransaction not implemented for StubWallet');
    return tx;
  }

  async signAllTransactions(txs: web3.Transaction[]): Promise<web3.Transaction[]> {
    throw new Error('method signAllTransactions not implemented for StubWallet');
    return txs;
  }

  get publicKey(): web3.PublicKey {
    throw new Error('property publicKey not implemented for StubWallet');
    return web3.PublicKey.default;
  }
}
