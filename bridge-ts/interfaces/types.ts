import { web3 } from "@project-serum/anchor";
import { u64 } from "@solana/spl-token";


export type Base58PublicKey = string;

export type SolWeb3PublicKey = web3.PublicKey;
export type SolSplU64 = u64;

export type Byte = number;

// export type UInt256 = Buffer;
export type UInt160 = Buffer;

export enum RequestState {
  Default,
  Sent,
  Reverted,
}

export enum UnsynthesizeState {
  Default,
  Unsynthesized,
  RevertRequest,
}
