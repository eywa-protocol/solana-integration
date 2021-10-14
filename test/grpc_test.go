package test

import (
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"os/signal"
	"sync"
	"sync/atomic"
	"syscall"
	"testing"
	"time"

	"github.com/golang/protobuf/ptypes/empty"
	"github.com/stretchr/testify/assert"
	"gitlab.digiu.ai/blockchainlaboratory/eywa-solana-test/bridge-grpc/proto"
	"google.golang.org/grpc"
	"google.golang.org/grpc/backoff"
	"google.golang.org/grpc/connectivity"
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

func Test_GRPC_SlotStreamReconnect(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	fmt.Println("start connection")
	conn, err = grpc.DialContext(ctx, "localhost:8880",
		grpc.WithInsecure(),
		grpc.WithConnectParams(grpc.ConnectParams{
			Backoff: backoff.Config{
				BaseDelay:  1.0 * time.Second,
				Multiplier: 1.2,
				Jitter:     0.2,
				MaxDelay:   10 * time.Second,
			},
			MinConnectTimeout: 1.0 * time.Second,
		}),
	)
	fmt.Println("start connected")
	assert.NoError(t, err)
	assert.NotNil(t, conn)
	defer func() {
		_ = conn.Close()
	}()

	client := proto.NewBridgeClient(conn)

	assert.NotNil(t, client)

	slotStream, err := client.SubscribeSlotChange(ctx, &empty.Empty{})
	if err != nil {
		fmt.Println("open slotStream error")
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
				break slotLoop
			default:
				if slotStream != nil {
					if slotInfo, err := slotStream.Recv(); err != nil {
						fmt.Println("recv slot info error:", err)
						time.Sleep(1 * time.Second)

						slotStream, err = client.SubscribeSlotChange(ctx, &empty.Empty{})
						if err != nil {
							fmt.Println("reopen slotStream error:", err)
						}
					} else {
						atomic.AddInt32(slotCount, 1)
						fmt.Printf("recv slot inf: %s\n", slotInfo.String())
						// if atomic.LoadInt32(slotCount) >= 10 {
						// 	break slotLoop
						// }
					}
				} else {
					fmt.Println("state:", conn.GetState().String())
					if state := conn.GetState(); state != connectivity.Connecting && state != connectivity.Shutdown {
						conn.Connect()
						func() {
							wCtx, cancel := context.WithTimeout(ctx, 60*time.Second)
							defer cancel()
							conn.WaitForStateChange(wCtx, state)
						}()
					}
					slotStream, err = client.SubscribeSlotChange(ctx, &empty.Empty{})
					if err != nil {
						fmt.Println("reopen slotStream error:", err)
					}
				}
			}
		}
	}()
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop
	cancel()
	wg.Wait()
	err = slotStream.CloseSend()
	assert.NoError(t, err)
}
