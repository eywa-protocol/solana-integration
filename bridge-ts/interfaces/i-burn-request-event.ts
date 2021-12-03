import type { SolSplU64, SolWeb3PublicKey, UInt160 } from './types';


export interface IBurnRequestEvent {
  id: SolWeb3PublicKey;
  from: SolWeb3PublicKey;
  to: SolWeb3PublicKey;
  amount: SolSplU64;
  token: UInt160;
}
