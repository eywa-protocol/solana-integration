package test

import (
	"encoding/hex"
	"fmt"
	"log"
	"testing"

	"github.com/portto/solana-go-sdk/common"
	"github.com/portto/solana-go-sdk/sysprog"
	"github.com/portto/solana-go-sdk/tokenprog"
	"github.com/portto/solana-go-sdk/types"
	"github.com/stretchr/testify/require"
	"gitlab.digiu.ai/blockchainlaboratory/eywa-solana-test/serializer"
)

func compareBytes(a []byte, b []byte) error {
	fmt.Println("a:", a)
	fmt.Println("b:", b)
	return nil
}

func CreateRepresentation(
	pidThisProgram common.PublicKey,
	pubMint common.PublicKey,
	pubMintData common.PublicKey,
	pubOwner common.PublicKey,
	tokenReal [20]uint8,
	syntName string,
	syntSymbol string,
	syntDecimals uint8,
) types.Instruction {

	InstructionCreateRepresentation := [8]uint8{
		0x96, 0x98, 0x15, 0x35, 0x09, 0x07, 0xB1, 0xAC,
	}

	data, err := common.SerializeData(struct {
		Instruction   [8]uint8
		tokenReal     [20]uint8
		tokenSynt     common.PublicKey
		syntNameLen   uint32
		syntName      string
		syntSymbolLen uint32
		syntSymbol    string
		syntDecimals  uint8
	}{
		Instruction:   InstructionCreateRepresentation,
		tokenReal:     tokenReal,
		tokenSynt:     pubMint,
		syntNameLen:   uint32(len(syntName)),
		syntName:      syntName,
		syntSymbolLen: uint32(len(syntSymbol)),
		syntSymbol:    syntSymbol,
		syntDecimals:  syntDecimals,
	})
	if err != nil {
		panic(err)
	}

	return types.Instruction{
		ProgramID: pidThisProgram,
		Accounts: []types.AccountMeta{
			{PubKey: pubMint, IsSigner: false, IsWritable: true},
			{PubKey: pubMintData, IsSigner: false, IsWritable: true},
			{PubKey: common.SysVarRentPubkey, IsSigner: false, IsWritable: false},
			{PubKey: pubOwner, IsSigner: true, IsWritable: true},
		},
		Data: data,
	}
}

func Test_serializer(t *testing.T) {

	acc1 := types.AccountFromPrivateKeyBytes([]byte{
		149, 63, 8, 13, 195, 113, 123, 153, 126, 15, 4, 101, 143, 60, 220, 156,
		29, 214, 199, 157, 191, 177, 203, 175, 46, 149, 166, 158, 102, 83, 216, 44,
		248, 25, 187, 98, 43, 69, 174, 113, 217, 102, 82, 6, 216, 36, 167, 12,
		17, 72, 239, 18, 53, 151, 205, 223, 163, 161, 179, 168, 209, 227, 62, 136,
	})
	fmt.Println("Account 1", acc1.PublicKey.ToBase58())

	acc2 := types.AccountFromPrivateKeyBytes([]byte{
		236, 209, 137, 239, 82, 251, 157, 49, 53, 26, 123, 13, 116, 58, 82, 4,
		82, 193, 186, 166, 178, 198, 85, 97, 132, 87, 62, 155, 167, 208, 128, 17,
		49, 37, 74, 165, 32, 37, 2, 56, 161, 156, 85, 158, 83, 201, 10, 138,
		178, 15, 24, 190, 168, 61, 59, 246, 235, 14, 228, 251, 39, 44, 93, 180,
	})
	fmt.Println("Account 2", acc2.PublicKey.ToBase58())

	acc3 := types.AccountFromPrivateKeyBytes([]byte{
		177, 195, 151, 5, 114, 131, 84, 157, 252, 147, 58, 29, 222, 187, 193, 190,
		150, 64, 154, 78, 6, 143, 77, 124, 94, 59, 202, 248, 193, 220, 95, 202,
		99, 58, 197, 235, 243, 202, 24, 12, 209, 126, 99, 66, 247, 72, 228, 109,
		165, 245, 100, 215, 117, 166, 11, 142, 29, 155, 64, 116, 80, 215, 98, 48,
	})
	fmt.Println("Account 3", acc3.PublicKey.ToBase58())

	RecentBlockHash := "FU6qerSujsjVNhY1z88pwdqEdyT594fD4wLyBGnTGvaG"

	accAdmin := acc1
	accMintSynt := acc2
	accMintSyntData := acc3
	pidTokenProgram := common.TokenProgramID
	pidThisProgram := common.PublicKeyFromString("ThisProgram11111111111111111111111111111111")

	ixCreateSyntAccount := sysprog.CreateAccount(
		accAdmin.PublicKey,
		accMintSynt.PublicKey,
		pidTokenProgram,
		10*1000*1000,
		100,
	)

	ixCreateMintDataAccount := sysprog.CreateAccount(
		accAdmin.PublicKey,
		accMintSyntData.PublicKey,
		pidThisProgram,
		10*1000*1000,
		100,
	)

	src := []byte("1234567890123456789012345678901234567890")
	decodedLen := hex.DecodedLen(len(src))
	dst := make([]byte, decodedLen)
	n, err := hex.Decode(dst, src)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("[%d]%x\n", decodedLen, dst[:n])

	tokenReal := [20]byte{}
	copy(tokenReal[:], dst)

	ixCreateRepresentation := CreateRepresentation(
		pidThisProgram,
		accMintSynt.PublicKey,
		accMintSyntData.PublicKey,
		accAdmin.PublicKey,
		tokenReal,
		"Some Synt Name",
		"SSN",
		2,
	)

	ixInitializeMintAccount := tokenprog.InitializeMint(
		2,
		accMintSynt.PublicKey,
		accAdmin.PublicKey,
		accAdmin.PublicKey,
	)
	rawTx, err := types.CreateRawTransaction(types.CreateRawTransactionParam{
		Instructions: []types.Instruction{
			ixCreateSyntAccount,
			ixCreateMintDataAccount,
			ixInitializeMintAccount,
			ixCreateRepresentation,
		},
		Signers: []types.Account{
			accAdmin,
			accMintSynt,
			accMintSyntData,
		},
		FeePayer:        accAdmin.PublicKey,
		RecentBlockHash: RecentBlockHash,
	})
	if err != nil {
		log.Fatalf("generate tx error, err: %v\n", err)
	}

	fmt.Println("rawTx:")
	fmt.Printf("%x\n", rawTx)

	require.NoError(t, compareBytes([]byte{1}, []byte{2}))
}

