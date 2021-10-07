import { BN, web3 } from '@project-serum/anchor';
import {
  Token,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import BridgeFactory from './';

import type { Syntesise } from './prg-syntesise';


export class BridgeUserClient {
  private main: Syntesise;

  constructor(
    connection: web3.Connection,
  ) {
    this.main = (new BridgeFactory(connection)).main;
  }

  // public get pidSynthesis() {}
  // public get pidBridge() {}

  // checkContractEvent

  public async createPortalSynthesizeInstruction(
    amount: BN,
    chainToAddress: Uint8Array | Buffer, // [u8; 20],
    receiveSide: Uint8Array | Buffer, // [u8; 20],
    oppositeBridgeAddress: Uint8Array | Buffer,
    destinationChainId, // enum
    pubToken: web3.PublicKey,
    pubUser: web3.PublicKey,
    // pubSource: web3.PublicKey
  ): Promise<web3.TransactionInstruction> {
    const pubSource = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      pubToken,
      pubUser,
    );

    return this.main.synthesize(
      amount,
      chainToAddress,
      receiveSide,
      Buffer.from(oppositeBridgeAddress), // [u8; 20],
      new BN(destinationChainId), // u64
      pubToken,
      pubUser,
      pubSource,
    );
  }
}
