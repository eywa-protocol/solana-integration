import type { SolWeb3PublicKey, UInt160 } from './types';


export interface IMintDataAccount {
  tokenReal: UInt160;
  tokenSynt: SolWeb3PublicKey;
  name: String;
  symbol: String;
}
