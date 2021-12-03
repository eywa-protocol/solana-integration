import { BN, web3 } from '@project-serum/anchor';
import {
  Token,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import BridgeFactory from './';

import type { AccountInfo, MintInfo, u64 } from "@solana/spl-token";
import type { NEywaPortalSynthesis, PrgSyntesise } from './prg-syntesise';
import type { PrgTestTokenFaucet } from './prg-test-token-faucet';
import type {
  IBurnRequestEvent,
  ISynthesizeRequestEvent,
} from "../bridge-ts/interfaces";

export class BridgeUserClient {
  private main: PrgSyntesise;
  private faucet: PrgTestTokenFaucet;
  private accGuest = web3.Keypair.generate();

  constructor(
    private connection: web3.Connection,
  ) {
    const factory = new BridgeFactory(connection);
    this.main = factory.main;
    this.faucet = factory.faucet;
  }

  public async mintTestTokenBySymbol(
    symbol: String,
    pubUser: web3.PublicKey,
    amount: BN,
  ): Promise<web3.TransactionInstruction> {
    return this.faucet.mintTo(symbol, pubUser, amount);
  }

  public async fetchTokenMintInfo(
    pubToken: web3.PublicKey,
  ): Promise<MintInfo> {
    const mintAccount = new Token(
      this.connection,
      pubToken,
      TOKEN_PROGRAM_ID,
      this.accGuest,
    );

    return mintAccount.getMintInfo();
  }

  public async fetchTokenAccountInfo(
    pubToken: web3.PublicKey,
    pubUser: web3.PublicKey,
  ): Promise<AccountInfo> {
    const mintAccount = new Token(
      this.connection,
      pubToken,
      TOKEN_PROGRAM_ID,
      this.accGuest,
    );

    return mintAccount.getAccountInfo(pubUser);
  }

  public async fetchUserTokenBalance(
    pubToken: web3.PublicKey,
    pubUser: web3.PublicKey,
  ): Promise<u64> {
    const ai = await this.fetchTokenAccountInfo(pubToken, pubUser);
    return ai.amount;
  }

  public async fetchAllUserTokenAccountInfos(
    pubUser: web3.PublicKey,
  ): Promise<AccountInfo[]> {
    const result: AccountInfo[] = [];

    const filter: web3.TokenAccountsFilter = {
      programId: TOKEN_PROGRAM_ID,
    };

    const resp = await this.connection
    .getTokenAccountsByOwner(pubUser, filter);
    for (const { account, pubkey } of resp?.value) {
      const tokenMint = new web3.PublicKey(
        (account.data as Buffer).slice(0, 32)
      );
      const ai = await this.fetchTokenAccountInfo(tokenMint, pubkey);
      result.push(ai);
    }

    return result;
  }

  public async fetchAllUserTokenBalances(
    pubUser: web3.PublicKey,
  ): Promise<{ [publickey: string]: u64 }> {
    const result: { [publickey: string]: u64 } = {};

    const ais = await this.fetchAllUserTokenAccountInfos(pubUser);
    ais.forEach(({ mint, amount }) => {
      result[mint.toBase58()] = amount;
    });

    return result;
  }

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

  // synthesize.burnSyntheticToken
  // NOTE: emergencyUnburnRequest portal method for revert unsynthesize. Use in opposite portal
  // export const revertUnsynthesize = async (
  // NOTE: emergencyUnsyntesizeRequest synthesize method fro revert synthesize. Use in opposite synthesis
  // export const revertSynthesize = async (

  public async getListRepresentation(): Promise<NEywaPortalSynthesis.IMintDataAccount[]> {
    const settings = await this.main.fetchSettings();
    const { syntTokens } = settings;
    const representations: NEywaPortalSynthesis.IMintDataAccount[] = [];
    for (const pubMintData of syntTokens) {
      representations.push(
        await this.main.fetchSyntData(pubMintData),
      );
    }
    return representations;
  }

  private addEventListener(
    evName: string,
    handler: (ev: any) => void,
  ): number {
    return this.main.addEventListener(evName, handler);
  }

  private removeEventListener(subscriptionId: number) {
    return this.main.removeEventListener(subscriptionId);
  }

  public subscribeSynthesizeRequest(
    handler: (ev: ISynthesizeRequestEvent) => void,
  ): number {
    return this.addEventListener('SynthesizeRequest', handler);
  }

  public unsubscribeSynthesizeRequest(subscriptionId: number) {
    return this.main.removeEventListener(subscriptionId);
  }

  public subscribeBurnRequest(
    handler: (ev: IBurnRequestEvent) => void,
  ): number {
    return this.addEventListener('BurnRequest', handler);
  }

  public unsubscribeBurnRequest(subscriptionId: number) {
    return this.removeEventListener(subscriptionId);
  }

}
