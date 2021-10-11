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

grpc-build:
	docker build -f .k8s/docker/Dockerfile-bridge-grpc -t eywa-solana-bridge-grpc .

grpc-start:
	docker run --rm --name eywa-solana-bridge-grpc -t -p 127.0.0.1:8080:8080 -p 127.0.0.1:8081:8081 eywa-solana-bridge-grpc:latest

grpc-stop:
	docker stop eywa-solana-bridge-grpc

test-serializer:
	# go test -v ./test/01_serializer_test.go
	go test -v ./test/01_serializer_test.go -run Test_Receive_request_serializer

test:
	solana program deploy "./target/deploy/eywa_bridge_solana.so"
	go test -v ./test -run Test_Receive_request
	# go test -v ./test
