import type { Byte, SolSplU64, SolWeb3PublicKey } from './types';


export interface IPortalSyntesizeSettingsAccount {
  bump: Byte;
  owner: SolWeb3PublicKey;
  portalNonce: SolSplU64;
  bridge: SolWeb3PublicKey;
  realTokens: SolWeb3PublicKey[];
  syntTokens: SolWeb3PublicKey[];
}
