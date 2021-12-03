import {
  Token,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  // AccountNamespace,
  BN,
  // Idl,
  web3,
} from "@project-serum/anchor";
import { TypeDef, IdlTypes } from "@project-serum/anchor/dist/cjs/program/namespace/types";

import { PrgBridge } from "./prg-bridge";
// import { Logger } from '../utils-ts';
import { PrgBase } from "./prg-base";

import { EywaPortalSynthesis } from '../target/types/eywa_portal_synthesis';

import type { UInt160 } from "./types";

export type IdlSyntesise = EywaPortalSynthesis;

export namespace NEywaPortalSynthesis {
  type Accounts = EywaPortalSynthesis["accounts"];
  type SettingsAccount = Accounts[0];
  type SynthesizeStateAccount = Accounts[2];
  type MintDataAccount = Accounts[1];

  export type ISettingsAccount = TypeDef<SettingsAccount, IdlTypes<IdlSyntesise>>;
  export type ISynthesiseStateAccount = TypeDef<SynthesizeStateAccount, IdlTypes<IdlSyntesise>>;
  export type IMintDataAccount = TypeDef<MintDataAccount, IdlTypes<IdlSyntesise>>;
}

const ALLOW_OWNER_OFF_CURVE = true;

const seedMint = Buffer.from("mint-synt", "utf-8");
const seedData = Buffer.from("mint-data", "utf-8");
const seedPDA = Buffer.from("eywa-pda", "utf-8");
const seedTxState = Buffer.from("eywa-tx-state", "utf-8");
const seedSyntReq = Buffer.from("eywa-synthesize-state", "utf-8");


export class PrgSyntesise extends PrgBase<IdlSyntesise> {
  // private logger = new Logger();
  // private accGuest = web3.Keypair.generate();

  constructor(
    connection: web3.Connection,
    programId: web3.PublicKey,
    idl: IdlSyntesise, // Idl,
    // provider: Provider,
    // private owner: Keypair,
    private bridge: PrgBridge,
  ) {
    super(connection, programId, idl);
    // this.logger.logPublicKey('pidSyntesise', programId);
    // this.connection = provider.connection;
  }

  public async findProgramAddress(
    seeds: (Uint8Array | Buffer)[]
  ): Promise<[web3.PublicKey, number]> {
    return web3.PublicKey.findProgramAddress(seeds, this.program.programId);
  }

  public async getProgramAddress(
    seeds: (Uint8Array | Buffer)[]
  ): Promise<web3.PublicKey> {
    const [addr] = await this.findProgramAddress(seeds);
    return addr;
  }

  public async findSettingsAddress(): Promise<[web3.PublicKey, number]> {
    return this.findProgramAddress([seedPDA]);
  }

  public async getSettingsAddress(): Promise<web3.PublicKey> {
    return this.getProgramAddress([seedPDA]);
  }

  public async findSynthesizeRequestAddress(
    pubToken: web3.PublicKey,
    // ???
  ): Promise<[web3.PublicKey, number]> {
    return this.findProgramAddress([seedSyntReq, pubToken.toBuffer()]);
  }

  public async getSynthesizeRequestAddress(
    pubToken: web3.PublicKey,
    // ???
  ): Promise<web3.PublicKey> {
    return this.getProgramAddress([seedSyntReq, pubToken.toBuffer()]);
  }

  public async findTxStateAddress(
    pubToken: web3.PublicKey,
    // ???
  ): Promise<[web3.PublicKey, number]> {
    return this.findProgramAddress([seedTxState, pubToken.toBuffer()]);
  }

  public async getTxStateAddress(
    pubToken: web3.PublicKey,
    // ???
  ): Promise<web3.PublicKey> {
    return this.getProgramAddress([seedTxState, pubToken.toBuffer()]);
  }

