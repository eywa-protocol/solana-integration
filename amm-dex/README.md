# AMM-DEX

Solana amm-dex implementation based on https://spl.solana.com/token-swap.

## Requirements

For building and testing you can use Solana Tool Suite. 
It contains 'solana-test-validator' that used in integration tests. 
See the [CLI installation instructions](https://docs.solana.com/cli/install-solana-cli-tools).

## Building

To build program, you can use next commands from `./program/`:

```shell
cargo build-bpf
```

## Testing

### Unit tests

Run unit tests from `./program/` using:

```sh
cargo test
```

### Integration tests

From `./js`, install the required modules:

```sh
npm i
```

Then run all tests:

```sh
npm run start-with-test-validator
```