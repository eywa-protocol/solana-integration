package test

import (
	"context"
	"encoding/binary"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"github.com/stretchr/testify/require"
	"io/ioutil"
	"log"
	"reflect"
	"testing"
	"time"

	"github.com/portto/solana-go-sdk/client"
	"github.com/portto/solana-go-sdk/common"
	"github.com/portto/solana-go-sdk/sysprog"
	"github.com/portto/solana-go-sdk/tokenprog"
	"github.com/portto/solana-go-sdk/types"
	"gitlab.digiu.ai/blockchainlaboratory/eywa-solana-test/serializer"
)

var c *client.Client
var localSolanaUrl string
var accAdmin types.Account

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

func init_() {
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

func Test_testnet_connect(t *testing.T) {
	resp, err := c.GetVersion(context.Background())
	require.NoError(t, err)
	t.Log("testnet solana version:", resp.SolanaCore)
}

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
	t.Log("RecentBlockHash:", res.Blockhash)

	balance, err := c.GetBalance(
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

	txSig, err := c.SendRawTransaction(context.Background(), rawTx)
	if err != nil {
		log.Fatalf("send tx error, err: %v\n", err)
	}
	t.Log("txHash:", txSig)

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
	t.Log("Admin balance:", balance)

	balance, err = c.GetBalance(
		context.Background(),
		accountA.PublicKey.ToBase58(),
	)
	if err != nil {
		log.Fatalln("get balance error", err)
	}
	t.Log("accountA balance:", balance)
}

func Test_Create_representation(t *testing.T) {
	program, err := readAccountFromFile("../target/deploy/eywa_bridge-keypair.json")
	if err != nil {
		log.Fatalln("read pid error", err)
	}
	t.Log("program account:", program.PublicKey.ToBase58())
	t.Logf("program account: %x\n", program.PublicKey.Bytes())

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
	lamports, err := c.GetMinimumBalanceForRentExemption(context.Background(), space) // 1461600
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
	lamports, err = c.GetMinimumBalanceForRentExemption(context.Background(), space) // 1461600
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

	res, err := c.GetRecentBlockhash(context.Background())
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

	txSig, err := c.SendRawTransaction(context.Background(), rawTx)
	if err != nil {
		t.Fatalf("send tx error, err: %v\n", err)
	}

	t.Log("txHash:", txSig)
}

func Test_Receive_request(t *testing.T) {
	program, err := readAccountFromFile("../target/deploy/eywa_bridge-keypair.json")
	if err != nil {
		log.Fatalln("read pid error", err)
	}
	pidThisProgram := program.PublicKey
	t.Log("program account:", pidThisProgram.ToBase58())
	t.Logf("program account: %x\n", pidThisProgram.Bytes())
	/*
	       const ixHello = await program.instruction.hello('World', {
	         accounts: {
	           person: provider.wallet.publicKey,
	         },
	       });
	   	accAdmin
	*/

	// // [149, 118, 59, 220, 196, 127, 161, 179]
	// // 95763bdcc47fa1b3
	// InstructionHello := [8]uint8{
	// 	149, 118, 59, 220, 196, 127, 161, 179,
	// }
	// t.Logf("InstructionHello: %x\n", InstructionHello)

	personName := "World"
	// dataHello, err := common.SerializeData(struct {
	// 	Instruction [8]uint8
	// 	nameLen     uint32
	// 	name        string
	// }{
	// 	Instruction: InstructionHello,
	// 	nameLen:     uint32(len(personName)),
	// 	name:        personName,
	// })
	// if err != nil {
	// 	panic(err)
	// }
	// t.Logf("dataHello: %x\n", dataHello)

	pubAdmin := accAdmin.PublicKey
	/*
		ixHello := types.Instruction{
			ProgramID: pidThisProgram,
			Accounts: []types.AccountMeta{
				// person: provider.wallet.publicKey,
				{PubKey: pubAdmin, IsSigner: true, IsWritable: false},
			},
			Data: dataHello,
		}
	*/
	ixHello := serializer.CreateHelloInstruction(personName, pidThisProgram, pubAdmin)

	/*
	   const si: StandaloneInstruction = {
	     programId: ixHello.programId,
	     accounts: ixHello.keys as TransactionAccount[],
	     data: ixHello.data,
	   }
	*/

	// sInst, err := SerializeData(struct {
	// 	ProgramID [32]uint8
	// 	Accounts  []TransactionAccount
	// 	Data      []byte
	// }{
	sInst := serializer.CreateStandaloneInstruction(ixHello)
	// sInst := serializer.StandaloneInstruction{
	// 	ProgramId: serializer.UInt256(pidThisProgram),
	// 	Accounts: []serializer.TransactionAccount{
	// 		{
	// 			PubKey:     serializer.UInt256(pubAdmin),
	// 			IsSigner:   true,
	// 			IsWritable: false,
	// 		},
	// 	},
	// 	Data: dataHello,
	// }
	sInstData, err := sInst.Serialize()
	if err != nil {
		panic(err)
	}
	t.Logf("sInstData: %x\n", sInstData)

	/*
	   const ixReceiveRequest = await program.state.instruction.receiveRequest(
	     Buffer.from('1122334455667788990011223344556677889900112233445566778899001122', 'hex'), // req_id: [u8; 32], // bytes32 reqId,
	     si, // sinst: StandaloneInstruction, // bytes memory b, address receiveSide,
	     Buffer.from('1122334455667788990011223344556677889900', 'hex'), // bridge_from: [u8; 20], // address bridgeFrom
	   {
	     accounts: {
	       proposer: accAdmin.publicKey,
	     },
	     remainingAccounts: [
	       { pubkey: program.programId, isWritable: false, isSigner: false },
	       { pubkey: provider.wallet.publicKey, isWritable: false, isSigner: false },
	     ],
	   });
	*/
	InstructionReceiveRequest := [8]uint8{
		92, 46, 108, 42, 179, 64, 8, 139,
	}
	t.Logf("InstructionReceiveRequest: %x\n", InstructionReceiveRequest)

	// personName := "World"
	dataReceiveRequest, err := common.SerializeData(struct {
		Instruction [8]uint8
		ReqId       [32]uint8
		SInst       []byte
		BridgeFrom  [20]uint8
	}{
		Instruction: InstructionReceiveRequest,
		ReqId: [32]uint8{
			1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
			21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
		},
		SInst: sInstData,
		BridgeFrom: [20]uint8{
			1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
		},
	})
	if err != nil {
		panic(err)
	}
	t.Logf("dataReceiveRequest: %x\n", dataReceiveRequest)

	ixReceiveRequest := types.Instruction{
		ProgramID: pidThisProgram,
		Accounts: []types.AccountMeta{
			// person: provider.wallet.publicKey,
			{PubKey: pubAdmin, IsSigner: true, IsWritable: false},
			{PubKey: pidThisProgram, IsWritable: false, IsSigner: false},
			{PubKey: pubAdmin, IsWritable: false, IsSigner: false},
		},
		Data: dataReceiveRequest,
	}

	res, err := c.GetRecentBlockhash(context.Background())
	if err != nil {
		log.Fatalf("get recent block hash error, err: %v\n", err)
	}
	t.Logf("RecentBlockHash: %v\n", res.Blockhash)
	t.Logf("RecentBlockHash: %x\n", res.Blockhash)

	rawTx, err := types.CreateRawTransaction(types.CreateRawTransactionParam{
		Instructions: []types.Instruction{
			ixReceiveRequest,
		},
		Signers: []types.Account{
			accAdmin,
		},
		FeePayer:        accAdmin.PublicKey,
		RecentBlockHash: res.Blockhash,
	})
	if err != nil {
		log.Fatalf("generate tx error, err: %v\n", err)
	}

	t.Logf("rawTx: %x\n", rawTx)
	/*
		01
		ad41459031dfe43fbeb0229c8f9d75f1ec6ce1a4e6c805dfb2c7c977f21dd306
		17f1ec18b2432b8a5900b414f5ed3a711c7e66ab1339bf13ccb5122cf4211f07
		01
		00
		01
		02
		617f2d66269167267f5044b702a3eac1274c317eb0804c4ae26a30aff3fe8ecc
		e9c308b998808316e4ad0c5d65bb34c75f03e4dbf4ccc609a362c5bf2e470fe5
		5d2ed8e5f2605085acd6663b78d0b444af6633937a7974738cebdb5a204f10f6
		01
		01
		03
		00
		01
		00
		8f0195763bdcc47fa1b3
		0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20
		e9c308b998808316e4ad0c5d65bb34c75f03e4dbf4ccc609a362c5bf2e470fe5
		617f2d66269167267f5044b702a3eac1274c317eb0804c4ae26a30aff3fe8ecc
		01
		00
		95763bdcc47fa1b
		30
		5000000
		576f726c64

		0102030405060708090a0b0c0d0e0f1011121314

		01
		5535e550dd5aa7b4c6f6f59de1dc380702fbd3a5905cc0f0f041c2dc7a831a5a
		2d0d0d3545452446fb8f8f4d4ddf51e63a43fadd7e35a4932ba47b09997be90f
		01
		00
		01
		02
		77b378f0399a3dfb259388a506282243a8f73150e4e1638118d0f687332fbcf0
		e9c308b998808316e4ad0c5d65bb34c75f03e4dbf4ccc609a362c5bf2e470fe5
		6ecc7bcf877bb618db5f7c359d9e16c107b434319f89a7f0326923a0b9170792
		01
		01
		03
		00
		01
		00
		8d
		015c2e6c2ab340088b
		0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20
		e9c308b998808316e4ad0c5d65bb34c75f03e4dbf4ccc609a362c5bf2e470fe5
		77b378f0399a3dfb259388a506282243a8f73150e4e1638118d0f687332fbcf0
		95763bdcc47fa1b3
		05000000
		576f726c64
		0102030405060708090a0b0c0d0e0f1011121314
	*/

	txSig, err := c.SendRawTransaction(context.Background(), rawTx)
	if err != nil {
		t.Fatalf("send tx error, err: %v\n", err)
	}

	t.Log("txHash:", txSig)
}
