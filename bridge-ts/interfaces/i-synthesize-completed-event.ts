import type { SolSplU64, SolWeb3PublicKey, UInt160 } from './types';


export interface ISynthesizeCompleted {
  id: SolWeb3PublicKey;
  to: SolWeb3PublicKey;
  amount: SolSplU64;
  token: UInt160;
}
