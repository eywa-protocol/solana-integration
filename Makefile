.DEFAULT_GOAL := test

.PHONY: test start-solana

install-solana:
	sh -c "$(curl -sSfL https://release.solana.com/v1.7.11/install)"
	. $HOME/.profile

start-solana:
	mkdir -pv localnet/ledger
	solana-test-validator -r --ledger localnet/ledger

clean:
	rm -rf localnet/

grpc-build:
	docker build -f .k8s/docker/Dockerfile-bridge-grpc -t eywa-solana-bridge-grpc .

grpc-start:
	docker run --rm --name eywa-solana-bridge-grpc -t -p 127.0.0.1:8880:8080 -p 127.0.0.1:8881:8081 eywa-solana-bridge-grpc:latest

grpc-stop:
	docker stop eywa-solana-bridge-grpc

admin-balance-devnet:
	solana balance -C keys/config-devnet.yml HFX5NfespGwHWVG1ixhbz1Yea64RD92Q6SsUfwvHow7n

admin-balance-testnet:
	solana balance -C keys/config-testnet.yml HFX5NfespGwHWVG1ixhbz1Yea64RD92Q6SsUfwvHow7n

admin-balance-local:
	solana balance -C keys/config-local.yml HFX5NfespGwHWVG1ixhbz1Yea64RD92Q6SsUfwvHow7n

admin-airdrop-devnet:
	solana airdrop -C keys/config-devnet.yml 1

admin-airdrop-testnet:
	solana airdrop -C keys/config-testnet.yml 1

admin-airdrop-local:
	solana airdrop -C keys/config-local.yml 200

deploy-bridge-devnet:
	solana program deploy -v -C keys/config-devnet.yml --max-len 2000000 --program-id "./target/deploy/eywa_bridge-keypair.json" "./target/deploy/eywa_bridge.so"

deploy-bridge-testnet:
	solana program deploy -v -C keys/config-testnet.yml --max-len 2000000 --program-id "./target/deploy/eywa_bridge-keypair.json" "./target/deploy/eywa_bridge.so"

redeploy-bridge-devnet:
	solana program deploy -v -C keys/config-devnet.yml "./target/deploy/eywa_bridge.so"

redeploy-bridge-testnet:
	solana program deploy -v -C keys/config-testnet.yml "./target/deploy/eywa_bridge.so"

deploy-bridge-local:
	solana program deploy -v -C keys/config-local.yml --max-len 2000000 --program-id "./target/deploy/eywa_bridge-keypair.json" "./target/deploy/eywa_bridge.so"

deploy-portal-devnet:
	solana program deploy -v -C keys/config-devnet.yml --max-len 3000000 --program-id "./target/deploy/eywa_portal_synthesis-keypair.json" "./target/deploy/eywa_portal_synthesis.so"

deploy-portal-testnet:
	solana program deploy -v -C keys/config-testnet.yml --max-len 3000000 --program-id "./target/deploy/eywa_portal_synthesis-keypair.json" "./target/deploy/eywa_portal_synthesis.so"

redeploy-portal-devnet:
	solana program deploy -v -C keys/config-devnet.yml "./target/deploy/eywa_portal_synthesis.so"

redeploy-portal-testnet:
	solana program deploy -v -C keys/config-testnet.yml "./target/deploy/eywa_portal_synthesis.so"

deploy-portal-local:
	solana program deploy -v -C keys/config-local.yml --max-len 3000000 --program-id "./target/deploy/eywa_portal_synthesis-keypair.json" "./target/deploy/eywa_portal_synthesis.so"

deploy-faucet-devnet:
	solana program deploy -v -C keys/config-devnet.yml --max-len 2000000 --program-id "./target/deploy/test_token_faucet-keypair.json" "./target/deploy/test_token_faucet.so"

deploy-faucet-testnet:
	solana program deploy -v -C keys/config-testnet.yml --max-len 2000000 --program-id "./target/deploy/test_token_faucet-keypair.json" "./target/deploy/test_token_faucet.so"

deploy-faucet-local:
	solana program deploy -v -C keys/config-local.yml --max-len 2000000 --program-id "./target/deploy/test_token_faucet-keypair.json" "./target/deploy/test_token_faucet.so"

init-local: init-js deploy-solana-local configure-solana-contracts-local

deploy-solana-local:
	solana airdrop -C keys/config-local.yml 200
	solana program deploy -v -C keys/config-local.yml --max-len 2000000 --program-id "./target/deploy/eywa_bridge-keypair.json" "./target/deploy/eywa_bridge.so"
	solana program deploy -v -C keys/config-local.yml --max-len 3000000 --program-id "./target/deploy/eywa_portal_synthesis-keypair.json" "./target/deploy/eywa_portal_synthesis.so"
	solana program deploy -v -C keys/config-local.yml --max-len 2000000 --program-id "./target/deploy/test_token_faucet-keypair.json" "./target/deploy/test_token_faucet.so"

init-js:
	npm i -g @project-serum/anchor-cli
	npm i
	npm test

configure-solana-contracts-local:
	npm run deploy:init:local
	npm run set:owner:local
	npm run token:init:local
	npm run token:init:local2




test-serializer:
	# go test -v ./test/01_serializer_test.go
	go test -v ./test/01_serializer_test.go -run Test_Receive_request_serializer

test:
	solana program deploy "./target/deploy/eywa_bridge.so"
	go test -v ./test -run Test_Receive_request
	# go test -v ./test

gen_proto:
	protoc --proto_path=bridge-grpc/proto --go_out=bridge-grpc/proto --go_opt=paths=source_relative bridge-grpc/proto/eywa_solana.proto --go-grpc_out=bridge-grpc/proto --go-grpc_opt=paths=source_relative bridge-grpc/proto/eywa_solana.proto
