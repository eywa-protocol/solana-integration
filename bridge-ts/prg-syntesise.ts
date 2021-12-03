import {
  Token,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { BN, Idl, web3 } from "@project-serum/anchor";

import { Bridge } from "./prg-bridge";
// import { Logger } from '../utils-ts';
import { Base } from "./prg-base";

import type {
  IMintDataAccount,
  IPortalSyntesizeSettingsAccount,
  ISynthesizeRequest,
  ITxStateAccount,
} from "./interfaces";
import type { UInt160 } from "./interfaces/types";


const ALLOW_OWNER_OFF_CURVE = true;

const seedMint = Buffer.from("mint-synt", "utf-8");
const seedData = Buffer.from("mint-data", "utf-8");
const seedPDA = Buffer.from("eywa-pda", "utf-8");
const seedTxState = Buffer.from("eywa-tx-state", "utf-8");
const seedSyntReq = Buffer.from("eywa-synthesize-state", "utf-8");


export class Syntesise extends Base {
  // private logger = new Logger();
  private accGuest = web3.Keypair.generate();

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

  public async fetchSettings(): Promise<IPortalSyntesizeSettingsAccount> {
    const pubSettings = await this.getSettingsAddress();
    const settings = await this.program.account.settings.fetch(pubSettings);
    return settings as IPortalSyntesizeSettingsAccount;
  }

  public async fetchSynthesizeRequestAccountInfo(
    pubToken: web3.PublicKey,
  ): Promise<web3.AccountInfo<Buffer>> {
    return this.connection.getAccountInfo(
      await this.getSynthesizeRequestAddress(pubToken)
    );
  }

  public async fetchSynthesizeRequest(
    pubToken: web3.PublicKey,
  ): Promise<ISynthesizeRequest> {
    return this.program.account.synthesizeRequest.fetch(
      await this.getSynthesizeRequestAddress(pubToken)
    ) as Promise<ISynthesizeRequest>;
  }

  public async fetchTxState(
    pubToken: web3.PublicKey,
  ): Promise<ITxStateAccount> {
    return this.program.account.txState.fetch(
      await this.getTxStateAddress(pubToken)
    ) as Promise<ITxStateAccount>;
  }

  public async fetchSyntData(
    pubSyntData: web3.PublicKey,
  ): Promise<IMintDataAccount> {
    const data = await this.program.account.mintData.fetch(pubSyntData);
    const { tokenReal } = data as { tokenReal: Uint8Array };
    return {
      ...data,
      tokenReal: Buffer.from(tokenReal),
    } as IMintDataAccount;
  }

  public async fetchSyntDataByReal(
    realToken: UInt160,
  ): Promise<IMintDataAccount> {
    return this.fetchSyntData(await this.getSyntDataAddress(realToken));
  }

  public async init(
    pubPayer: web3.PublicKey,
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

  public async setOwner(
    pubOwner: web3.PublicKey
  ): Promise<web3.TransactionInstruction> {
    const [pdaSettings, bumpSettings] = await this.findSettingsAddress();

    const ixSetOwner = this.program.instruction
    .setOwner({
      accounts: {
        settings: pdaSettings, // Buffer.from(''),
        // owner: this.owner.publicKey,
        owner: pubOwner, // this.pubBridgeSigner,
        newOwner: pubOwner,
        // systemProgram: web3.SystemProgram.programId,
      },
    });

    return ixSetOwner;
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
    pubSource: web3.PublicKey,
  ): Promise<web3.TransactionInstruction> {
    const pubSettings = await this.getSettingsAddress();
    // const [pubSynthesizeRequest, bumpSynthesizeRequest] =
    const [pubTxState, bumpTxState] =
      await this.findTxStateAddress(pubToken);

    const accounts = {
      settings: pubSettings,
      // synthesizeRequest: pubSynthesizeRequest,
      txState: pubTxState,
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
      bumpTxState,
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
    pubUserAssociatedTokenAddress: web3.PublicKey,
  ): Promise<web3.TransactionInstruction> {
    const pubSettings = await this.getSettingsAddress();
    const [pubTxState, bumpTxState] =
      await this.findTxStateAddress(pubToken);

    const accounts = {
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
    };

    const ixEmergencyUnsynthesize =
      await this.program.instruction.emergencyUnsynthesize(
        bumpTxState,
        { accounts }
      );
    return ixEmergencyUnsynthesize;
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
    ] = await web3.PublicKey.findProgramAddress([
      Buffer.from('eywa-synthesize-state', 'utf-8'),
      // Buffer.from(realToken, 'hex'),
      realToken,
    ], this.program.programId);

    const [pubkeyMint, bumpSeedMint] = await web3.PublicKey.findProgramAddress([
      // Buffer.from(anchor.utils.bytes.utf8.encode("mint-synt")),
      Buffer.from('mint-synt', 'utf-8'),
      // Buffer.from(realToken, 'hex'),
      realToken,
    ], this.program.programId);
    // logger.logPublicKey('pubkeyMint', pubkeyMint);

    const [pubkeyData, bumpSeedData] = await web3.PublicKey.findProgramAddress([
      Buffer.from('mint-data', 'utf-8'),
      // Buffer.from(realToken, 'hex'),
      realToken,
    ], this.program.programId);
    // logger.logPublicKey('pubkeyData', pubkeyData);

    // const token = new Token(
    //   this.connection,
    //   pubkeyMint,
    //   TOKEN_PROGRAM_ID,
    //   this.accGuest,
    // );
    // token.getOrCreateAssociatedAccountInfo
    const walUser = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      pubkeyMint,
      pubUser,
    );
    // return Token.getAssociatedTokenAddress(
    //   ASSOCIATED_TOKEN_PROGRAM_ID,
    //   TOKEN_PROGRAM_ID,
    //   pubToken,
    //   await this.getSettingsAddress(),
    //   ALLOW_OWNER_OFF_CURVE,
    // );

    // const accounts = {
    //   settings: pubSettings,
    //   txState: pubTxState,
    //   realToken: pubToken,
    //   client: pubUser,
    //   source: await this.getAssociatedTokenAddress(pubToken),
    //   destination: pubUserAssociatedTokenAddress,
    //   // bridgeSettings: await this.bridge.getSettingsAddress(),
    //   bridgeProgram: this.bridge.pid,
    //   // pdaMaster: pubSettings,
    //   tokenProgram: TOKEN_PROGRAM_ID,
    // };

    // const ixEmergencyUnsynthesize =
    //   await this.program.instruction.emergencyUnsynthesize(
    //     bumpTxState,
    //     { accounts }
    //   );
    const ixMintSyntheticToken = await this.program.instruction
    .mintSyntheticToken(
      txId,
      bumpSynthesizeState, // : u8,
      // bumpSeedData, // : u8,
      // new BN(realToken, 16).toArray(), // U160
      // new BN(txId, 16).toArray(), // H256
      new BN(3), // amount
      // 'Some Synt Name', // synt name
      // 'SSN', // synt short name
    {
      accounts: {
        settings: await this.getSettingsAddress(),
        synthesizeState: pubSynthesizeState,
        to: walUser, // accTo.publicKey,
        mintSynt: pubkeyMint,
        mintData: pubkeyData,
        // thisProgram: this.program.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
        bridge: this.bridge.pid, // accAdmin.publicKey,
        // bridgeSigner: accAdmin.publicKey,
      },
    });

    return ixMintSyntheticToken;
  }
}
