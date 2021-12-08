import { web3 } from "@project-serum/anchor";

import { PrgBase } from "./prg-base";
import { TestStub } from '../target/types/test_stub';


export type IdlTestStub = TestStub;

export class PrgTestStub extends PrgBase<IdlTestStub> {
  public async hello(
    name: string,
    person: web3.PublicKey
  ): Promise<web3.TransactionInstruction> {
    return this.program.instruction.hello(
      name,
      { accounts: {
        person,
      }},
    );
  }

  public async helloSigned(
    name: string,
    person: web3.PublicKey
  ): Promise<web3.TransactionInstruction> {
    return this.program.instruction.helloSigned(
      name,
      { accounts: {
        person,
      }},
    );
  }
}
