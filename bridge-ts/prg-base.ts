import { Idl, Program, Provider, web3 } from "@project-serum/anchor";

import StubWallet from "./stub-wallet";

export abstract class Base {
  protected program: Program;

  constructor(
    protected connection: web3.Connection,
    programId: web3.PublicKey,
    idl: Idl
    // provider: Provider,
  ) {
    const pidBridge = new web3.PublicKey(programId);
    const provider = new Provider(
      this.connection,
      StubWallet.instance,
      Provider.defaultOptions()
    );
    this.program = new Program(idl, pidBridge, provider);
    // this.logger.logPublicKey('pidBridge', pidBridge);
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
