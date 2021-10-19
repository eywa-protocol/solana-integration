import type { SolWeb3PublicKey } from './types';


export interface TransactionAccount {
  pubkey: SolWeb3PublicKey;
  isSigner: Boolean;
  isWritable: Boolean;
}
