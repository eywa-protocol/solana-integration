import * as grpc from "@grpc/grpc-js";

import healthServer from "./healthcheck-server";
import { BridgeServiceDefinition, BridgeServer } from "./bridge-service";
import { web3 } from '../bridge-ts/bridge-relayer-client';

// import type { IBridgeServer, Web3Connection } from "./bridge-service";


/*
  http://185.132.176.254:8899
  ws://185.132.176.254:8900
*/
const envEndpoint = process?.env?.CNN_URL;
const endpoint = envEndpoint || 'https://api.testnet.solana.com';
// const endpoint = 'https://api.devnet.solana.com';
// const endpoint = 'http://185.132.176.254:8899';
// const config: web3.ConnectionConfig = {};
const config: web3.Commitment = 'confirmed';
const connection = new web3.Connection(endpoint, config);


function main() {
  const server = new grpc.Server();
  server.addService(BridgeServiceDefinition, BridgeServer.create(connection));

  const onBind = () => {
    server.start();
    healthServer.listen(8081);
  };
web3.PublicKey.default
  server.bindAsync(
    '0.0.0.0:8080',
    grpc.ServerCredentials.createInsecure(),
    onBind,
  );
}


process.on("uncaughtException", (err) => {
  console.log(err);
  console.log(`process on uncaughtException error: ${err}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err);
  console.log(`process on unhandledRejection error: ${err}`);
});

main();
