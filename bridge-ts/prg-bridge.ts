import {
  BN,
  // Context,
  // Program,
  web3,
} from '@project-serum/anchor';
import { TypeDef, IdlTypes } from "@project-serum/anchor/dist/cjs/program/namespace/types";

import { PrgBase } from './prg-base';

import type {
  StandaloneInstruction,
  // UInt256,
  UInt160,
} from './types';

import { EywaBridge } from '../target/types/eywa_bridge';

export type IdlBridge = EywaBridge;

namespace NsBridge {
  type Accounts = IdlBridge["accounts"];
  type SettingsAccount = Accounts[0];
  type ContractSendBindAccount = Accounts[1];
  type ContractReceiveBindAccount = Accounts[2];
  export type ISettingsAccount = TypeDef<SettingsAccount, IdlTypes<IdlBridge>>;
  export type IContractReceiveBindAccount = TypeDef<ContractReceiveBindAccount, IdlTypes<IdlBridge>>;
  export type IContractSendBindAccount = TypeDef<ContractSendBindAccount, IdlTypes<IdlBridge>>;
}

const seedPDA = Buffer.from('eywa-pda', 'utf-8');
const seedReceiveRequest = Buffer.from('receive-request', 'utf-8');
const seedContractReceiveBind = Buffer.from('eywa-receive-bind', 'utf-8');
const seedContractSendBind = Buffer.from('eywa-send-bind', 'utf-8');


export class PrgBridge extends PrgBase<EywaBridge> {
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

  public async findContractSendBindAddress(
    bridge: UInt160,
    contract: UInt160,
  ): Promise<[web3.PublicKey, number]> {
    return this.findProgramAddress([ seedContractSendBind, contract, bridge ]);
  }

  public async getContractSendBindAddress(
    bridge: UInt160,
    contract: UInt160,
  ): Promise<web3.PublicKey> {
    return this.getProgramAddress([ seedContractSendBind, contract, bridge ]);
  }

  public async findReceiveRequestAddress(): Promise<[web3.PublicKey, number]> {
    return this.findProgramAddress([seedReceiveRequest]);
  }

  public async getReceiveRequestAddress(): Promise<web3.PublicKey> {
    return this.getProgramAddress([seedReceiveRequest]);
  }

  /*
  test_emitOracleRequest(oracleRequest: IOracleRequestEvent) {
    throw new Error('Method not implemented.');
  }
  */

  public async fetchSettings(): Promise<NsBridge.ISettingsAccount> {
    const pubSettings = await this.getSettingsAddress();
    return await this.program.account.settings.fetch(pubSettings);
  }

  public async fetchContractReceiveBind(
    bridge: UInt160,
    contract: UInt160,
  ): Promise<NsBridge.IContractReceiveBindAccount> {
    const pubBind = await this.getContractReceiveBindAddress(bridge, contract);
    return this.program.account.contractReceiveBind.fetch(pubBind) as any as NsBridge.IContractReceiveBindAccount; // ???
  }

  public async fetchContractSendBind(
    bridge: UInt160,
    contract: UInt160,
  ): Promise<NsBridge.IContractSendBindAccount> {
    const pubBind = await this.getContractSendBindAddress(bridge, contract);
    return await this.program.account.contractSendBind.fetch(pubBind) as any as NsBridge.IContractSendBindAccount; // ???
  }

  public async init(
    pubOwner: web3.PublicKey,
  ): Promise<web3.TransactionInstruction> {
    const [pubSettings, bumpSettings] = await this.findSettingsAddress();

    return this.program.instruction.initialize(
      bumpSettings,
      { accounts: {
        settings: pubSettings,
        owner: pubOwner,
        systemProgram: web3.SystemProgram.programId,
      }},
    );
  }

  public async addContractReceiveBind(
    addrBridgeFrom: UInt160,
    addrContractFrom: UInt160,
    pubAdmin: web3.PublicKey,
  ): Promise<web3.TransactionInstruction> {
    const pubSettings = await this.getSettingsAddress();
    const [
      pubContractReceiveBind,
      bumpContractReceiveBind,
    ] = await this.findContractReceiveBindAddress(
      addrBridgeFrom,
      addrContractFrom,
    );

    return this.program.instruction.addContractReceiveBind(
      bumpContractReceiveBind as any as number[],
      addrBridgeFrom as any as number[],
      addrContractFrom as any as number[],
      { accounts: {
        settings: pubSettings,
        contractBind: pubContractReceiveBind,
        owner: pubAdmin,
        systemProgram: web3.SystemProgram.programId,
      },
    });
  }

  public async receiveRequest(
    requestId: web3.PublicKey,
    addrBridgeFrom: UInt160,
    addrContractFrom: UInt160,
    sinst: StandaloneInstruction,
    proposer: web3.PublicKey,
  ): Promise<web3.TransactionInstruction> {
    const pubSettings = await this.getSettingsAddress();
    const pubContractReceiveBind = await this.getContractReceiveBindAddress(
      addrBridgeFrom,
      addrContractFrom,
    );
    const pubSigner = await this.getReceiveRequestAddress();

    return this.program.instruction.receiveRequest(
      addrBridgeFrom as any as number[],
      sinst,
      {
        accounts: {
          settings: pubSettings,
          requestId,
          proposer,
          contractBind: pubContractReceiveBind,
        },
        remainingAccounts: [
          { pubkey: sinst.programId, isWritable: false, isSigner: false },
          { pubkey: pubSigner, isWritable: false, isSigner: false },
          ...(sinst.accounts.map((value) => ({
            ...value,
            isSigner: value.pubkey.equals(pubSigner) ? false : value.isSigner,
          })) as web3.AccountMeta[] ),
        ],
      },
    );
  }

  public async testOracleRequest(
    requestId: web3.PublicKey,
    selector: Buffer,
    receiveSide: UInt160,
    oppositeBridge: UInt160,
    chainId: BN,
    pubSigner: web3.PublicKey,
  ): Promise<web3.TransactionInstruction> {

    return this.program.instruction.testOracleRequest(
      // addrBridgeFrom as any as number[],
      requestId, // : Pubkey,
      selector, // : Vec<u8>,
      receiveSide, // : [u8; 20],
      oppositeBridge, // : [u8; 20],
      chainId, // : u64,
    { accounts: {
      signer: pubSigner,
    }});
  }
}
