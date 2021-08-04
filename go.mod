module eywa-solana-tests

go 1.16

require (
	example.com/serializer v0.0.0-00010101000000-000000000000 // indirect
	github.com/portto/solana-go-sdk v0.3.0
	github.com/stretchr/testify v1.7.0
)

replace example.com/serializer => ./solana-serializer
