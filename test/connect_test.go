package test

import (
	"context"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"testing"
	"time"

	"github.com/portto/solana-go-sdk/client"
	"github.com/portto/solana-go-sdk/common"
	"github.com/portto/solana-go-sdk/sysprog"
	"github.com/portto/solana-go-sdk/tokenprog"
	"github.com/portto/solana-go-sdk/types"
)

var c *client.Client
var localSolanaUrl string
var accAdmin types.Account

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

func init() {
	// c = client.NewClient(client.TestnetRPCEndpoint)
	localSolanaUrl = "http://127.0.0.1:8899"
	c = client.NewClient(localSolanaUrl)

	accIdentity, err := readAccountFromFile("../localnet/ledger/validator-keypair.json")
	if err != nil {
		panic(err)
	}
	fmt.Println("identity:", accIdentity.PublicKey.ToBase58())

	balance, err := c.GetBalance(context.Background(), accIdentity.PublicKey.ToBase58())
	if err != nil {
		panic(err)
	}
	fmt.Println("identity balance:", balance)

	// create Admin test account
	res, err := c.GetRecentBlockhash(context.Background())
	if err != nil {
		panic(err)
	}
	fmt.Println("RecentBlockHash:", res.Blockhash)

	accAdmin = types.NewAccount()
	fmt.Println("Admin:", accAdmin.PublicKey.ToBase58())

	balance, err = c.GetBalance(context.Background(), accAdmin.PublicKey.ToBase58())
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
	txSig, err := c.SendRawTransaction(context.Background(), rawTx)
	if err != nil {
		panic(err)
	}
	log.Println("txHash:", txSig)
	for i := 0; i < 10; i++ {
		fmt.Printf("%v ", i)
		balance, err = c.GetBalance(context.Background(), accAdmin.PublicKey.ToBase58())
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

// func Test_testnet_connect(t *testing.T) {
// 	resp, err := c.GetVersion(context.Background())
// 	require.NoError(t, err)
// 	fmt.Println("testnet solana version:", resp.SolanaCore)
// }

// func Test_Stub(t *testing.T) {
// 	// localSolanaUrl = "http://127.0.0.1:8899"
// }

// func Test_local_connect(t *testing.T) {
// 	local_client := client.NewClient(localSolanaUrl)
// 	resp, err := local_client.GetVersion(context.Background())
// 	require.NoError(t, err)
// 	fmt.Println("local solana version:", resp.SolanaCore)
// }

func Test_Simple_transfer(t *testing.T) {
	res, err := c.GetRecentBlockhash(context.Background())
	if err != nil {
		log.Fatalf("get recent block hash error, err: %v\n", err)
	}
	fmt.Println("RecentBlockHash:", res.Blockhash)

	balance, err := c.GetBalance(
		context.Background(),
		accAdmin.PublicKey.ToBase58(),
	)
	if err != nil {
		log.Fatalln("get balance error", err)
	}
	fmt.Println("Admin balance:", balance)

	accountA := types.NewAccount()
	fmt.Println("accountA:", accountA.PublicKey.ToBase58())

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

	txSig, err := c.SendRawTransaction(context.Background(), rawTx)
	if err != nil {
		log.Fatalf("send tx error, err: %v\n", err)
	}
	log.Println("txHash:", txSig)

	for i := 0; i < 10; i++ {
		fmt.Printf("%v ", i)
		balance, err = c.GetBalance(context.Background(), accountA.PublicKey.ToBase58())
		if err != nil {
			log.Fatalln("get balance error", err)
		}
		if balance != 0 {
			break
		}
		time.Sleep(3 * time.Second)
	}
	balance, err = c.GetBalance(
		context.Background(),
		accAdmin.PublicKey.ToBase58(),
	)
	if err != nil {
		log.Fatalln("get balance error", err)
	}
	fmt.Println("Admin balance:", balance)

	balance, err = c.GetBalance(
		context.Background(),
		accountA.PublicKey.ToBase58(),
	)
	if err != nil {
		log.Fatalln("get balance error", err)
	}
	fmt.Println("accountA balance:", balance)
}

func Test_Create_representation(t *testing.T) {
	program, err := readAccountFromFile("../target/deploy/eywa_bridge_solana-keypair.json")
	if err != nil {
		log.Fatalln("read pid error", err)
	}
	fmt.Println("program account:", program.PublicKey.ToBase58())
	fmt.Printf("program account: %x\n", program.PublicKey.Bytes())

	info, err := c.GetAccountInfo(
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
	fmt.Println("program:", info)

	accMintSynt := types.NewAccount()
	accMintSyntData := types.NewAccount()

	fmt.Printf("accAdmin.PublicKey: %x (%s)\n", accAdmin.PublicKey.Bytes(), accMintSynt.PublicKey.ToBase58())
	fmt.Println("accMintSynt:", accMintSynt.PublicKey.ToBase58())
	fmt.Printf("accMintSynt: %x\n", accMintSynt.PublicKey.Bytes())
	fmt.Println("accMintSyntData:", accMintSyntData.PublicKey.ToBase58())
	fmt.Printf("accMintSyntData: %x\n", accMintSynt.PublicKey.Bytes())
	fmt.Printf("mintSynt.PublicKey:  %x\n", accMintSynt.PublicKey.Bytes())
	fmt.Printf("mintSyntData.PublicKey:  %x\n", accMintSyntData.PublicKey.Bytes())

	space := uint64(82)
	lamports := uint64(1461600)
	// lamports, err := client.GetMinimumBalanceForRentExemption(context.Background(), space) // 1461600
	ixCreateSynt := sysprog.CreateAccount(
		accAdmin.PublicKey,
		accMintSynt.PublicKey,
		common.TokenProgramID,
		lamports,
		space,
	)

	space = uint64(1000)
	lamports = uint64(7850880)
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
	len := hex.DecodedLen(len(src))
	dst := make([]byte, len)
	n, err := hex.Decode(dst, src)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("[%d]%x\n", len, dst[:n])

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

	res, err := c.GetRecentBlockhash(context.Background())
	if err != nil {
		log.Fatalf("get recent block hash error, err: %v\n", err)
	}
	fmt.Println("RecentBlockHash:", res.Blockhash)

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

	fmt.Printf("rawTx: %x\n", rawTx)

	txSig, err := c.SendRawTransaction(context.Background(), rawTx)
	if err != nil {
		log.Fatalf("send tx error, err: %v\n", err)
	}

	log.Println("txHash:", txSig)
}
