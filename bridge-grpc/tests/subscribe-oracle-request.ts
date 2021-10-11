import * as grpc from "@grpc/grpc-js";

import { Empty } from 'google-protobuf/google/protobuf/empty_pb.js';
import {
  // Empty,
  OracleRequest,
} from "../proto/eywa_solana_pb";
import { BridgeClient } from '../proto/eywa_solana_grpc_pb';
import * as msgHelpers from '../msg-helpers';


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

  setTimeout(() => {
    const bytes32 = Buffer.from('1122334455667788990011223344556677889900112233445566778899001122', 'hex');
    const bytes20 = Buffer.from('1122334455667788990011223344556677889900', 'hex');

    client.testOracleRequest(msgHelpers.oracleRequestToClass({
      requestType: /* string */ 'setRequest',
      bridge: /* Uint8Array */ bytes32,
      requestId: /* Uint8Array */ bytes32,
      selector: /* Uint8Array */ Buffer.from('some random data'),
      receiveSide: /* Uint8Array */ bytes20,
      oppositeBridge: /* Uint8Array */ bytes20,
      chainid: /* number */ 123,
    }), (err, resp) => {
      if ( err ) {
        console.log(err);
        return;
      }
      console.log(resp);
    });
  }, 5 * 1000);
}

process.on("uncaughtException", (err) => {
  console.log(err);
  console.log(`process on uncaughtException error: ${err}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err);
  console.log(`process on unhandledRejection error: ${err}`);
});

main().then(console.log);
