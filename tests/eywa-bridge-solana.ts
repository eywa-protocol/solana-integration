import assert from 'assert';
import { expect } from 'chai';
import * as anchor from '@project-serum/anchor';
import {
  BN,
  Provider,
  setProvider,
  web3,
  workspace,
} from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';


const sleep = async (sec: number) =>
  new Promise((resolve) => setTimeout(resolve, sec * 1000));


describe('eywa-bridge-solana', () => {
  const provider = Provider.env();
  setProvider(provider);

  let accAdmin: web3.Keypair;
  let accData: web3.Keypair;

  before(async () => {
    accAdmin = web3.Keypair.generate();
    const program = workspace.EywaBridgeSolana;
  });

  it('Simple transfer', async () => {
    const params: web3.TransferParams = {
      fromPubkey: provider.wallet.publicKey,
      toPubkey: accAdmin.publicKey,
      // @ts-ignore
      lamports: new BN('100000000000000000'),
    };
    const tx = new web3.Transaction();
    tx.add(web3.SystemProgram.transfer(params));
    await provider.send(tx);
  });

  it('Is initialized!!!', async () => {
    const program = workspace.EywaBridgeSolana;
    accData = web3.Keypair.generate();

    const tx1 = new web3.Transaction();
    const space = 8 + 32 + 8;
    const params: web3.CreateAccountParams = {
      fromPubkey: accAdmin.publicKey,
      newAccountPubkey: accData.publicKey,
      space,
      lamports: await provider.connection.getMinimumBalanceForRentExemption(space),
      programId: program.programId,
    };
    tx1.add(web3.SystemProgram.createAccount(params));
    await provider.send(tx1, [accAdmin, accData]);
    await sleep(1);

    const tx = await program.rpc.initialize(accAdmin.publicKey, new BN(1234), {
      accounts: {
        data: accData.publicKey,
        rent: web3.SYSVAR_RENT_PUBKEY,
      },
    });

    const account = await program.account.dataAccount.fetch(accData.publicKey);

    expect(account.admin.toString()).eq(accAdmin.publicKey.toString());
    assert.ok(account.data.eq(new BN(1234)));
  });

  it("Updates a previously created account", async () => {
    const program = workspace.EywaBridgeSolana;

    await program.rpc.update(new BN(4321), {
      accounts: {
        data: accData.publicKey,
        admin: accAdmin.publicKey,
      },
      signers: [accAdmin]
    });

    const account = await program.account.dataAccount.fetch(accData.publicKey);

    assert.ok(account.data.eq(new BN(4321)));
  });

  it("Error on updates with 1234", async () => {
    const program = workspace.EywaBridgeSolana;

    try {
      await program.rpc.update(new BN(1234), {
        accounts: {
          data: accData.publicKey,
          admin: accAdmin.publicKey,
        },
        signers: [accAdmin]
      });
      assert.ok(false);
    } catch (err) {
      const code = err.code - 300;
      expect(code).eq(1234);
      const errMsg = "This is an error message clients will automatically display 1234";
      assert.equal(err.toString(), errMsg);
    }
  });

  it("Init program settings", async () => {
    const program = workspace.EywaBridgeSolana;

    await program.state.rpc.new({
      accounts: {
        owner: accAdmin.publicKey,
      },
      signers: [accAdmin]
    });

    const state = await program.state.fetch();
    const owner = state.owner.toBase58();
    const param = state.param.toString();

    expect(param).eq('100');
    expect(owner).eq(accAdmin.publicKey.toBase58());
  });

  it("Increments program settings.param", async () => {
    const program = workspace.EywaBridgeSolana;

    await program.state.rpc.increment({
      accounts: {
        owner: accAdmin.publicKey,
      },
      signers: [accAdmin]
    });

    const state = await program.state.fetch();
    const owner = state.owner.toBase58();
    const param = state.param.toString();

    expect(param).eq('101');
    expect(owner).eq(accAdmin.publicKey.toBase58());
  });

  const mint = anchor.web3.Keypair.generate();

  it("Sets up the test", async () => {
    const program = workspace.EywaBridgeSolana;

    await program.rpc.createMint({
      accounts: {
        mint: mint.publicKey,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      instructions: [await program.account.mint.createInstruction(mint)],
      signers: [mint],
    });
  });

  it("Creates an associated token account", async () => {
    const program = workspace.EywaBridgeSolana;

    const authority = program.provider.wallet.publicKey;
    const associatedToken = await program.account.token.associatedAddress(
      authority,
      mint.publicKey
    );

    await program.rpc.createToken({
      accounts: {
        token: associatedToken,
        authority,
        mint: mint.publicKey,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
    });

    const account = await program.account.token.associated(
      authority,
      mint.publicKey
    );

    assert.ok(account.amount === 0);
    assert.ok(account.authority.equals(authority));
    assert.ok(account.mint.equals(mint.publicKey));
  });

  it("Listen event on update", async () => {
    const program = workspace.EywaBridgeSolana;

    let listener = null;

    let [event, slot] = await new Promise((resolve, _reject) => {
      listener = program.addEventListener("MyEvent", (event, slot) => {
        resolve([event, slot]);
      });
      program.rpc.update(new BN(777), {
        accounts: {
          data: accData.publicKey,
          admin: accAdmin.publicKey,
        },
        signers: [accAdmin]
      });
    });
    await program.removeEventListener(listener);

    assert.ok(slot > 0);
    assert.ok(event.data.toNumber() === 777);
    assert.ok(event.label === "hello");
  });
});
