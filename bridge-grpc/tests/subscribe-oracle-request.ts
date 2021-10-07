import * as grpc from "@grpc/grpc-js";

import { Empty, OracleRequest } from "../proto/eywa_solana_pb";
import { BridgeClient } from '../proto/eywa_solana_grpc_pb';


const client = new BridgeClient("127.0.0.1:8080", grpc.credentials.createInsecure());

const empty = new Empty();

async function main() {
  const stream = client.subscribeOracleRequest(empty);

  stream.on("data", (data: OracleRequest) => {
    console.log(`[subscribeOracleRequest]: ${JSON.stringify(data.toObject())}`);
  });
  stream.on("end", () => {
    console.log("[subscribeOracleRequest] Done.");
    process.exit(0);
  });
}

process.on("uncaughtException", (err) => {
  console.log(`process on uncaughtException error: ${err}`);
});

process.on("unhandledRejection", (err) => {
  console.log(`process on unhandledRejection error: ${err}`);
});

main().then(console.log);
