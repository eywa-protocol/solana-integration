# Eywa Solana Test - eywa relayer solana integration test repo


### How to use

run in separate consoles

#### 1 run local solana instance
```
make start-solana

```

#### 2 watch local solana instance logs

```
 solana logs -u localhost
```

#### 3 airdrop to admin and deploy solana bridge program
```
make admin-airdrop-local
make admin-airdrop-local
```

#### 4 start listen to solana events
```
go test -v ./test -run TestLogSubscribe

```

#### 5 emit event on solana side

```
go test -v ./test -run Test_oracle_request count=1

```

#### 6 go to relayer repo and run ethereum simulated contract backend to call Ethereum contract with received from solana calldata:

```

git clone -b solana --single-branch git@gitlab.digiu.ai:blockchainlaboratory/eywa-p2p-bridge.git
cd eywa-p2p-bridge
go test -v ./test/sim -run TestCallBridgeOnSolanaEvent

```
After running 6 , run 5 to emit new solana program event




### Running JavaScript/TypeScript Tests
```
npm i
npm test
```

### Running Go Tests
```
make install-solana
make start-solana
make test
```
