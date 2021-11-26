import { BN, web3 } from "@project-serum/anchor";
import {
  Token,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import { Base } from "./prg-base";

import type { AccountInfo, MintInfo, u64 } from "@solana/spl-token";
import type { IFaucetSettingsAccount } from './interfaces';

const { SYSVAR_RENT_PUBKEY } = web3;
const seedMint = Buffer.from("mint-seed", "utf-8");
const seedData = Buffer.from("mint-data", "utf-8");
const seedPDA = Buffer.from('eywa-pda', 'utf-8');


export class TestTokenFaucet extends Base {
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

  public async fetchSettings(): Promise<IFaucetSettingsAccount> {
    const [pubSettings, bump] = await this.findSettingsAddress();
    const settings = await this.program.account.settings.fetch(pubSettings);
    return settings as IFaucetSettingsAccount;
  }

  public async fetchMintData(
    symbol: String,
  ): Promise<any> {
    const pubMintData = await this.getMintDataAddress(symbol);
    const mintData = await this.program.account.mintData.fetch(pubMintData);
    return mintData; // as IFaucetSettingsAccount;
  }

  public async fetchTokenAccountInfo(
    // pubToken: web3.PublicKey,
    symbol: String, // 'T1',
    pubUser: web3.PublicKey,
  ): Promise<AccountInfo> {
    const pubMint = await this.getMintAddress(symbol);
    // console.log('pubMint');
    // console.log(pubMint);

    const pubWallet = await this.getAssociatedTokenAddress(pubMint, pubUser);
    // console.log('pubWallet');
    // console.log(pubWallet);

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
    owner: web3.Keypair,
  ): Promise<web3.TransactionInstruction> {
    const [pdaSettings, bumpSettings] = await this.findSettingsAddress();

    const ixInit = this.program.instruction
    .initialize(bumpSettings, {
      accounts: {
        settings: pdaSettings,
        owner: owner.publicKey,
        systemProgram: web3.SystemProgram.programId,
      },
      signers: [owner],
    });

    return ixInit;
  }

  public async createMint(
    name: String, // 'Token 1',
    symbol: String, // 'T1',
    pubOwner: web3.PublicKey,
  ): Promise<web3.TransactionInstruction>  {
    // const settings = await this.fetchSettings();
    // console.log(settings);
    // const nonce = settings.nonce;

    // const bufSymbol = Buffer.from('12345678', 'utf-8');
    // const sizedSymbol = `        ${ symbol }`.substr(-8);
    // const sizedSymbol = symbol;
    // const bufSymbol = Buffer.from(sizedSymbol, 'utf-8');
    // console.log(bufSymbol);

    const pdaSettings = await this.getSettingsAddress();
    const [pubMint, bumpMint] = await this.findMintAddress(symbol);
    const [pubMintData, bumpMintData] = await this.findMintDataAddress(symbol);

    const ixCreateMint = this.program.instruction
    .createMint(
      bumpMint,
      bumpMintData,
      // bufSymbol,
      symbol,
      name,
      {
        accounts: {
          settings: pdaSettings,
          mint: pubMint,
          mintData: pubMintData,
          owner: pubOwner,
          systemProgram: web3.SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID
        }
      },
    );
    return ixCreateMint;
  }

  public async mintTo(
    symbol: String, // 'T1',
    pubUser: web3.PublicKey,
    amount: BN,
  ): Promise<web3.TransactionInstruction> {

    const pdaSettings = await this.getSettingsAddress();
    const pubMint = await this.getMintAddress(symbol);
    const pubMintData = await this.getMintDataAddress(symbol);

    const pubWallet = await this.getAssociatedTokenAddress(pubMint, pubUser);

    const ixMintTo = this.program.instruction
    .mintTo(amount, {
      accounts: {
        settings: pdaSettings,
        mint: pubMint,
        mintData: pubMintData,
        wallet: pubWallet,
        user: pubUser,
        tokenProgram: TOKEN_PROGRAM_ID
      }
    })
    return ixMintTo;
  }
}

