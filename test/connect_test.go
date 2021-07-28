package test

import (
	"context"
	"fmt"
	"testing"

	"github.com/portto/solana-go-sdk/client"
	"github.com/stretchr/testify/require"
)

var c *client.Client
var localSolanaUrl string

func init() {
	c = client.NewClient(client.TestnetRPCEndpoint)
	localSolanaUrl = "http://127.0.0.1:8899"
}

func Test_testnet_connect(t *testing.T) {
	resp, err := c.GetVersion(context.Background())
	require.NoError(t, err)
	fmt.Println("testnet solana version:", resp.SolanaCore)
}

func Test_local_connect(t *testing.T) {
	local_client := client.NewClient(localSolanaUrl)
	resp, err := local_client.GetVersion(context.Background())
	require.NoError(t, err)
	fmt.Println("local solana version:", resp.SolanaCore)
}
