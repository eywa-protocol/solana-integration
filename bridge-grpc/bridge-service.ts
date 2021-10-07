import * as grpc from "@grpc/grpc-js";

import { Empty, OracleRequest } from "./proto/eywa_solana_pb";

import type { IBridgeServer } from './proto/eywa_solana_grpc_pb';

export { BridgeService, IBridgeServer } from './proto/eywa_solana_grpc_pb';


// @ts-ignore
export class BridgeServer implements IBridgeServer {
  async subscribeOracleRequest(
    call: grpc.ServerWritableStream<Empty, OracleRequest>,
  ): Promise<void> {
    const ev = new OracleRequest();
    console.log(ev.toObject());

    call.write(ev);
    // call.end();
  }
}
