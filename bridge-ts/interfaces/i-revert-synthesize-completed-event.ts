import type { SolSplU64, SolWeb3PublicKey } from './types';


export interface IRevertSynthesizeCompleted {
  id: SolWeb3PublicKey;
  to: SolWeb3PublicKey;
  amount: SolSplU64;
  token: SolWeb3PublicKey;
}
