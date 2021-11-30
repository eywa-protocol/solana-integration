package test

import (
	"context"
	"encoding/hex"
	"fmt"
	"log"
	"testing"

	"github.com/stretchr/testify/require"

	"github.com/portto/solana-go-sdk/client"
	"github.com/portto/solana-go-sdk/common"
	"github.com/portto/solana-go-sdk/types"
)

func BuildIxTestOracleRequest(
	pidThisProgram common.PublicKey,
	requestId common.PublicKey,
	selector []uint8,
	receiveSide [20]uint8,
	oppositeBridge [20]uint8,
	chainId uint64,
	pubSigner common.PublicKey,
) types.Instruction {

	InstructionTestOracleRequest := [8]uint8{
		152, 120, 27, 0, 154, 119, 114, 10,
	}

	data, err := common.SerializeData(struct {
		Instruction    [8]uint8
		requestId      common.PublicKey
		selectorLen    uint32
		selector       []uint8
		receiveSide    [20]uint8
		oppositeBridge [20]uint8
		chainId        uint64
	}{
		Instruction:    InstructionTestOracleRequest,
		requestId:      requestId,
		selectorLen:    uint32(len(selector)),
		selector:       selector,
		receiveSide:    receiveSide,
		oppositeBridge: oppositeBridge,
		chainId:        chainId,
	})
	if err != nil {
		panic(err)
	}

	return types.Instruction{
		ProgramID: pidThisProgram,
		Accounts: []types.AccountMeta{
			{PubKey: pubSigner, IsSigner: true, IsWritable: true},
		},
		Data: data,
	}
}

func Test_oracle_request(t *testing.T) {
	localSolanaUrl = "http://127.0.0.1:8899"
	c = client.NewClient(localSolanaUrl)

	resp, err := c.GetVersion(context.Background())
	require.NoError(t, err)
	t.Log("testnet solana version:", resp.SolanaCore)

	// проверяем наличие деплоя
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

	accIdentity, err := readAccountFromFile("../localnet/ledger/validator-keypair.json")
	if err != nil {
		panic(err)
	}
	fmt.Println("identity:", accIdentity.PublicKey.ToBase58())

	src := []byte("1234567890123456789012345678901234567890")
	decodedLen := hex.DecodedLen(len(src))
	dst := make([]byte, decodedLen)
	n, err := hex.Decode(dst, src)
	if err != nil {
		log.Fatal(err)
	}
	t.Logf("[%d]%x\n", decodedLen, dst[:n])

	receiveSide := [20]byte{}
	copy(receiveSide[:], dst)

	oppositeBridge := [20]byte{}
	copy(oppositeBridge[:], dst)

	accRequestId := types.NewAccount()

	ixTestOracleRequest := BuildIxTestOracleRequest(
		program.PublicKey,
		accRequestId.PublicKey,
		[]byte("123456"), // selector []uint8,
		receiveSide,
		oppositeBridge,
		123, // chainId uint64,
		accIdentity.PublicKey,
	)

	res, err := c.GetRecentBlockhash(context.Background())
	if err != nil {
		log.Fatalf("get recent block hash error, err: %v\n", err)
	}
	t.Log("RecentBlockHash:", res.Blockhash)

	rawTx, err := types.CreateRawTransaction(types.CreateRawTransactionParam{
		Instructions: []types.Instruction{
			ixTestOracleRequest,
		},
		Signers: []types.Account{
			accIdentity,
		},
		FeePayer:        accIdentity.PublicKey,
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