func Test_Receive_request_serializer(t *testing.T) {
	accAdmin := types.AccountFromPrivateKeyBytes([]byte{
		149, 63, 8, 13, 195, 113, 123, 153, 126, 15, 4, 101, 143, 60, 220, 156,
		29, 214, 199, 157, 191, 177, 203, 175, 46, 149, 166, 158, 102, 83, 216, 44,
		248, 25, 187, 98, 43, 69, 174, 113, 217, 102, 82, 6, 216, 36, 167, 12,
		17, 72, 239, 18, 53, 151, 205, 223, 163, 161, 179, 168, 209, 227, 62, 136,
	})
	pidThisProgram := common.PublicKeyFromString("ThisProgram11111111111111111111111111111111")
	fmt.Println("program account:", pidThisProgram.ToBase58())
	fmt.Printf("program account: %x\n", pidThisProgram.Bytes())

	personName := "World"
	pubAdmin := accAdmin.PublicKey
	ixHello := serializer.CreateHelloInstruction(personName, pidThisProgram, pubAdmin)
	sInst := serializer.CreateStandaloneInstruction(ixHello)
	sInstData, err := sInst.Serialize()
	if err != nil {
		panic(err)
	}
	fmt.Printf("sInstData: %x\n", sInstData)

	InstructionReceiveRequest := [8]uint8{
		92, 46, 108, 42, 179, 64, 8, 139,
	}
	fmt.Printf("InstructionReceiveRequest: %x\n", InstructionReceiveRequest)

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
	fmt.Printf("dataReceiveRequest: %x\n", dataReceiveRequest)

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

	RecentBlockHash := "FU6qerSujsjVNhY1z88pwdqEdyT594fD4wLyBGnTGvaG"
	fmt.Println("RecentBlockHash:", RecentBlockHash)
	fmt.Printf("RecentBlockHash: %x\n", RecentBlockHash)

	rawTx, err := types.CreateRawTransaction(types.CreateRawTransactionParam{
		Instructions: []types.Instruction{
			ixReceiveRequest,
		},
		Signers: []types.Account{
			accAdmin,
		},
		FeePayer:        accAdmin.PublicKey,
		RecentBlockHash: RecentBlockHash,
	})
	if err != nil {
		log.Fatalf("generate tx error, err: %v\n", err)
	}

	fmt.Printf("rawTx: %x\n", rawTx)
}
