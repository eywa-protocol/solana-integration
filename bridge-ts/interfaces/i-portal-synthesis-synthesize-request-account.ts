import type { RequestState, SolSplU64, SolWeb3PublicKey, UInt160 } from './types';


export interface ISynthesizeRequestAccount {
  recipient: SolWeb3PublicKey;
  chain_to_address: UInt160;
  real_token: SolWeb3PublicKey;
  amount: SolSplU64;
  state: RequestState;
}
