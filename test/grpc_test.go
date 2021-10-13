package test

import (
	"context"
	"errors"
	"fmt"
	"io"
	"sync"
	"sync/atomic"
	"testing"

	"github.com/golang/protobuf/ptypes/empty"
	"github.com/stretchr/testify/assert"
	"gitlab.digiu.ai/blockchainlaboratory/eywa-solana-test/bridge-grpc/proto"
	"google.golang.org/grpc"
)

var (
	conn *grpc.ClientConn
	err  error
)

func Test_GRPC_SlotStream(t *testing.T) {

	conn, err = grpc.Dial("localhost:8880", grpc.WithInsecure())
	assert.NoError(t, err)
	assert.NotNil(t, conn)
	defer func() {
		_ = conn.Close()
	}()

	client := proto.NewBridgeClient(conn)

	assert.NotNil(t, client)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	slotStream, err := client.SubscribeSlotChange(ctx, &empty.Empty{})
	if err != nil {
		t.Fatal("open slotStream error")
	}

	slotCount := new(int32)
	wg := new(sync.WaitGroup)
	wg.Add(1)
	go func() {
		defer wg.Done()
	slotLoop:
		for {
			select {
			case <-ctx.Done():
				fmt.Println("context done")
				break
			default:
				if slotInfo, err := slotStream.Recv(); errors.Is(err, io.EOF) {
					fmt.Println("stream eof")
					break slotLoop
				} else if err != nil {
					fmt.Printf("recv slot info error: %v\n", err)
				} else {
					atomic.AddInt32(slotCount, 1)
					fmt.Printf("recv slot inf: %s\n", slotInfo.String())
					if atomic.LoadInt32(slotCount) >= 10 {
						break slotLoop
					}
				}
			}
		}
	}()
	wg.Wait()
	err = slotStream.CloseSend()
	assert.NoError(t, err)
	assert.Equal(t, int32(10), atomic.LoadInt32(slotCount))
}
