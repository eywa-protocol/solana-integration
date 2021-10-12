import * as grpc from "@grpc/grpc-js";

import { SlotInfo } from "../proto/eywa_solana_pb";
import { BridgeClient } from '../proto/eywa_solana_grpc_pb';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb.js';


// const urlGrpc = "127.0.0.1:8080";
// const client = new BridgeClient(urlGrpc, grpc.credentials.createInsecure());
const urlGrpc = "solana-hackathon.dev.eywa.fi:443";
const client = new BridgeClient(urlGrpc, grpc.credentials.createSsl());

const empty = new Empty();


async function main() {
  const stream = client.subscribeSlotChange(empty);

  stream.on("data", (data: SlotInfo) => {
    console.log(`[subscribeSlotChange1]: ${JSON.stringify(data.toObject())}`);
  });
  stream.on("error", (...args) => {
    console.log('stream error:', args);
  });
  stream.on("end", () => {
    console.log("[subscribeSlotChange] Done.");
    // process.exit(0);
  });

  stream.on('metadata', (...args) => console.log('[metadata]', args));
  stream.on('status', (...args) => console.log('[status]', args));

  process.on('beforeExit', (code) => {
    console.log(`process beforeExit with code: ${code}`);
    // stream.emit('end');
  });
  setTimeout(() => {
    stream.call?.cancelWithStatus(grpc.status.OK, 'goodbye');
  }, 10 * 1000);
  setTimeout(() => {
    console.log('goodbye');
  }, 30 * 1000);
}

process.on('uncaughtException', (err) => {
  console.log(`process on uncaughtException error: ${err}`);
});

process.on('unhandledRejection', (err) => {
  console.log(`process on unhandledRejection error: ${err}`);
});


main().then(console.log);
