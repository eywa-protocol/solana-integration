// import {
//   PublicKey,
//   TransactionInstruction,
// } from "@solana/web3.js";
import { Idl, Program, Provider, web3 } from "@project-serum/anchor";

import StubWallet from "./stub-wallet";

import { Base } from "./prg-base";

export class TestStub extends Base {
  public async hello(
    name: string,
    person: web3.PublicKey
  ): Promise<web3.TransactionInstruction> {
    return this.program.instruction.hello(name, {
      accounts: {
        person,
      },
    });
  }

  public async helloSigned(
    name: string,
    person: web3.PublicKey
  ): Promise<web3.TransactionInstruction> {
    return this.program.instruction.helloSigned(name, {
      accounts: {
        person,
      },
    });
  }
}
