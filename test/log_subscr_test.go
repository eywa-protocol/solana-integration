package test

import (
	"context"
	"encoding/base64"
	"github.com/ethereum/go-ethereum/common"
	"github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/rpc"
	"github.com/gagliardetto/solana-go/rpc/ws"
	"github.com/near/borsh-go"
	commonSolana "github.com/portto/solana-go-sdk/common"
	"github.com/stretchr/testify/require"
	"strings"
	"testing"
)

type OracleRequest struct {
	RequestType    string
	BridgePubKey   commonSolana.PublicKey
	RequestId      commonSolana.PublicKey
	Selector       []uint8
	ReceiveSide    [20]uint8
	OppositeBridge [20]uint8
	ChainId        uint64
}

var event OracleRequest

func TestLogSubscribe(t *testing.T) {
	client, err := ws.Connect(context.Background(), rpc.LocalNet_WS)
	if err != nil {
		panic(err)
	}
	defer client.Close()
	program := solana.MustPublicKeyFromBase58("DXUDgvk4YH47J2HzRDKAsp5zcrvWDXqsCbD3HTghpyCo") // bridge

	{
		// Subscribe to log events that mention the provided pubkey:
		sub, err := client.LogsSubscribeMentions(
			program,
			rpc.CommitmentRecent,
		)
		if err != nil {
			panic(err)
		}
		defer sub.Unsubscribe()

		for {
			got, err := sub.Recv()
			if err != nil {
				panic(err)
			}
			//spew.Dump(got)
			//t.Log(got.Value.Logs)
			decodedBinary := got.Value.Logs //Account.Data.GetBinary()
			if decodedBinary != nil {
				//spew.Dump(decodedBinary)
				//t.Log(decodedBinary)
				for _, st := range decodedBinary {
					if strings.Contains(st, "Program log: ") {
						prg_log := st[13:len(st)]
						t.Log("прилетело", prg_log)
						originalStringBytes, err := base64.StdEncoding.DecodeString(prg_log)
						if err != nil {
							t.Fatalf("Some error occured during base64 decode. Error %s", err.Error())
						}
						discriminator := originalStringBytes[8:]
						t.Log("перед десериализацией discriminator:", common.Bytes2Hex(discriminator))
						err = borsh.Deserialize(&event, discriminator)
						require.NoError(t, err)
						t.Log("BridgePubKey", common.Bytes2Hex(event.OppositeBridge[:]))
						t.Log("ChainId", event.ChainId)
						t.Log(
							"OppositeBridge",
							common.BytesToAddress(event.OppositeBridge[:]),
						)
						t.Log("ReceiveSide", common.BytesToAddress(event.ReceiveSide[:]))
						t.Log("RequestType", event.RequestType)
						t.Log("Selector", string(event.Selector))

					}
				}

			}
		}
	}

}
