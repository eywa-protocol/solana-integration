package test

import (
	"encoding/hex"
	"fmt"
	"log"
	"testing"

	"example.com/serializer"
	"github.com/portto/solana-go-sdk/common"
	"github.com/portto/solana-go-sdk/sysprog"
	"github.com/portto/solana-go-sdk/tokenprog"
	"github.com/portto/solana-go-sdk/types"
	"github.com/stretchr/testify/require"
)

func init() {
	// "example.com/serializer"
	// "github.com/portto/solana-go-sdk/types"
	// "github.com/stretchr/testify/require"

	// fmt.Println(serializer.Hello("world"))
}

func compareBytes(a []byte, b []byte) error {
	fmt.Println("a:", a)
	fmt.Println("b:", b)
	return nil
}

// type CreateRepresentationData struct {
// 	X uint64
// 	Y string
// 	Z string `borsh_skip:"true"` // will skip this field when serializing/deserializing
// }

func CreateRepresentation(
	pidThisProgram common.PublicKey,
	pubMint common.PublicKey,
	pubMintData common.PublicKey,
	pubOwner common.PublicKey,
	tokenReal [20]uint8, // [u8; 20], // String, // H160, // real token for synt
	// [pubMint] tokenSynt common.PublicKey,
	syntName string, // synt name
	syntSymbol string, // synt short name
	syntDecimals uint8, // u8
) types.Instruction {
	// EywaBridgeSolanaInstruction := struct {
	// 	CreateRepresentation [8]uint8{x96, x98, x15, x35, x09, x07, xB1, xAC}
	// }
	// "github.com/near/borsh-go"
	// x := A{
	// 	X: 3301,
	// 	Y: "liber primus",
	// }
	// data1, err := borsh.Serialize(x)

	// createRepresentation <Buffer 96 98 15 35 09 07 b1 ac>
	InstructionCreateRepresentation := [8]uint8{
		0x96, 0x98, 0x15, 0x35, 0x09, 0x07, 0xB1, 0xAC,
	}

	data, err := common.SerializeData(struct {
		Instruction   [8]uint8
		tokenReal     [20]uint8 // [u8; 20], // String, // H160, // real token for synt
		tokenSynt     common.PublicKey
		syntNameLen   uint32
		syntName      string // synt name
		syntSymbolLen uint32
		syntSymbol    string // synt short name
		syntDecimals  uint8  // u8
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
			// mint: mintSynt.publicKey,
			{PubKey: pubMint, IsSigner: false, IsWritable: true},
			// mintData: mintSyntData.publicKey,
			{PubKey: pubMintData, IsSigner: false, IsWritable: true},
			// rent: anchor.web3.SYSVAR_RENT_PUBKEY,
			{PubKey: common.SysVarRentPubkey, IsSigner: false, IsWritable: false},
			// owner: accAdmin.publicKey,
			{PubKey: pubOwner, IsSigner: true, IsWritable: true},
		},
		Data: data,
	}
	/*
		#[derive(Accounts)]
		pub struct CreateRepresentation<'info> {
			#[account(mut)]
			mint: AccountInfo<'info>,
			#[account(init)]
			mint_data: ProgramAccount<'info, MintData>,
			rent: Sysvar<'info, Rent>,
			// #[account(mut, has_one = owner)]
			// pub data: ProgramAccount<'info, DataAccount>,
			#[account(signer)]
			pub owner: AccountInfo<'info>,
		}
	*/

}

/*
028c3b8a9325bb8b71b7d35e49803c373aa62d133abed92c8526180659154cf0
41fbc42ef11ed82cb55a7d2a7e6f42767fcf00fe58c240aeea7f48640edf648e
0f1837831228d223f57acabcca3eea983ed5ece4168031e9ab9509046ef32be1
e01f75fd307aad5c6341642b4d35176800143de97f86e4c75c9fcd5f58cb4371
0002000103f819bb622b45ae71d9665206d824a70c1148ef123597cddfa3a1b3
a8d1e33e8831254aa520250238a19c559e53c90a8ab20f18bea83d3bf6eb0ee4
fb272c5db4000000000000000000000000000000000000000000000000000000
0000000000d6f4e69b75da0e0d1f0e6ca2c07fe4c2f78c114fd7ab1e3a023289
8bc5a7e5d50102020001340000000080969800000000000a0000000000000063
3ac5ebf3ca180cd17e6342f748e46da5f564d775a60b8e1d9b407450d76230
*/