  public async getAssociatedTokenAddress(
    pubToken: web3.PublicKey,
  ): Promise<web3.PublicKey> {
    return Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      pubToken,
      await this.getSettingsAddress(),
      ALLOW_OWNER_OFF_CURVE,
    );
  }

  public async getSyntMintAddress(
    realToken: UInt160,
  ): Promise<web3.PublicKey> {
    return this.getProgramAddress([seedMint, realToken]);
  }

  public async findSyntMintAddress(
    realToken: UInt160,
  ): Promise<[web3.PublicKey, number]> {
    return this.findProgramAddress([seedMint, realToken]);
  }

  public async getSyntDataAddress(
    realToken: UInt160,
  ): Promise<web3.PublicKey> {
    return this.getProgramAddress([seedData, realToken]);
  }

  public async findSyntDataAddress(
    realToken: UInt160,
  ): Promise<[web3.PublicKey, number]> {
    return this.findProgramAddress([seedData, realToken]);
  }

  public async fetchSettings(): Promise<NEywaPortalSynthesis.ISettingsAccount> {
    const pubSettings = await this.getSettingsAddress();
    // const settings = await this.program.account.settings.fetch(pubSettings);
    // return settings;
    return this.program.account.settings.fetch(pubSettings);
  }

  /*
  public async fetchSynthesizeRequestAccountInfo(
    pubToken: web3.PublicKey,
  ): Promise<web3.AccountInfo<Buffer>> {
    return this.connection.getAccountInfo(
      await this.getSynthesizeRequestAddress(pubToken)
    );
  }
  */

  public async fetchTxStateAccountInfo(
    pubToken: web3.PublicKey,
  ): Promise<web3.AccountInfo<Buffer>> {
    return this.connection.getAccountInfo(
      await this.getTxStateAddress(pubToken)
    );
  }

  /*
  public async fetchSynthesizeRequest(
    pubToken: web3.PublicKey,
  ): Promise<NEywaPortalSynthesis.ISynthesiseStateAccount> {
    const pubSynthesiseState = await this.getSynthesizeRequestAddress(pubToken);
    return this.program.account.synthesizeStateData.fetch(pubSynthesiseState);
  }
  */

  public async fetchTxState(
    pubToken: web3.PublicKey,
  ): Promise<NEywaPortalSynthesis.ISynthesiseStateAccount> {
    return this.program.account.txState.fetch(await this.getTxStateAddress(pubToken));
  }

