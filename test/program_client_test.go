package test

import (
	"fmt"
	"testing"

	"github.com/davecgh/go-spew/spew"
	"github.com/dfuse-io/logging"
	"github.com/gagliardetto/solana-go"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
)

var zlog *zap.Logger
var traceEnabled = logging.IsTraceEnabled("solana-go", "github.com/gagliardetto/solana-go/rpc/ws")

//func init() {
//	logging.Register("github.com/gagliardetto/solana-go/rpc/ws", &zlog)
//}

func Test_SlotSubscribe(t *testing.T) {
	//t.Skip("Never ending test, revisit me to not depend on actual network calls, or hide between env flag")

	//zlog, _ = zap.NewDevelopment()

	sub, err := solana_ws_client.SlotSubscribe()
	require.NoError(t, err)

	data, err := sub.Recv()
	if err != nil {
		fmt.Println("receive an error: ", err)
		return
	}
	fmt.Println("data received: ", data.Parent)
	return
}

func Test_ProgramClient(t *testing.T) {
	program := solana.MustPublicKeyFromBase58("9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin") // serum

	{
		sub, err := solana_ws_client.AccountSubscribe(
			program,
			"",
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
	if false {
		sub, err := solana_ws_client.AccountSubscribeWithOpts(
			program,
			"",
			// You can specify the data encoding of the returned accounts:
			solana.EncodingBase64,
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

func Test_ProgramSubscribe(t *testing.T) {
	//t.Skip("Never ending test, revisit me to not depend on actual network calls, or hide between env flag")

	zlog, _ = zap.NewDevelopment()

	t.Log("Dialing")
	programAccount, err := readAccountFromFile("../target/deploy/eywa_bridge-keypair.json")
	require.NoError(t, err)
	programID1 := programAccount.PublicKey
	//programID := solana.MustPublicKeyFromBase58("DXUDgvk4YH47J2HzRDKAsp5zcrvWDXqsCbD3HTghpyCo")
	//require.Equal(t, programID, programID1)
	sub, err := solana_ws_client.ProgramSubscribe(solana.PublicKey(programID1), "")
	require.NoError(t, err)
	for {
		data, err := sub.Recv()
		if err != nil {
			fmt.Println("receive an error: ", err)
			return
		}
		fmt.Println("data received: ", data.Value.Pubkey)
	}

}
