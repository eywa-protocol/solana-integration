import type { RequestState, SolSplU64, SolWeb3PublicKey } from './types';


export interface ISynthesizeRequest {
  recipient: SolWeb3PublicKey;
  chainToAddress: Uint8Array;
  realToken: SolWeb3PublicKey;
  amount: SolSplU64;
  state: RequestState;
}