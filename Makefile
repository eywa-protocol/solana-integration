.DEFAULT_GOAL := test

.PHONY: test start-solana

install-solana:
	sh -c "$(curl -sSfL https://release.solana.com/v1.7.8/install)"

start-solana:
	mkdir -p localnet/ledger
	solana-test-validator -r --ledger localnet/ledger

clean:
	rm -rf localnet/

test:
	go test -v ./test -run Test_local_connect
