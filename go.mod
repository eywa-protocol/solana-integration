module gitlab.digiu.ai/blockchainlaboratory/eywa-solana-tests

go 1.16

require (
	example.com/serializer v0.0.0-00010101000000-000000000000
	github.com/golang/protobuf v1.5.2
	github.com/portto/solana-go-sdk v0.3.0
	github.com/stretchr/testify v1.7.0
	golang.org/x/net v0.0.0-20211011170408-caeb26a5c8c0 // indirect
	google.golang.org/grpc v1.41.0
	google.golang.org/protobuf v1.26.0
)

replace example.com/serializer => ./solana-serializer
