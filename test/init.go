package test

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/gagliardetto/solana-go/rpc"
	"github.com/gagliardetto/solana-go/rpc/ws"
	"github.com/portto/solana-go-sdk/client"
	"github.com/portto/solana-go-sdk/sysprog"
	"github.com/portto/solana-go-sdk/types"
	"io/ioutil"
	"log"
	"time"
)

var solana_client *client.Client
var solana_ws_client *ws.Client

var bridge_prgrm_json string
var accAdmin, program types.Account
var err error

func init() {
	bridge_prgrm_json = "../target/deploy/eywa_bridge-keypair.json"
	solana_client = client.NewClient(rpc.LocalNet_RPC)
	solana_ws_client, err = ws.Connect(context.Background(), rpc.LocalNet_WS)
	if err != nil {
		panic(err)
	}
	program, err = readAccountFromFile(bridge_prgrm_json)
	if err != nil {
		panic(err)
	}
}

func readAccountFromFile(filename string) (types.Account, error) {
	plan, err := ioutil.ReadFile(filename)
	if err != nil {
		return types.Account{}, err
	}

	var data []byte
	err = json.Unmarshal(plan, &data)
	if err != nil {
		return types.Account{}, err
	}
	// fmt.Println("validator-keypair.json:", data)
	acc := types.AccountFromPrivateKeyBytes(data)
	return acc, nil
}

func doSometinhWithAdmin() {
	accIdentity, err := readAccountFromFile("../localnet/ledger/validator-keypair.json")
	if err != nil {
		panic(err)
	}
	fmt.Println("identity:", accIdentity.PublicKey.ToBase58())

	balance, err := solana_client.GetBalance(context.Background(), accIdentity.PublicKey.ToBase58())
	if err != nil {
		panic(err)
	}
	fmt.Println("identity balance:", balance)

	// create Admin test account
	res, err := solana_client.GetRecentBlockhash(context.Background())
	if err != nil {
		panic(err)
	}
	fmt.Println("RecentBlockHash:", res.Blockhash)

	accAdmin = types.NewAccount()
	fmt.Println("Admin:", accAdmin.PublicKey.ToBase58())

	balance, err = solana_client.GetBalance(context.Background(), accAdmin.PublicKey.ToBase58())
	if err != nil {
		panic(err)
	}
	fmt.Println("Admin balance:", balance)

	rawTx, err := types.CreateRawTransaction(types.CreateRawTransactionParam{
		Instructions: []types.Instruction{
			sysprog.Transfer(
				accIdentity.PublicKey, // from
				accAdmin.PublicKey,    // to
				10*1e9,                // 10 * 1 SOL
			),
		},
		Signers:         []types.Account{accIdentity},
		FeePayer:        accIdentity.PublicKey,
		RecentBlockHash: res.Blockhash,
	})
	if err != nil {
		panic(err)
	}
	txSig, err := solana_client.SendRawTransaction(context.Background(), rawTx)
	if err != nil {
		panic(err)
	}
	log.Println("txHash:", txSig)
	for i := 0; i < 10; i++ {
		fmt.Printf("%v ", i)
		balance, err = solana_client.GetBalance(context.Background(), accAdmin.PublicKey.ToBase58())
		if err != nil {
			panic(err)
		}
		if balance != 0 {
			break
		}
		time.Sleep(3 * time.Second)
	}
	fmt.Println("Admin balance:", balance)

}
