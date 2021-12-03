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
	BridgePubKey      commonSolana.PublicKey
	RequestId       commonSolana.PublicKey
	Selector		[]uint8
	ReceiveSide    [20]uint8
	OppositeBridge [20]uint8
	ChainId        uint64
}
var OracleRequestEvent OracleRequest

func ByteSlice(b []byte) []byte { return b }


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
						discriminator := originalStringBytes[8:len(originalStringBytes)]
						t.Log("перед десериализацией", common.Bytes2Hex(discriminator))
						err = borsh.Deserialize(&OracleRequestEvent, discriminator)
						require.NoError(t, err)
						t.Log("BridgePubKey", common.Bytes2Hex(OracleRequestEvent.BridgePubKey[:]))
						t.Log("ChainId",OracleRequestEvent.ChainId)
						t.Log(
							"OppositeBridge",
							common.BytesToAddress(OracleRequestEvent.OppositeBridge[:]),
						)
						t.Log("ReceiveSide", common.BytesToAddress(OracleRequestEvent.ReceiveSide[:]))
						t.Log("RequestType", OracleRequestEvent.RequestType)
						t.Log("Selector", string(OracleRequestEvent.Selector))


						//d, err := base64.NewDecoder(prg_log)
						//require.NoError(t, err)
						//t.Log(d)
						//t.Log(string(d))
						//err = solana.Base58.UnmarshalJSON([]byte(prg_log[:]))
					}
				}

			}
		}
	}

}


