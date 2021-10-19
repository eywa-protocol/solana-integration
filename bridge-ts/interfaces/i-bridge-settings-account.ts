import type { Byte, SolSplU64, SolWeb3PublicKey } from './types';


export interface IBridgeSettingsAccount {
  owner: SolWeb3PublicKey;
  nonce: SolSplU64;
  bump: Byte;
}