/*
  public async fetchTxState(
    pubToken: web3.PublicKey,
  ): Promise<ITxStateAccount> {
    return this.program.account.txState.fetch(
      await this.getTxStateAddress(pubToken)
    ) as Promise<ITxStateAccount>;
  }
*/
  public async fetchSyntData(
    pubSyntData: web3.PublicKey,
  ): Promise<NEywaPortalSynthesis.IMintDataAccount> {
    const data = await this.program.account.mintData.fetch(pubSyntData);
    const tokenReal = Buffer.from(data.tokenReal) as any as number[];
    return { ...data, tokenReal };
  }

  public async fetchSyntDataByReal(
    realToken: UInt160,
  ): Promise<NEywaPortalSynthesis.IMintDataAccount> {
    return this.fetchSyntData(await this.getSyntDataAddress(realToken));
  }

  public async init(
    pubOwner: web3.PublicKey,
  ): Promise<web3.TransactionInstruction> {
    const [pdaSettings, bumpSettings] = await this.findSettingsAddress();

    return this.program.instruction.initialize(
      bumpSettings,
      { accounts: {
        settings: pdaSettings, // Buffer.from(''),
        // owner: this.owner.publicKey,
        owner: pubOwner, // this.pubBridgeSigner,
        bridge: this.bridge.pid,
        systemProgram: web3.SystemProgram.programId,
      }},
    );
  }

  public async setOwner(
    pubOwner: web3.PublicKey,
    pubNewOwner: web3.PublicKey,
  ): Promise<web3.TransactionInstruction> {
    const pubSettings = await this.getSettingsAddress();

    return this.program.instruction.setOwner({
      accounts: {
        settings: pubSettings,
        owner: pubOwner,
        newOwner: pubNewOwner,
      },
    });
  }

  public async createRepresentation(
    syntName: string,
    syntShortName: string,
    decimals: number,
    realToken: UInt160,
    owner: web3.PublicKey,
  ): Promise<web3.TransactionInstruction> {
    const pubSettings = await this.getSettingsAddress();

    const [pubMint, bumpMint] = await this.findSyntMintAddress(realToken);
    const [pubData, bumpData] = await this.findSyntDataAddress(realToken);

    return this.program.instruction.createRepresentation(
      bumpMint, // : u8,
      bumpData, // : u8,
      new BN(realToken, 16).toArray(), // u160
      decimals,
      syntName,
      syntShortName,
      { accounts: {
        settings: pubSettings,
        mintSynt: pubMint,
        mintData: pubData,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
        owner,
      }},
    );
  }

  // Portal
  public async createRepresentationRequest(
    // syntName: string,
    // syntShortName: string,
    // decimals: number,
    pubRealToken: web3.PublicKey,
    owner: web3.PublicKey,
  ): Promise<web3.TransactionInstruction> {
    const pubSettings = await this.getSettingsAddress();
    const pubAssociated = await this.getAssociatedTokenAddress(pubRealToken);

    return this.program.instruction.createRepresentationRequest(
      { accounts: {
        settings: pubSettings,
        realToken: pubRealToken,
        associated: pubAssociated,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
        owner,
      }},
    );
  }

  public async synthesize(
    amount: BN,
    chainToAddress: Uint8Array | Buffer, // [u8; 20],
    receiveSide: Uint8Array | Buffer, // [u8; 20],
    oppositeBridge: Uint8Array | Buffer, // [u8; 20],
    chainId: BN, // u64,
    pubToken: web3.PublicKey,
    // payer: web3.Signer,
    // accUser: web3.Keypair,
    pubUser: web3.PublicKey,
    pubSource: web3.PublicKey,
  ): Promise<web3.TransactionInstruction> {
    const pubSettings = await this.getSettingsAddress();
    // const [pubSynthesizeRequest, bumpSynthesizeRequest] = await this.findSynthesizeRequestAddress(pubToken);
    const [pubTxState, bumpTxState] = await this.findTxStateAddress(pubToken);

    return this.program.instruction.synthesize(
      bumpTxState,
      new BN(amount),
      chainToAddress as any as number[],
      receiveSide as any as number[],
      oppositeBridge as any as number[],
      new BN(chainId),
      { accounts: {
        settings: pubSettings,
        // synthesizeRequest: pubSynthesizeRequest,
        txState: pubTxState,
        realToken: pubToken,
        source: pubSource,
        destination: await this.getAssociatedTokenAddress(pubToken),
        client: pubUser,
        // pdaMaster: pubSettings, // pubPDAMaster,
        bridgeSettings: await this.bridge.getSettingsAddress(),
        bridgeProgram: this.bridge.pid,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      }}
    );
  }

  public async emergencyUnsynthesize(
    pubToken: web3.PublicKey,
    pubUser: web3.PublicKey,
    pubUserAssociatedTokenAddress: web3.PublicKey,
  ): Promise<web3.TransactionInstruction> {
    const pubSettings = await this.getSettingsAddress();
    const [pubTxState, bumpTxState] = await this.findTxStateAddress(pubToken);

    return this.program.instruction.emergencyUnsynthesize(
      bumpTxState,
      { accounts: {
        settings: pubSettings,
        txState: pubTxState,
        realToken: pubToken,
        client: pubUser,
        source: await this.getAssociatedTokenAddress(pubToken),
        destination: pubUserAssociatedTokenAddress,
        // bridgeSettings: await this.bridge.getSettingsAddress(),
        bridgeProgram: this.bridge.pid,
        // pdaMaster: pubSettings,
        tokenProgram: TOKEN_PROGRAM_ID,
      }},
    );
  }

  public async mintSyntheticToken(
    // bumpSeedMint, // : u8,
    // bumpSynthesizeState, // : u8,
    realToken: Uint8Array | Buffer,
    txId: Uint8Array | Buffer,
    pubUser: web3.PublicKey,
    // pubToken: web3.PublicKey,
    // pubUser: web3.PublicKey,
    // pubUserAssociatedTokenAddress: web3.PublicKey,
  ): Promise<web3.TransactionInstruction> {
    // const pubSettings = await this.getSettingsAddress();
    // const [pubTxState, bumpTxState] =
    //   await this.findTxStateAddress(pubToken);
    const [
      pubSynthesizeState,
      bumpSynthesizeState,
    ] = await this.findProgramAddress([
      Buffer.from('eywa-synthesize-state', 'utf-8'),
      realToken,
    ]);

    const pubMint = await this.getProgramAddress([
      Buffer.from('mint-synt', 'utf-8'),
      realToken,
    ]);
    // logger.logPublicKey('pubkeyMint', pubkeyMint);

    const pubData = await this.getProgramAddress([
      Buffer.from('mint-data', 'utf-8'),
      // Buffer.from(realToken, 'hex'),
      realToken,
    ]);

    const walUser = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      pubMint,
      pubUser,
    );

    return this.program.instruction.mintSyntheticToken(
      txId as any as number[],
      bumpSynthesizeState, // : u8,
      // bumpSeedData, // : u8,
      // new BN(realToken, 16).toArray(), // U160
      // new BN(txId, 16).toArray(), // H256
      new BN(3), // amount
      // 'Some Synt Name', // synt name
      // 'SSN', // synt short name
      { accounts: {
        settings: await this.getSettingsAddress(),
        synthesizeState: pubSynthesizeState,
        to: walUser, // accTo.publicKey,
        mintSynt: pubMint,
        mintData: pubData,
        // thisProgram: this.program.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
        bridge: this.bridge.pid, // accAdmin.publicKey,
        // bridgeSigner: accAdmin.publicKey,
      }},
    );
  }
}
