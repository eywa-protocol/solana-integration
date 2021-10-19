import type { RequestState, SolSplU64, SolWeb3PublicKey, UInt160 } from './types';


export interface ISynthesizeRequestEvent {
  id: SolWeb3PublicKey;
  from: SolWeb3PublicKey;
  to: UInt160;
  amount: SolSplU64;
  realToken: SolWeb3PublicKey;
  state: RequestState;
}
