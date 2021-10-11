import { assert, expect } from 'chai';

import {
  BN,
  Provider,
  setProvider,
  web3,
} from '@project-serum/anchor';
import {
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

import BridgeFactory, { SolanaHelper } from '../bridge-ts';
import { Logger } from '../utils-ts';


const logger = new Logger();

describe('eywa-portal-solana', () => {
  const provider = Provider.env();
  setProvider(provider);

  const helper = new SolanaHelper(provider);
  const factory = new BridgeFactory(provider.connection);
  const { bridge, stub, main } = factory;

  const accAdmin = web3.Keypair.generate();
  const accMinter = web3.Keypair.generate();

  let token: Token;

  let signature: Promise<web3.TransactionSignature>;

  before(async () => {
    logger.logPublicKey('TOKEN_PROGRAM_ID', TOKEN_PROGRAM_ID);
    logger.logPublicKey('SYSVAR_RENT_PUBKEY', web3.SYSVAR_RENT_PUBKEY);
    logger.logPublicKey('SystemProgram', web3.SystemProgram.programId);
    logger.logPublicKey('Main PID', main.pid);

    await helper.transfer(new BN('10000000000000000'), accAdmin.publicKey);

    const tx = new web3.Transaction();
    tx.add(await bridge.init(accAdmin));
    tx.recentBlockhash = await helper.getRecentBlockhash();
    await (signature = helper.sendAndConfirmTransaction(
      'Initialize bridge',
      tx,
      accAdmin
    ));

    const accPayerHelper = web3.Keypair.generate();
    logger.logPublicKey('accPayerHelper', accPayerHelper.publicKey);
    await helper.transfer(
      new BN('10000000000000000'),
      accPayerHelper.publicKey
    );
    logger.log('sponsored');

    logger.logPublicKey('accMinter', accMinter.publicKey);

    token = await Token.createMint(
      provider.connection,
      accPayerHelper,
      accMinter.publicKey,
      accMinter.publicKey,
      2,
      TOKEN_PROGRAM_ID
    );

    logger.log('Mint created');
  });

  const INIT_SETTINGS = 'Init Settings';
  it(INIT_SETTINGS, async () => {
    const tx1 = new web3.Transaction();
    tx1.add(await main.init(accAdmin.publicKey));
    await helper.sendAndConfirmTransaction(INIT_SETTINGS, tx1, accAdmin);

    const account = await main.fetchSettings();
    expect(account.owner.toString()).eq(accAdmin.publicKey.toString());
    // assert.ok(account.data.eq(new BN(1234)));
    // apSettings.resolve({ pubSettings, bumpSettings });
  });

  const CHECK_ACCADMIN = 'Check accAdmin';
  it(CHECK_ACCADMIN, async () => {
    const parsedTx = await provider.connection.getParsedConfirmedTransaction(
      await signature,
      'confirmed'
    );

    if (parsedTx === null) {
      expect(parsedTx).not.to.be.null;
      return;
    }

    const { signatures } = parsedTx.transaction;
    expect(signatures[0]).to.eq(await signature);
  });

  const PORTAL_SYNTHESIZE = 'Portal Synthesize';
  it(PORTAL_SYNTHESIZE, async () => {
    logger.logPublicKey('accAdmin', accAdmin.publicKey);

    const accUser = web3.Keypair.generate();
    logger.logPublicKey('accUser', accUser.publicKey);
    await helper.transfer(new BN('10000000000000000'), accUser.publicKey);
    logger.log('sponsored');

    const pubSource = await token.createAssociatedTokenAccount(
      accUser.publicKey
    );
    logger.logPublicKey('pubSource', pubSource);
    await token.mintTo(pubSource, accMinter.publicKey, [accMinter], 1000);
    logger.log('mintTo');

    // const realToken = /* 0x */ '1234567890123456789012345678901234567890';

    const amount = 10;
    const chainToAddress = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const receiveSide = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const oppositeBridge = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const chainId = 14;

    logger.logPublicKey('token.publicKey', token.publicKey);

    const pubPDAMaster = await main.getSettingsAddress();
    logger.log('approve');
    await token.approve(pubSource, pubPDAMaster, accUser, [], amount);

    expect((await token.getAccountInfo(pubSource)).isInitialized).to.eq(true);

    // logger.log(await token.getAccountInfo(pubSource));
    const supply = (await provider.connection.getTokenSupply(token.publicKey))
      .value;

    expect(supply.uiAmount).to.eq(amount);

    logger.log('ixSynthesize');
    const ixSynthesize = await main.synthesize(
      new BN(amount),
      // bumpPDAMaster,
      chainToAddress,
      receiveSide,
      oppositeBridge,
      new BN(chainId),
      token.publicKey,
      accUser.publicKey,
      pubSource
    );

    const pubDestination = await main.getAssociatedTokenAddress(
      token.publicKey
    );
    let isDestinationInitialized = false;
    // (await token.getAccountInfo(pubDestination)).isInitialized
    const tx1 = new web3.Transaction();
    if (!isDestinationInitialized) {
      /*
      tx1.add(
        Token.createAssociatedTokenAccountInstruction(
          token.associatedProgramId,
          token.programId,
          token.publicKey,
          pubDestination,
          pubPDAMaster,
          accUser.publicKey
        )
      );
      */
      const tx2 = new web3.Transaction();
      tx2.add(await main.createRepresentationRequest(
        token.publicKey,
        accAdmin.publicKey,
      ));
      await helper.sendAndConfirmTransaction('createRepresentationRequest', tx2, accAdmin);
    }
    tx1.add(ixSynthesize);

    await helper.sendAndConfirmTransaction(PORTAL_SYNTHESIZE, tx1, accUser);

    logger.log('synthesizeRequestAccount');
    logger.log(await main.fetchSynthesizeRequestAccountInfo(token.publicKey));

    logger.log('fetch pubSynthesizeRequest');
    const dataSynthesizeRequest = await main.fetchSynthesizeRequest(
      token.publicKey
    );

    dataSynthesizeRequest;
    logger.log(dataSynthesizeRequest);

    const dataDestination = await token.getAccountInfo(pubDestination);
    logger.log(dataDestination);


    logger.log('emergencyUnsynthesize');
    const ixEmergencyUnsynthesize = await main.emergencyUnsynthesize(
      token.publicKey,
      accUser.publicKey,
      pubSource,
    );
    const tx2 = new web3.Transaction();
    tx2.add(ixEmergencyUnsynthesize);
    await helper.sendAndConfirmTransaction('send emergencyUnsynthesize', tx2, accUser);

    logger.log('synthesizeRequestAccount');
    logger.log(await main.fetchSynthesizeRequestAccountInfo(
      token.publicKey,
    ));

    // assert.ok(synthesizeRequestAccount.data.slice(120, 128)[0] == 2)
  });

  it.skip('Portal unsynthesize', async () => {
    /*
    let tx_id = '1234';
    let owner = provider.wallet;
    let mint = await createMint(provider);
    let statesMasterAccount = new web3.Account();
    await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(statesMasterAccount.publicKey, 10000000000),
        'confirmed'
    );

    const unsynthesizeState = await web3.PublicKey.createWithSeed(
        statesMasterAccount.publicKey,
        tx_id,
        program.programId
    )

    let amount = 10;
    let minted = 1000;
    let sourceAccount = await createTokenAccount(provider, mint, provider.wallet.publicKey);
    await mintToAccount(provider, mint, sourceAccount, minted, owner.publicKey)

    let destinationAccount = await createTokenAccount(provider, mint, provider.wallet.publicKey);
    // let splTokenKey = new anchor.web3.PublicKey(
    //     TokenInstructions.TOKEN_PROGRAM_ID.toString()
    // );

    const [pubSettings, bumpSettings] = await main.findSettingsAddress();

    await program.rpc.unsynthesize(
        mint.publicKey,
        tx_id,
        new BN(amount),
        {
            accounts: {
              settings: pubSettings,
                unsynthesizeState: unsynthesizeState,
                statesMasterAccount: statesMasterAccount.publicKey,
                sourceAccount,
                destinationAccount,
                ownerAccount: owner.publicKey,
                splTokenAccount: TOKEN_PROGRAM_ID,
                rent: web3.SYSVAR_RENT_PUBKEY,
                systemProgram: web3.SystemProgram.programId,
                bridge: factory.pidBridge, // progBridge.programId, // bridge.publicKey,
            },
            signers: [
              statesMasterAccount,
              // bridge,
            ],
        }
    )

    let unsynthesizeStateInfo = await provider.connection.getAccountInfo(unsynthesizeState);
    assert.ok(unsynthesizeStateInfo.data[0] == 1)

    let receiveSide = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    let oppositeBridge = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    let chainId = 14
    let nonceMasterAccount = new web3.Account();
    await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(nonceMasterAccount.publicKey, 10000000000),
        'confirmed'
    );

    const bridgeNonce = await web3.PublicKey.createWithSeed(
        nonceMasterAccount.publicKey,
        oppositeBridge.toString(),
        factory.pidMain, // program.programId
    )

    await program.rpc.emergencyUnburnRequest(
        tx_id,
        receiveSide,
        oppositeBridge,
        new BN(chainId),
        {
            accounts: {
                unsynthesizeState: unsynthesizeState,
                statesMasterAccount: statesMasterAccount.publicKey,
                nonceMasterAccount: nonceMasterAccount.publicKey,
                bridgeNonce,
                messageSender: owner.publicKey,
                rent: web3.SYSVAR_RENT_PUBKEY,
                systemProgram: web3.SystemProgram.programId,
            },
            signers: [nonceMasterAccount, statesMasterAccount]
        },
    )
    */
  });
});

/*
async function createMint(provider, authority?) {
    if (authority === undefined) {
        authority = provider.wallet.publicKey;
    }
    const mint = anchor.web3.Keypair.generate();
    const instructions = await createMintInstructions(
        provider,
        authority,
        mint.publicKey
    );

    const tx = new anchor.web3.Transaction();
    tx.add(...instructions);

    await provider.send(tx, [mint]);

    return mint.publicKey;
}

async function createMintInstructions(provider, authority, mint) {
    let instructions = [
        anchor.web3.SystemProgram.createAccount({
            fromPubkey: provider.wallet.publicKey,
            newAccountPubkey: mint,
            space: 82,
            lamports: await provider.connection.getMinimumBalanceForRentExemption(82),
            programId: TOKEN_PROGRAM_ID,
        }),
        TokenInstructions.initializeMint({
            mint,
            decimals: 0,
            mintAuthority: authority,
        }),
    ];
    return instructions;
}

async function createTokenAccount(provider, mint, owner) {
    const vault = anchor.web3.Keypair.generate();
    const tx = new anchor.web3.Transaction();
    tx.add(
        ...(await createTokenAccountInstrs(provider, vault.publicKey, mint, owner))
    );
    await provider.send(tx, [vault]);
    return vault.publicKey;
}

async function createTokenAccountInstrs(
    provider,
    newAccountPubkey,
    mint,
    owner,
    lamports?
) {
    if (lamports === undefined) {
        lamports = await provider.connection.getMinimumBalanceForRentExemption(165);
    }
    return [
        anchor.web3.SystemProgram.createAccount({
            fromPubkey: provider.wallet.publicKey,
            newAccountPubkey,
            space: 165,
            lamports,
            programId: TOKEN_PROGRAM_ID,
        }),
        TokenInstructions.initializeAccount({
            account: newAccountPubkey,
            mint,
            owner,
        }),
    ];
}

async function createMintToAccountInstrs(
    mint,
    destination,
    amount,
    mintAuthority
) {
    return [
        TokenInstructions.mintTo({
            mint,
            destination: destination,
            amount: amount,
            mintAuthority: mintAuthority,
        }),
    ];
}
async function mintToAccount(
    provider,
    mint,
    destination,
    amount,
    mintAuthority
) {
    // mint authority is the provider
    const tx = new anchor.web3.Transaction();
    tx.add(
        ...(await createMintToAccountInstrs(
            mint,
            destination,
            amount,
            mintAuthority
        ))
    );
    await provider.send(tx, []);
    return;
}
*/
