package test

import (
	"context"
	"encoding/binary"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"reflect"
	"testing"
	"time"

	"github.com/gagliardetto/solana-go/rpc/ws"
	"github.com/stretchr/testify/require"

	"github.com/portto/solana-go-sdk/client"
	"github.com/portto/solana-go-sdk/common"
	"github.com/portto/solana-go-sdk/sysprog"
	"github.com/portto/solana-go-sdk/tokenprog"
	"github.com/portto/solana-go-sdk/types"
)

var solana_client *client.Client
var solana_ws_client *ws.Client

var localSolanaUrl, localSolanaWSUrl string
var accAdmin types.Account
var err error

func SerializeData(data interface{}) ([]byte, error) {
	return serializeData(reflect.ValueOf(data))
}

func serializeData(v reflect.Value) ([]byte, error) {
	fmt.Println("v.Kind()")
	fmt.Println(v.Kind())
	fmt.Println("v.Type()")
	fmt.Println(v.Type())
	if reflect.Slice == v.Kind() || reflect.Array == v.Kind() {
		fmt.Println("v.Type().Elem().Kind()")
		fmt.Println(v.Type().Elem().Kind())
	}

	switch v.Kind() {
	case reflect.Bool:
		if v.Bool() {
			return []byte{1}, nil
		}
		return []byte{0}, nil
	case reflect.Uint8:
		return []byte{uint8(v.Uint())}, nil
	case reflect.Int16:
		b := make([]byte, 2)
		binary.LittleEndian.PutUint16(b, uint16(v.Int()))
		return b, nil
	case reflect.Uint16:
		b := make([]byte, 2)
		binary.LittleEndian.PutUint16(b, uint16(v.Uint()))
		return b, nil
	case reflect.Int32:
		b := make([]byte, 4)
		binary.LittleEndian.PutUint32(b, uint32(v.Int()))
		return b, nil
	case reflect.Uint32:
		b := make([]byte, 4)
		binary.LittleEndian.PutUint32(b, uint32(v.Uint()))
		return b, nil
	case reflect.Int64:
		b := make([]byte, 8)
		binary.LittleEndian.PutUint64(b, uint64(v.Int()))
		return b, nil
	case reflect.Uint64:
		b := make([]byte, 8)
		binary.LittleEndian.PutUint64(b, v.Uint())
		return b, nil
	case reflect.Slice, reflect.Array:
		switch v.Type().Elem().Kind() {
		case reflect.Uint8:
			b := make([]byte, 0, v.Len())
			for i := 0; i < v.Len(); i++ {
				b = append(b, byte(v.Index(i).Uint()))
			}
			return b, nil
		case reflect.Struct:
			fmt.Println("v.Type().Elem().Kind():", v.Type().Elem().Kind())
			fmt.Println("v.Type().Elem().String():", v.Type().Elem().String())
			if v.Type().Elem().String() == "test.TransactionAccount" {
				fmt.Println("v.Type().Elem().Type() == TransactionAccount")
				b := make([]byte, 0, v.Len()*1000)
				for i := 0; i < v.Len(); i++ {
					d, err := serializeData(v.Index(i))
					if err != nil {
						return nil, err
					}
					b = append(b, d...)
				}
				return b, nil
			} else {
				fmt.Println("v.Type().Elem().Type() != TransactionAccount")
			}
		}
		return nil, fmt.Errorf("unsupport type: %v, elem: %v", v.Kind(), v.Elem().Kind())
	case reflect.String:
		return []byte(v.String()), nil
	case reflect.Struct:
		data := make([]byte, 0, 1024)
		for i := 0; i < v.NumField(); i++ {
			field := v.Field(i)
			d, err := serializeData(field)
			if err != nil {
				return nil, err
			}
			data = append(data, d...)
		}
		return data, nil
	}
	return nil, fmt.Errorf("unsupport type: %v", v.Kind())
}

func ReadAccountFromFile(filename string) (types.Account, error) {
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
	localSolanaUrl = "http://127.0.0.1:8899"
	solana_client = client.NewClient(localSolanaUrl)
	localSolanaWSUrl = "ws://127.0.0.1:8900"
	solana_ws_client, err = ws.Connect(context.Background(), "ws://api.mainnet-beta.solana.com:80")
	if err != nil {
		panic(err)
	}

	accIdentity, err := ReadAccountFromFile("../localnet/ledger/validator-keypair.json")
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

func Test_testnet_connect(t *testing.T) {
	resp, err := solana_client.GetVersion(context.Background())
	require.NoError(t, err)
	t.Log("testnet solana version:", resp.SolanaCore)
}

func Test_WS_Connect(t *testing.T) {

	client, err := ws.Connect(context.Background(), localSolanaWSUrl)
	require.NoError(t, err)
	//if err != nil {
	//	panic(err)
	//}

	client.Close()
	//
	//resp, err := solana_client.GetVersion(context.Background())
	//require.NoError(t, err)
	//t.Log("testnet solana version:", resp.SolanaCore)
}

//func Test_Account(t *testing.T) {
//
//	resp, err := solana_client.GetVersion(context.Background())
//	require.NoError(t, err)
//	t.Log("testnet solana version:", resp.SolanaCore)
//
//	program := solana.MustPublicKeyFromBase58("9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin")
//	require.True(t, program)
//}

func Test_Stub(t *testing.T) {
	// localSolanaUrl = "http://127.0.0.1:8899"
}

func Test_local_connect(t *testing.T) {
	local_client := client.NewClient(localSolanaUrl)
	resp, err := local_client.GetVersion(context.Background())
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
	//init_()
	program, err := ReadAccountFromFile("../target/deploy/eywa_bridge-keypair.json")
	if err != nil {
		log.Fatalln("read pid error", err)
	}
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
