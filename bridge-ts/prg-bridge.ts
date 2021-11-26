import { Context, Program, web3 } from '@project-serum/anchor';

import { Base } from './prg-base';

import type {
  // UInt256,
  UInt160,
} from './interfaces/types';
import type {
  IOracleRequestEvent,
  StandaloneInstruction,
  IBridgeSettingsAccount,
} from './interfaces';

import { EywaBridge } from '../target/types/eywa_bridge';

const seedPDA = Buffer.from('eywa-pda', 'utf-8');
const seedReceiveRequest = Buffer.from('receive-request', 'utf-8');
const seedContractReceiveBind = Buffer.from('eywa-receive-bind', 'utf-8');


export class Bridge extends Base {
  // private logger = new Logger();

  public async findSettingsAddress(): Promise<[web3.PublicKey, number]> {
    return this.findProgramAddress([seedPDA]);
  }

  public async getSettingsAddress(): Promise<web3.PublicKey> {
    return this.getProgramAddress([seedPDA]);
  }

  public async findContractReceiveBindAddress(
    bridge: UInt160,
    contract: UInt160,
  ): Promise<[web3.PublicKey, number]> {
    return this.findProgramAddress([ seedContractReceiveBind, contract, bridge ]);
  }

  public async getContractReceiveBindAddress(
    bridge: UInt160,
    contract: UInt160,
  ): Promise<web3.PublicKey> {
    return this.getProgramAddress([ seedContractReceiveBind, contract, bridge ]);
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

  public async fetchSettings(): Promise<IBridgeSettingsAccount> {
    const [pubSettings, bump] = await this.findSettingsAddress();
    const settings = await this.program.account.settings.fetch(pubSettings);
    return settings as IBridgeSettingsAccount;
  }

  public async init(
    owner: web3.Keypair,
  ): Promise<web3.TransactionInstruction> {
    const [pdaSettings, bumpSettings] = await this.findSettingsAddress();
    // this.logger.logPublicKey('pdaSettings', pdaSettings);

    const p = this.program as Program<EywaBridge>;
    const ixInit = p.instruction
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

  public async addContractReceiveBind(
    addrBridgeFrom: UInt160,
    addrContractFrom: UInt160,
    pubAdmin: web3.PublicKey,
  ): Promise<web3.TransactionInstruction> {
    // const [pdaSettings, bumpSettings] = await this.findSettingsAddress();
    const pubSettings = await this.getSettingsAddress();
    // this.logger.logPublicKey('pdaSettings', pdaSettings);
    const [
      pubContractReceiveBind,
      bumpContractReceiveBind,
    ] = await this.findContractReceiveBindAddress(
      addrBridgeFrom,
      addrContractFrom,
    );

    const ixInit = this.program.instruction
    .addContractReceiveBind(bumpContractReceiveBind, addrBridgeFrom, addrContractFrom, {
      accounts: {
        settings: pubSettings,
        contractBind: pubContractReceiveBind,
        owner: pubAdmin,
        systemProgram: web3.SystemProgram.programId,
      },
      // signers: [owner],
    });

    // // fix payer
    // ixInit.keys[0] = ixInit.keys[ixInit.keys.length - 1];
    // delete ixInit.keys[ixInit.keys.length - 1];
    return ixInit;
  }

  public async receiveRequest(
    requestId: web3.PublicKey,
    addrBridgeFrom: UInt160,
    addrContractFrom: UInt160,
    sinst: StandaloneInstruction,
    proposer: web3.PublicKey,
  ): Promise<web3.TransactionInstruction> {
    // const [pubSigner, bumpSigner] = await web3.PublicKey.findProgramAddress(
    //   [seedReceiveRequest],
    //   this.program.programId,
    // );
    // this.logger.logPublicKey('pubSigner', pubSigner);
    // this.logger.log('bumpSigner:', bumpSigner);
    const pubContractReceiveBind = await this.getContractReceiveBindAddress(
      addrBridgeFrom,
      addrContractFrom,
    );

    const pubSigner = await this.getReceiveRequestAddress();

    const accounts = {
      settings: await this.getSettingsAddress(),
      requestId,
      proposer,
      contractBind: pubContractReceiveBind,
    };

    const remainingAccounts = [
      { pubkey: sinst.programId, isWritable: false, isSigner: false },
      { pubkey: pubSigner, isWritable: false, isSigner: false },
      ...(sinst.accounts.map((value) => ({
        ...value,
        isSigner: value.pubkey.equals(pubSigner) ? false : value.isSigner,
      })) as web3.AccountMeta[] ),
    ];

    // Array.prototype.slice.call(addrBridgeFrom, 0) as number[],

    const p = this.program as Program<EywaBridge>;
    // const ctx: Context = {
    //   accounts,
    //   remainingAccounts,
    // };
    const ixReceiveRequest = await p.instruction
    .receiveRequest(
      addrBridgeFrom as any as number[],
      sinst,
      {
        accounts,
        remainingAccounts,
      },
    );

    return ixReceiveRequest as web3.TransactionInstruction;
  }
}