func Test_serializer(t *testing.T) {
	// acc := types.AccountMeta{
	// 	PubKey:     [32]byte{},
	// 	IsSigner:   false,
	// 	IsWritable: false,
	// }

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
	len := hex.DecodedLen(len(src))
	// dst := make([]byte, hex.DecodedLen(len(src)))
	dst := make([]byte, len)
	// dst := [20]byte{}
	n, err := hex.Decode(dst, src)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("[%d]%x\n", len, dst[:n])

	tokenReal := [20]byte{}
	copy(tokenReal[:], dst)

	ixCreateRepresentation := CreateRepresentation(
		pidThisProgram,
		accMintSynt.PublicKey,
		accMintSyntData.PublicKey,
		accAdmin.PublicKey,
		tokenReal, // tokenReal [20]uint8, // [u8; 20], // String, // H160, // real token for synt
		// accMintSynt, // tokenSynt common.PublicKey,
		"Some Synt Name", // syntName string, // synt name
		"SSN",            // syntSymbol string, // synt short name
		2,                // syntDecimals uint8, // u8
	)
	/*
		1234567890123456789012345678901234567890 // token_real: [u8; 20] (b 20)
		d7ad606dbc8c75788e3b3b077ebc327bdfaaf7851b17d992d5d2fcd28bdf87d9 // accMintSynt (b 32)
		0e000000536f6d652053796e74204e616d65 // 'Some Synt Name' (b 18)
		0300000053534e // 'SSN' (b 07)
		02 // decimals (b 01)
	*/

	ixInitializeMintAccount := tokenprog.InitializeMint(
		// ixInitializeMint := InitializeMint(
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

	/*
		03
		fecef077ed0c9fe5b731e885e1d0de023772d6ae6719a6a89b070e7ab1bd0934
		af4b639b7154b66570cd79c5fc74cf5fffedfa6a0c62e73e48e0b3da038a3f0a
		c2dc59a9fbb6d2bf61daaa621176d11b9a4b7eb37e4ac72b6dca40eea1b375ed
		9939b719170b7a6f99d11b98f778738c80d01fd7c69941614b5662bb4441be0c
		2cada82da8bf9581e6f55bb20cf72a86d00fba8fc77c541bf7020af38faefedd
		01f37c044dce311a724f8fd89aa47b3d3cdf83e157e3054c26dcc89bf9176808

		03
		00
		03
		06
		d060f073ef7097477eccf3be371a8226874d37b387a714762f458e7a2a3ce1ff
		81e8a67b5d39cccdd2790b2d4f279d6e2df2ff5b2f3ff812db38ef671ebcd8ce
		fb2bae5aaf706a7cda1864b1c0e1c0469c96c65b01a4d81922669740cf137cc5
		0000000000000000000000000000000000000000000000000000000000000000
		06a7d517192c5c51218cc94c3d4af17f58daee089ba1fd44e3dbd98a00000000
		06ddf6e1d765a193d9cbe146ceeb79ac1cb485ed5f5b37913a8cf5857eff00a9
		a05fed635d7688b88ba4356571af306ce2b3e7e80d3773d53280b722c4904e4c
		03
		03
		02
		00
		02
		34
		00000000
		00ca9a3b00000000
		e803000000000000
		06ddf6e1d765a193d9cbe146ceeb79ac1cb485ed5f5b37913a8cf5857eff00a9
		03
		02
		00
		01
		34
		00000000
		00ca9a3b00000000
		e803000000000000
		9dac74ef70b0a37a8cc6d2b8ebd837b2669b4f125218cf40ef016dbba3d9706a
		05020204430002d060f073ef7097477eccf3be371a8226874d37b387a714762f458e7a2a3ce1ff01d060f073ef7097477eccf3be371a8226874d37b387a714762f458e7a2a3ce1ff
	*/

	require.NoError(t, compareBytes([]byte{1}, []byte{2}))

	// ix.
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
	/*
		06d7253986b0571fb09c9adaf797199954bd81fad9965ab239ced0a200000000 // pidThisProgram
		f819bb622b45ae71d9665206d824a70c1148ef123597cddfa3a1b3a8d1e33e88 // pubAdmin
		95763bdcc47fa1b3 // InstructionHello
		05000000 // len(""World"")
		576f726c64 // "World"
	*/
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
	/*
		01
		328a72d36109f193acc12ed54795450168b915807617a332dc9030a2d5ea957a
		354f253943fa633feec27adb0ae49a292d7c8b91fa4b4c81075b722c625b0c00
		01
		00
		01
		02
		f819bb622b45ae71d9665206d824a70c1148ef123597cddfa3a1b3a8d1e33e88
		06d7253986b0571fb09c9adaf797199954bd81fad9965ab239ced0a200000000
		d6f4e69b75da0e0d1f0e6ca2c07fe4c2f78c114fd7ab1e3a0232898bc5a7e5d5
		01
		01
		03
		00
		01
		00
		8d015c2e6c2ab340088b
		0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20
		06d7253986b0571fb09c9adaf797199954bd81fad9965ab239ced0a200000000
		f819bb622b45ae71d9665206d824a70c1148ef123597cddfa3a1b3a8d1e33e88
		95763bdcc47fa1b3
		05000000
		576f726c64
		0102030405060708090a0b0c0d0e0f1011121314
	*/
}
