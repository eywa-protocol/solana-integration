package test

import (
	"context"
	"encoding/hex"
	"fmt"
	"log"
	"testing"
	"time"

	"github.com/gagliardetto/solana-go/rpc"
	"github.com/gagliardetto/solana-go/rpc/ws"
	"github.com/stretchr/testify/require"

	"github.com/portto/solana-go-sdk/client"
	"github.com/portto/solana-go-sdk/common"
	"github.com/portto/solana-go-sdk/sysprog"
	"github.com/portto/solana-go-sdk/tokenprog"
	"github.com/portto/solana-go-sdk/types"
)

func Test_testnet_connect(t *testing.T) {
	resp, err := solana_client.GetVersion(context.Background())
	require.NoError(t, err)
	t.Log("testnet solana version:", resp.SolanaCore)
}

func Test_WS_Connect(t *testing.T) {

	client, err := ws.Connect(context.Background(), rpc.LocalNet_WS)
	require.NoError(t, err)

	client.Close()
}

func Test_local_connect(t *testing.T) {
	resp, err := solana_client.GetVersion(context.Background())
	require.NoError(t, err)
	fmt.Println("local solana version:", resp.SolanaCore)
}

func Test_Simple_transfer(t *testing.T) {
	res, err := solana_client.GetRecentBlockhash(context.Background())
	if err != nil {
		log.Fatalf("get recent block hash error, err: %v\n", err)
	}
	t.Log("RecentBlockHash:", res.Blockhash)

	balance, err := solana_client.GetBalance(
		context.Background(),
		accAdmin.PublicKey.ToBase58(),
	)
	if err != nil {
		log.Fatalln("get balance error", err)
	}
	t.Log("Admin balance:", balance)

	accountA := types.NewAccount()
	t.Log("accountA:", accountA.PublicKey.ToBase58())

	rawTx, err := types.CreateRawTransaction(types.CreateRawTransactionParam{
		Instructions: []types.Instruction{
			sysprog.Transfer(
				accAdmin.PublicKey, // from
				accountA.PublicKey, // to
				3*1e9,              // 3 * 1 SOL
			),
		},
		Signers:         []types.Account{accAdmin},
		FeePayer:        accAdmin.PublicKey,
		RecentBlockHash: res.Blockhash,
	})
	if err != nil {
		log.Fatalf("generate tx error, err: %v\n", err)
	}

	txSig, err := solana_client.SendRawTransaction(context.Background(), rawTx)
	if err != nil {
		log.Fatalf("send tx error, err: %v\n", err)
	}
	t.Log("txHash:", txSig)

	for i := 0; i < 10; i++ {
		fmt.Printf("%v ", i)
		balance, err = solana_client.GetBalance(context.Background(), accountA.PublicKey.ToBase58())
		if err != nil {
			log.Fatalln("get balance error", err)
		}
		if balance != 0 {
			break
		}
		time.Sleep(3 * time.Second)
	}
	balance, err = solana_client.GetBalance(
		context.Background(),
		accAdmin.PublicKey.ToBase58(),
	)
	if err != nil {
		log.Fatalln("get balance error", err)
	}
	t.Log("Admin balance:", balance)

	balance, err = solana_client.GetBalance(
		context.Background(),
		accountA.PublicKey.ToBase58(),
	)
	if err != nil {
		log.Fatalln("get balance error", err)
	}
	t.Log("accountA balance:", balance)
}

