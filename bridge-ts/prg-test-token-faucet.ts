import { BN, web3 } from "@project-serum/anchor";
import {
  Token,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { TypeDef, IdlTypes } from "@project-serum/anchor/dist/cjs/program/namespace/types";

import { PrgBase } from "./prg-base";
import { TestTokenFaucet } from '../target/types/test_token_faucet';

import type {
  AccountInfo,
  // MintInfo,
  // u64,
} from "@solana/spl-token";

export type IdlTestTokenFaucet = TestTokenFaucet;

namespace NsTestTokenFaucet {
  type Accounts = IdlTestTokenFaucet["accounts"];
  type SettingsAccount = Accounts[0];
  type MintDataAccount = Accounts[1];
  export type ISettingsAccount = TypeDef<SettingsAccount, IdlTypes<IdlTestTokenFaucet>>;
  export type IMintDataAccount = TypeDef<MintDataAccount, IdlTypes<IdlTestTokenFaucet>>;
}

const { SYSVAR_RENT_PUBKEY } = web3;
const seedMint = Buffer.from("mint-seed", "utf-8");
const seedData = Buffer.from("mint-data", "utf-8");
const seedPDA = Buffer.from('eywa-pda', 'utf-8');


export class PrgTestTokenFaucet extends PrgBase<IdlTestTokenFaucet> {
  private accGuest = web3.Keypair.generate();

  public async findSettingsAddress(): Promise<[web3.PublicKey, number]> {
    return this.findProgramAddress([seedPDA]);
  }

  public async getSettingsAddress(): Promise<web3.PublicKey> {
    return this.getProgramAddress([seedPDA]);
  }

  public async getMintAddress(
    symbol: String,
  ): Promise<web3.PublicKey> {
    return this.getProgramAddress([seedMint, Buffer.from(symbol, 'utf-8')]);
  }

  public async findMintAddress(
    symbol: String,
  ): Promise<[web3.PublicKey, number]> {
    return this.findProgramAddress([seedMint, Buffer.from(symbol, 'utf-8')]);
  }

  public async getMintDataAddress(
    symbol: String,
  ): Promise<web3.PublicKey> {
    return this.getProgramAddress([seedData, Buffer.from(symbol, 'utf-8')]);
  }

  public async findMintDataAddress(
    symbol: String,
  ): Promise<[web3.PublicKey, number]> {
    return this.findProgramAddress([seedData, Buffer.from(symbol, 'utf-8')]);
  }

  public async fetchSettings(): Promise<NsTestTokenFaucet.ISettingsAccount> {
    const pubSettings = await this.getSettingsAddress();
    return this.program.account.settings.fetch(pubSettings);
  }

  public async fetchMintData(
    symbol: String,
  ): Promise<NsTestTokenFaucet.IMintDataAccount> {
    const pubMintData = await this.getMintDataAddress(symbol);
    return this.program.account.mintData.fetch(pubMintData);
  }

  public async fetchTokenAccountInfo(
    symbol: String,
    pubUser: web3.PublicKey,
  ): Promise<AccountInfo> {
    const pubMint = await this.getMintAddress(symbol);
    const pubWallet = await this.getAssociatedTokenAddress(pubMint, pubUser);

    const mintAccount = new Token(
      this.connection,
      pubMint,
      TOKEN_PROGRAM_ID,
      this.accGuest,
    );

    return mintAccount.getAccountInfo(pubWallet);
  }

  /*
  public async fetchUserTokenBalance(
    pubToken: web3.PublicKey,
    pubUser: web3.PublicKey,
  ): Promise<u64> {
    const ai = await this.fetchTokenAccountInfo(pubToken, pubUser);
    return ai.amount;
  }
  */

  public async getAssociatedTokenAddress(
    pubToken: web3.PublicKey,
    pubUser: web3.PublicKey,
    allowOwnerOffCurve: boolean = false,
  ): Promise<web3.PublicKey> {
    return Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      pubToken,
      pubUser,
      allowOwnerOffCurve,
    );
  }

  public async init(
    pubOwner: web3.PublicKey,
  ): Promise<web3.TransactionInstruction> {
    const [pdaSettings, bumpSettings] = await this.findSettingsAddress();

    return this.program.instruction.initialize(
      bumpSettings,
      { accounts: {
        settings: pdaSettings,
        owner: pubOwner,
        systemProgram: web3.SystemProgram.programId,
      },
    });
  }

  public async createMint(
    name: String,
    symbol: String,
    pubOwner: web3.PublicKey,
  ): Promise<web3.TransactionInstruction>  {
    const pdaSettings = await this.getSettingsAddress();
    const [pubMint, bumpMint] = await this.findMintAddress(symbol);
    const [pubMintData, bumpMintData] = await this.findMintDataAddress(symbol);

    return this.program.instruction.createMint(
      bumpMint,
      bumpMintData,
      symbol,
      name,
      { accounts: {
        settings: pdaSettings,
        mint: pubMint,
        mintData: pubMintData,
        owner: pubOwner,
        systemProgram: web3.SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID
      }},
    );
  }

  public async mintTo(
    symbol: String,
    pubUser: web3.PublicKey,
    amount: BN,
  ): Promise<web3.TransactionInstruction> {
    const pdaSettings = await this.getSettingsAddress();
    const pubMint = await this.getMintAddress(symbol);
    const pubMintData = await this.getMintDataAddress(symbol);
    const pubWallet = await this.getAssociatedTokenAddress(pubMint, pubUser);

    return this.program.instruction.mintTo(
      amount,
      { accounts: {
        settings: pdaSettings,
        mint: pubMint,
        mintData: pubMintData,
        wallet: pubWallet,
        user: pubUser,
        tokenProgram: TOKEN_PROGRAM_ID
      }},
    );
  }
}
