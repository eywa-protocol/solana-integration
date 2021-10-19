import type { Byte, SolWeb3PublicKey } from './types';


export interface IBurnCompletedEvent {
  id: SolWeb3PublicKey;
  to: SolWeb3PublicKey;
  amount: Byte;
  token: SolWeb3PublicKey;
}
