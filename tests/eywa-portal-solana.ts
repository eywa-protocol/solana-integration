import {
    BN,
    Provider,
    setProvider,
    web3,
    workspace,
} from '@project-serum/anchor';
const assert = require("assert");
const TokenInstructions = require("@project-serum/serum").TokenInstructions;
const anchor = require('@project-serum/anchor');

const TOKEN_PROGRAM_ID = new anchor.web3.PublicKey(
    TokenInstructions.TOKEN_PROGRAM_ID.toString()
);

describe('eywa-portal-solana', () => {
    const provider = Provider.env();
    setProvider(provider);
    const program = workspace.EywaBridgeSolana;
    let bridge = new anchor.web3.Account();

    it('Create Portal', async () => {
        await program.state.rpc.new({
            accounts: {
                bridge: bridge.publicKey,
            },
            signers: [bridge],
        });

    });

    it('Portal Synthesize', async () => {
        let owner = provider.wallet;
        let mint = await createMint(provider);
        let minted = 1000;
        let sourceAccount = await createTokenAccount(provider, mint, provider.wallet.publicKey);
        await mintToAccount(provider, mint, sourceAccount, minted, owner.publicKey)
        let destinationAccount = await createTokenAccount(provider, mint, provider.wallet.publicKey);
        let splTokenKey = new anchor.web3.PublicKey(
            TokenInstructions.TOKEN_PROGRAM_ID.toString()
        );

        let realToken = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19])
        let amount = 10
        let chainToAddress = [0, 1, 2, 3, 4, 5, 6, 7, 8]
        let receiveSide = [0, 1, 2, 3, 4, 5, 6, 7, 8]
        let oppositeBridge = [0, 1, 2, 3, 4, 5, 6, 7, 8]
        let chainId = 14
        let nonceMasterAccount = new anchor.web3.Account();
        await provider.connection.confirmTransaction(
            await provider.connection.requestAirdrop(nonceMasterAccount.publicKey, 10000000000),
            "confirmed"
        );

        const bridgeNonce = await anchor.web3.PublicKey.createWithSeed(
            nonceMasterAccount.publicKey,
            oppositeBridge.toString(),
            program.programId
        )
        const synthesizeRequest = anchor.web3.Keypair.generate();
        
        await program.state.rpc.synthesize(
            realToken,
            new anchor.BN(amount),
            chainToAddress,
            receiveSide,
            oppositeBridge,
            new anchor.BN(chainId),
            {
                accounts: {
                    synthesizeRequest: synthesizeRequest.publicKey,
                    sourceAccount,
                    destinationAccount,
                    ownerAccount: owner.publicKey,
                    splTokenAccount: splTokenKey,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                    nonceMasterAccount: nonceMasterAccount.publicKey,
                    bridgeNonce,
                    systemProgram: anchor.web3.SystemProgram.programId,
                },
                signers: [nonceMasterAccount, synthesizeRequest,],
                instructions: [
                    await program.account.synthesizeRequestInfo.createInstruction(synthesizeRequest, 300),
                ],
            }
        )

        let synthesizeRequestAccount = await provider.connection.getAccountInfo(synthesizeRequest.publicKey);

        assert.ok(synthesizeRequestAccount.data.slice(120, 128)[0] == 1)

        await program.state.rpc.emergencyUnsynthesize(
            synthesizeRequestAccount.data.slice(8, 40),
            {
                accounts: {
                    synthesizeRequest: synthesizeRequest.publicKey,
                    sourceAccount: destinationAccount,
                    destinationAccount: sourceAccount,
                    ownerAccount: owner.publicKey,
                    splTokenAccount: splTokenKey,
                    bridge: bridge.publicKey,
                },
                signers: [bridge,],
            }
        )

        synthesizeRequestAccount = await provider.connection.getAccountInfo(synthesizeRequest.publicKey);

        assert.ok(synthesizeRequestAccount.data.slice(120, 128)[0] == 2)
    });

    it('Portal unsynthesize', async () => {

        let tx_id = "1234";
        let owner = provider.wallet;
        let mint = await createMint(provider);
        let statesMasterAccount = new anchor.web3.Account();
        await provider.connection.confirmTransaction(
            await provider.connection.requestAirdrop(statesMasterAccount.publicKey, 10000000000),
            "confirmed"
        );

        const unsynthesizeState = await anchor.web3.PublicKey.createWithSeed(
            statesMasterAccount.publicKey,
            tx_id,
            program.programId
        )

        let amount = 10;
        let minted = 1000;
        let sourceAccount = await createTokenAccount(provider, mint, provider.wallet.publicKey);
        await mintToAccount(provider, mint, sourceAccount, minted, owner.publicKey)

        let destinationAccount = await createTokenAccount(provider, mint, provider.wallet.publicKey);
        let splTokenKey = new anchor.web3.PublicKey(
            TokenInstructions.TOKEN_PROGRAM_ID.toString()
        );

        await program.state.rpc.unsynthesize(
            mint.publicKey,
            tx_id,
            new anchor.BN(amount),
            {
                accounts: {
                    unsynthesizeState: unsynthesizeState,
                    statesMasterAccount: statesMasterAccount.publicKey,
                    sourceAccount,
                    destinationAccount,
                    ownerAccount: owner.publicKey,
                    splTokenAccount: splTokenKey,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    bridge: bridge.publicKey,
                },
                signers: [statesMasterAccount, bridge,],
            }
        )


        let unsynthesizeStateInfo = await provider.connection.getAccountInfo(unsynthesizeState);
        assert.ok(unsynthesizeStateInfo.data[0] == 1)
    });
});


async function createMint(provider, authority) {
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
    lamports
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

