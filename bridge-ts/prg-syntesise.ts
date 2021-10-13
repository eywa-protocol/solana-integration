import {
  Token,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { BN, Idl, web3 } from "@project-serum/anchor";
// import StubWallet from "./stub-wallet";

import { Bridge } from "./prg-bridge";
// import { Logger } from '../utils-ts';

import { Base } from "./prg-base";

// type UInt256 = Buffer;
type UInt160 = Buffer;
type HexUInt160 = string;

export interface ISyntesiseSettings {
  owner: web3.PublicKey;
  syntTokens: web3.PublicKey[];
}

export interface ISynthesizeRequest {
  //
}

export interface ISynthesizeRequestEvent {
  //
}

export interface IMintData {
  tokenReal: HexUInt160, // [u8; 20],
  tokenSynt: web3.PublicKey,
  name: String,
  symbol: String,
}

const allowOwnerOffCurve = true;

const seedMint = Buffer.from("mint-synt", "utf-8");
const seedData = Buffer.from("mint-data", "utf-8");
const seedPDA = Buffer.from("eywa-pda", "utf-8");
const seedSyntReq = Buffer.from("synthesize-request", "utf-8");

export class Syntesise extends Base {
  // private logger = new Logger();

  constructor(
    connection: web3.Connection,
    programId: web3.PublicKey,
    idl: Idl,
    // provider: Provider,
    // private owner: Keypair,
    private bridge: Bridge
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
    pubToken: web3.PublicKey
    // ???
  ): Promise<[web3.PublicKey, number]> {
    return this.findProgramAddress([seedSyntReq, pubToken.toBuffer()]);
  }

  public async getSynthesizeRequestAddress(
    pubToken: web3.PublicKey
    // ???
  ): Promise<web3.PublicKey> {
    return this.getProgramAddress([seedSyntReq, pubToken.toBuffer()]);
  }

  public async getAssociatedTokenAddress(
    pubToken: web3.PublicKey
  ): Promise<web3.PublicKey> {
    return Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      pubToken,
      await this.getSettingsAddress(),
      allowOwnerOffCurve
    );
  }

  public async getSyntMintAddress(
    realToken: HexUInt160
  ): Promise<web3.PublicKey> {
    const bufRealToken: UInt160 = Buffer.from(realToken, "hex");
    return this.getProgramAddress([seedMint, bufRealToken]);
  }

  public async findSyntMintAddress(
    realToken: HexUInt160
  ): Promise<[web3.PublicKey, number]> {
    const bufRealToken: UInt160 = Buffer.from(realToken, "hex");
    return this.findProgramAddress([seedMint, bufRealToken]);
  }

  public async getSyntDataAddress(
    realToken: HexUInt160
  ): Promise<web3.PublicKey> {
    const bufRealToken: UInt160 = Buffer.from(realToken, "hex");
    return this.getProgramAddress([seedData, bufRealToken]);
  }

  public async findSyntDataAddress(
    realToken: HexUInt160
  ): Promise<[web3.PublicKey, number]> {
    const bufRealToken: UInt160 = Buffer.from(realToken, "hex");
    return this.findProgramAddress([seedData, bufRealToken]);
  }

  public async fetchSettings(): Promise<ISyntesiseSettings> {
    const [pubSettings, bump] = await this.findSettingsAddress();
    const settings = await this.program.account.settings.fetch(pubSettings);
    return settings as ISyntesiseSettings;
  }

  public async fetchSynthesizeRequestAccountInfo(
    pubToken: web3.PublicKey
  ): Promise<web3.AccountInfo<Buffer>> {
    return this.connection.getAccountInfo(
      await this.getSynthesizeRequestAddress(pubToken)
    );
  }

  public async fetchSynthesizeRequest(
    pubToken: web3.PublicKey
  ): Promise<ISynthesizeRequest> {
    return this.program.account.synthesizeRequestInfo.fetch(
      await this.getSynthesizeRequestAddress(pubToken)
    );
  }

  public async fetchSyntData(
    pubSyntData: web3.PublicKey,
  ): Promise<IMintData> {
    const data = await this.program.account.mintData.fetch(pubSyntData);
    const { tokenReal } = data as { tokenReal: Uint8Array };
    return {
      ...data,
      tokenReal: Buffer.from(tokenReal).toString('hex'),
    } as IMintData;
  }

  public async fetchSyntDataByReal(realToken: HexUInt160): Promise<IMintData> {
    return this.fetchSyntData(
      await this.getSyntDataAddress(realToken),
    );
  }

  public async init(
    pubPayer: web3.PublicKey
  ): Promise<web3.TransactionInstruction> {
    const [pdaSettings, bumpSettings] = await this.findSettingsAddress();

    const ixInit = this.program.instruction.initialize(bumpSettings, {
      accounts: {
        settings: pdaSettings, // Buffer.from(''),
        // owner: this.owner.publicKey,
        owner: pubPayer, // this.pubBridgeSigner,
        bridge: this.bridge.pid,
        systemProgram: web3.SystemProgram.programId,
      },
      // signers: [this.owner],
    });
    // this.logger.logIx('ixInit Syntesise State', ixInit);
    // // fix payer
    // const payer: AccountMeta = {
    //   pubkey: pubPayer,
    //   isWritable: false,
    //   isSigner: true,
    // }
    // ixInit.keys[0] = payer;

    return ixInit;
  }

  public async createRepresentation(
    syntName: string,
    syntShortName: string,
    decimals: number,
    realToken: HexUInt160,
    owner: web3.PublicKey
  ): Promise<web3.TransactionInstruction> {
    const pubSettings = await this.getSettingsAddress();

    const [pubMint, bumpMint] = await this.findSyntMintAddress(realToken);
    const [pubData, bumpData] = await this.findSyntDataAddress(realToken);

    const ixCreateRepresentation =
      await this.program.instruction.createRepresentation(
        bumpMint, // : u8,
        bumpData, // : u8,
        new BN(realToken, 16).toArray(), // u160
        decimals,
        syntName,
        syntShortName,
        {
          accounts: {
            settings: pubSettings,
            mintSynt: pubMint,
            mintData: pubData,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: web3.SystemProgram.programId,
            rent: web3.SYSVAR_RENT_PUBKEY,
            owner,
          },
        }
      );

    return ixCreateRepresentation;
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

    const accounts = {
      settings: pubSettings,
      realToken: pubRealToken,
      associated: pubAssociated,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: web3.SystemProgram.programId,
      rent: web3.SYSVAR_RENT_PUBKEY,
      owner,
    };

    const ixCreateRepresentationRequest = await this.program.instruction
    .createRepresentationRequest({ accounts });

    return ixCreateRepresentationRequest;
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
    pubSource: web3.PublicKey
  ): Promise<web3.TransactionInstruction> {
    const pubSettings = await this.getSettingsAddress();
    const [pubSynthesizeRequest, bumpSynthesizeRequest] =
      await this.findSynthesizeRequestAddress(pubToken);

    const accounts = {
      settings: pubSettings,
      synthesizeRequest: pubSynthesizeRequest,
      realToken: pubToken,
      source: pubSource,
      destination: await this.getAssociatedTokenAddress(pubToken),
      client: pubUser,
      pdaMaster: pubSettings, // pubPDAMaster,
      bridgeSettings: await this.bridge.getSettingsAddress(),
      bridgeProgram: this.bridge.pid,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: web3.SystemProgram.programId,
      rent: web3.SYSVAR_RENT_PUBKEY,
    };

    const ixSynthesize = await this.program.instruction.synthesize(
      bumpSynthesizeRequest,
      new BN(amount),
      chainToAddress,
      receiveSide,
      oppositeBridge,
      new BN(chainId),
      { accounts }
    );
    return ixSynthesize;
  }

  public async emergencyUnsynthesize(
    pubToken: web3.PublicKey,
    pubUser: web3.PublicKey,
    pubUserAssociatedTokenAddress: web3.PublicKey
  ): Promise<web3.TransactionInstruction> {
    const pubSettings = await this.getSettingsAddress();
    const [pubSynthesizeRequest, bumpSynthesizeRequest] =
      await this.findSynthesizeRequestAddress(pubToken);

    const accounts = {
      settings: pubSettings,
      synthesizeRequest: pubSynthesizeRequest,
      realToken: pubToken,
      client: pubUser,
      source: await this.getAssociatedTokenAddress(pubToken),
      destination: pubUserAssociatedTokenAddress,
      bridgeSettings: await this.bridge.getSettingsAddress(),
      bridgeProgram: this.bridge.pid,
      pdaMaster: pubSettings,
      tokenProgram: TOKEN_PROGRAM_ID,
    };

    const ixEmergencyUnsynthesize =
      await this.program.instruction.emergencyUnsynthesize(
        bumpSynthesizeRequest,
        { accounts }
      );
    return ixEmergencyUnsynthesize;
  }
}
