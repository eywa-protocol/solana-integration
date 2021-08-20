.DEFAULT_GOAL := test

.PHONY: test start-solana

install-solana:
	sh -c "$(curl -sSfL https://release.solana.com/v1.7.8/install)"
	. /home/$USER/.profile

start-solana:
	mkdir -pv localnet/ledger
	solana-test-validator -r --ledger localnet/ledger

clean:
	rm -rf localnet/

test-serializer:
	# go test -v ./test/01_serializer_test.go
	go test -v ./test/01_serializer_test.go -run Test_Receive_request_serializer

test:
	solana program deploy "./target/deploy/eywa_bridge_solana.so"
	go test -v ./test -run Test_Receive_request
	# go test -v ./test
