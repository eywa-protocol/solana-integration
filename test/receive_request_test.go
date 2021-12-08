package test

import (
	"context"
	"log"
	"testing"

	"github.com/portto/solana-go-sdk/common"
	"github.com/portto/solana-go-sdk/types"
	"gitlab.digiu.ai/blockchainlaboratory/eywa-solana-test/serializer"
)

// var solana_client *client.Client
// var solana_ws_client *ws.Client

// var localSolanaUrl, localSolanaWSUrl string
// var accAdmin types.Account

// func SerializeData(data interface{}) ([]byte, error) {
// 	return serializeData(reflect.ValueOf(data))
// }

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

	res, err := solana_client.GetRecentBlockhash(context.Background())
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

	txSig, err := solana_client.SendRawTransaction(context.Background(), rawTx)
	if err != nil {
		t.Fatalf("send tx error, err: %v\n", err)
	}

	t.Log("txHash:", txSig)
}
