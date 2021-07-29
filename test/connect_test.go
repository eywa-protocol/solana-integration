package test

import (
	"context"
	"fmt"
	"log"
	"testing"

	"github.com/portto/solana-go-sdk/client"
	"github.com/portto/solana-go-sdk/types"

	"github.com/stretchr/testify/require"
)

var c *client.Client
var localSolanaUrl string

func init() {
	// c = client.NewClient(client.TestnetRPCEndpoint)
	localSolanaUrl = "http://127.0.0.1:8899"
}

// func Test_testnet_connect(t *testing.T) {
// 	resp, err := c.GetVersion(context.Background())
// 	require.NoError(t, err)
// 	fmt.Println("testnet solana version:", resp.SolanaCore)
// }

func Test_local_connect(t *testing.T) {
	local_client := client.NewClient(localSolanaUrl)
	resp, err := local_client.GetVersion(context.Background())
	require.NoError(t, err)
	fmt.Println("local solana version:", resp.SolanaCore)
}

func Test_Simple_transfer(t *testing.T) {
	// local_client := client.NewClient(localSolanaUrl)
	// resp, err := local_client.GetVersion(context.Background())
	// require.NoError(t, err)
	// fmt.Println("local solana version:", resp.SolanaCore)

	c := client.NewClient(localSolanaUrl)

	res, err := c.GetRecentBlockhash(context.Background())
	if err != nil {
		log.Fatalf("get recent block hash error, err: %v\n", err)
	}
	fmt.Println("RecentBlockHash:", res.Blockhash)

	accAdmin := types.NewAccount()
	fmt.Println("Admin:", accAdmin.PublicKey.ToBase58())

	txAirdropSig, err := c.RequestAirdrop(
		context.Background(),
		accAdmin.PublicKey.ToBase58(),
		100*1e9,
	)
	if err != nil {
		log.Fatalf("request airdrop error, err: %v", err)
	}

	fmt.Println("Airdrop:", txAirdropSig)

	// txAirdrop, err := c.GetTransaction(
	// 	context.Background(),
	// 	txAirdropSig,
	// 	client.GetTransactionWithLimitConfig{Commitment: client.CommitmentConfirmed},
	// )
	// if err != nil {
	// 	log.Fatalf("get recent block hash error, err: %v\n", err)
	// }
	// fmt.Println("Airdrop tx:", txAirdrop.Transaction)
	// fmt.Println("Airdrop tx fee:", txAirdrop.Meta.Fee)

	balance, err := c.GetBalance(
		context.Background(),
		accAdmin.PublicKey.ToBase58(),
	)
	if err != nil {
		log.Fatalln("get balance error", err)
	}
	fmt.Println("Admin balance:", balance)

	// accountA := types.NewAccount()
	// fmt.Println("Admin:", accAdmin.PublicKey.ToBase58())

	// rawTx, err := types.CreateRawTransaction(types.CreateRawTransactionParam{
	// 	Instructions: []types.Instruction{
	// 		sysprog.Transfer(
	// 			accAdmin.PublicKey, // from
	// 			accountA.PublicKey, // to
	// 			10*1e9,             // 10 * 1 SOL
	// 		),
	// 	},
	// 	Signers:         []types.Account{accAdmin},
	// 	FeePayer:        accAdmin.PublicKey,
	// 	RecentBlockHash: res.Blockhash,
	// })
	// if err != nil {
	// 	log.Fatalf("generate tx error, err: %v\n", err)
	// }

	// txSig, err := c.SendRawTransaction(context.Background(), rawTx)
	// if err != nil {
	// 	log.Fatalf("send tx error, err: %v\n", err)
	// }

	// log.Println("txHash:", txSig)
}
