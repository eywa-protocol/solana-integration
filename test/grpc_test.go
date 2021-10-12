package test

import (
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc"
	"testing"
)

var (
	conn *grpc.ClientConn
	err  error
)

func Test_GRPC_Client(t *testing.T) {

	conn, err = grpc.Dial("localhost:8089", grpc.WithInsecure())
	require.Nil(t, err)
	require.NotNil(t, conn)
	conn.Connect()
	defer conn.Close()

	state := conn.GetState()
	t.Log(state)
	require.NotNil(t, state.String())
}
