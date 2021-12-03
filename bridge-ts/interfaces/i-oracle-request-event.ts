import type { SolSplU64, SolWeb3PublicKey, UInt160 } from './types';


export interface IOracleRequestEvent {
  requestType: string;
  bridge: SolWeb3PublicKey;
  requestId: SolWeb3PublicKey;
  selector: Uint8Array;
  receiveSide: UInt160;
  oppositeBridge: UInt160;
  chainId: SolSplU64;
}
