import type { SolWeb3PublicKey } from './types';


export interface IRevertBurnRequest {
  id: SolWeb3PublicKey;
  to: SolWeb3PublicKey;
}
