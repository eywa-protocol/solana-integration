package test

import (
	"context"
	"github.com/davecgh/go-spew/spew"
	"github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/rpc"
	"github.com/gagliardetto/solana-go/rpc/ws"
	"testing"
)

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
			spew.Dump(got)
			t.Log(got.Value.Logs)
		}
	}
	if false {
		// Subscribe to all log events:
		sub, err := client.LogsSubscribe(
			ws.LogsSubscribeFilterAll,
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
			spew.Dump(got)

		}
	}
}