func Test_Create_representation(t *testing.T) {

	t.Log("program account:", program.PublicKey.ToBase58())
	t.Logf("program account: %x\n", program.PublicKey.Bytes())

	info, err := solana_client.GetAccountInfo(
		context.Background(),
		program.PublicKey.ToBase58(),
		client.GetAccountInfoConfig{
			Encoding: client.GetAccountInfoConfigEncodingBase58,
			DataSlice: client.GetAccountInfoConfigDataSlice{
				Offset: 0,
				Length: 10,
			},
		},
	)
	if err != nil {
		log.Fatalln("program.GetAccountInfo error", err)
	}
	require.NotNil(t, info)
	t.Log("program:", info)

	accMintSynt := types.NewAccount()
	accMintSyntData := types.NewAccount()

	t.Logf("accAdmin.PublicKey: %x (%s)\n", accAdmin.PublicKey.Bytes(), accMintSynt.PublicKey.ToBase58())
	t.Log("accMintSynt:", accMintSynt.PublicKey.ToBase58())
	t.Logf("accMintSynt: %x\n", accMintSynt.PublicKey.Bytes())
	t.Log("accMintSyntData:", accMintSyntData.PublicKey.ToBase58())
	t.Logf("accMintSyntData: %x\n", accMintSynt.PublicKey.Bytes())
	t.Logf("mintSynt.PublicKey:  %x\n", accMintSynt.PublicKey.Bytes())
	t.Logf("mintSyntData.PublicKey:  %x\n", accMintSyntData.PublicKey.Bytes())

	space := uint64(82)
	// lamports := uint64(1461600)
	lamports, err := solana_client.GetMinimumBalanceForRentExemption(context.Background(), space) // 1461600
	if err != nil {
		log.Fatalf("GetMinimumBalanceForRentExemption error: %v\n", err)
	}
	t.Log("lamports for creating Synthesis Token Account (Mint):", lamports)
	ixCreateSynt := sysprog.CreateAccount(
		accAdmin.PublicKey,
		accMintSynt.PublicKey,
		common.TokenProgramID,
		lamports,
		space,
	)

	space = uint64(1000)
	// lamports = uint64(7850880)
	lamports, err = solana_client.GetMinimumBalanceForRentExemption(context.Background(), space) // 1461600
	if err != nil {
		log.Fatalf("GetMinimumBalanceForRentExemption error: %v\n", err)
	}
	t.Log("lamports for creating Synthesis Data Account:", lamports)
	ixCreateMintData := sysprog.CreateAccount(
		accAdmin.PublicKey,
		accMintSyntData.PublicKey,
		program.PublicKey,
		lamports,
		space,
	)

	ixInitializeMint := tokenprog.InitializeMint(
		2,
		accMintSynt.PublicKey,
		accAdmin.PublicKey,
		accAdmin.PublicKey,
	)

	src := []byte("1234567890123456789012345678901234567890")
	decodedLen := hex.DecodedLen(len(src))
	dst := make([]byte, decodedLen)
	n, err := hex.Decode(dst, src)
	if err != nil {
		log.Fatal(err)
	}
	t.Logf("[%d]%x\n", decodedLen, dst[:n])

	tokenReal := [20]byte{}
	copy(tokenReal[:], dst)

	ixCreateRepresentation := CreateRepresentation(
		program.PublicKey,
		accMintSynt.PublicKey,
		accMintSyntData.PublicKey,
		accAdmin.PublicKey,
		tokenReal,
		"Some Synt Name", // syntName string, // synt name
		"SSN",            // syntSymbol string, // synt short name
		2,                // syntDecimals uint8, // u8
	)

	res, err := solana_client.GetRecentBlockhash(context.Background())
	if err != nil {
		log.Fatalf("get recent block hash error, err: %v\n", err)
	}
	t.Log("RecentBlockHash:", res.Blockhash)

	rawTx, err := types.CreateRawTransaction(types.CreateRawTransactionParam{
		Instructions: []types.Instruction{
			ixCreateSynt,
			ixCreateMintData,
			ixInitializeMint,
			ixCreateRepresentation,
		},
		Signers: []types.Account{
			accAdmin,
			accMintSynt,
			accMintSyntData,
		},
		FeePayer:        accAdmin.PublicKey,
		RecentBlockHash: res.Blockhash,
	})
	if err != nil {
		log.Fatalf("generate tx error, err: %v\n", err)
	}

	t.Logf("rawTx: %x\n", rawTx)

	txSig, err := solana_client.SendRawTransaction(context.Background(), rawTx)
	if err != nil {
		t.Fatalf("send tx error, err: %v\n", err)
	}

	t.Log("txHash:", txSig)
}
