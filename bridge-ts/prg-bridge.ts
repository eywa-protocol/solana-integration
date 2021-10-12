import {
  // Idl,
  // Program,
  // Provider,
  // EventManager,
  web3,
  // Wallet,
} from '@project-serum/anchor';
import { IOracleRequestEvent } from './interfaces';

// import { Logger } from '../utils-ts';

import { Base } from './prg-base';

type UInt256 = Buffer;
type UInt160 = Buffer;

export interface TransactionAccount {
  pubkey: web3.PublicKey;
  isSigner: Boolean;
  isWritable: Boolean;
}

export interface StandaloneInstruction {
  programId: web3.PublicKey;
  accounts: TransactionAccount[];
  data: Buffer;
}

export interface IBridgeSettings {
}

const seedPDA = Buffer.from('eywa-pda', 'utf-8');
const seedReceiveRequest = Buffer.from('receive-request', 'utf-8');


export class Bridge extends Base {
  // private logger = new Logger();

  public async findSettingsAddress(): Promise<[web3.PublicKey, number]> {
    return this.findProgramAddress([seedPDA]);
  }

  public async getSettingsAddress(): Promise<web3.PublicKey> {
    return this.getProgramAddress([seedPDA]);
  }

  public async findReceiveRequestAddress(): Promise<[web3.PublicKey, number]> {
    return this.findProgramAddress([seedReceiveRequest]);
  }

  public async getReceiveRequestAddress(): Promise<web3.PublicKey> {
    return this.getProgramAddress([seedReceiveRequest]);
  }

  test_emitOracleRequest(oracleRequest: IOracleRequestEvent) {
    throw new Error('Method not implemented.');
  }

  public async fetchSettings(): Promise<IBridgeSettings> {
    const [pubSettings, bump] = await this.findSettingsAddress();
    const settings = await this.program.account.settings.fetch(pubSettings);
    return settings;
  }

  public async init(owner: web3.Keypair): Promise<web3.TransactionInstruction> {
    const [pdaSettings, bumpSettings] = await this.findSettingsAddress();
    // this.logger.logPublicKey('pdaSettings', pdaSettings);

    const ixInit = this.program.instruction
    .initialize(bumpSettings, {
      accounts: {
        settings: pdaSettings,
        owner: owner.publicKey,
        systemProgram: web3.SystemProgram.programId,
      },
      signers: [owner],
    });

    // // fix payer
    // ixInit.keys[0] = ixInit.keys[ixInit.keys.length - 1];
    // delete ixInit.keys[ixInit.keys.length - 1];
    return ixInit;
  }

  public async receiveRequest(
    idReq: UInt256,
    addrBridgeFrom: UInt160,
    sinst: StandaloneInstruction,
    proposer: web3.PublicKey,
  ): Promise<web3.TransactionInstruction> {
    // const [pubSigner, bumpSigner] = await web3.PublicKey.findProgramAddress(
    //   [seedReceiveRequest],
    //   this.program.programId,
    // );
    // this.logger.logPublicKey('pubSigner', pubSigner);
    // this.logger.log('bumpSigner:', bumpSigner);

    const pubSigner = await this.getReceiveRequestAddress();

    const ixReceiveRequest = await this.program.instruction
    .receiveRequest(
      idReq,
      sinst,
      addrBridgeFrom,
      {
        accounts: { proposer },
        remainingAccounts: [
          { pubkey: sinst.programId, isWritable: false, isSigner: false },
          { pubkey: pubSigner, isWritable: false, isSigner: false },
          ...sinst.accounts.map((value) => ({
            ...value,
            isSigner: value.pubkey.equals(pubSigner) ? false : value.isSigner,
          })),
        ],
      }
    );

    return ixReceiveRequest as web3.TransactionInstruction;
  }
}
