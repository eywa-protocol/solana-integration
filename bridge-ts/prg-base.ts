import { Idl, Program, Provider, web3 } from "@project-serum/anchor";

import StubWallet from "./stub-wallet";

export abstract class PrgBase<T extends Idl> {
  protected program: Program<T>;

  constructor(
    protected connection: web3.Connection,
    programId: web3.PublicKey,
    idl: T, // Idl
    // provider: Provider,
  ) {
    const pidBridge = new web3.PublicKey(programId);
    const provider = new Provider(
      this.connection,
      StubWallet.instance,
      Provider.defaultOptions()
    );
    this.program = new Program<T>(idl, pidBridge, provider);
    // this.logger.logPublicKey('pidBridge', pidBridge);
  }

  public get pid() {
    return this.program.programId;
  }

  public addEventListener(
    eventName: string,
    callback: (event: any, slot: number) => void
  ): number {
    return this.program.addEventListener(eventName, callback);
  }

  public async removeEventListener(listener: number): Promise<void> {
    return this.program.removeEventListener(listener);
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
}
