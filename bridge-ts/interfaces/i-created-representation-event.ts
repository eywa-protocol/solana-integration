import type { SolWeb3PublicKey, UInt160 } from './types';


export interface ICreatedRepresentationEvent {
  stoken: SolWeb3PublicKey;
  rtoken: UInt160;
}
