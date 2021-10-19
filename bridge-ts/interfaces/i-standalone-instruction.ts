import type { SolWeb3PublicKey } from './types';
import { TransactionAccount } from "./i-transaction-account";


export interface StandaloneInstruction {
  accounts: TransactionAccount[];
  programId: SolWeb3PublicKey;
  data: Buffer;
}
