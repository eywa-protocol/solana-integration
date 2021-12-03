import * as grpc from "@grpc/grpc-js";

import {
  // Empty,
  OracleRequest,
  SlotInfo,
} from "./proto/eywa_solana_pb";
import { Empty } from 'google-protobuf/google/protobuf/empty_pb.js';

import { BridgeRelayerClient } from '../bridge-ts/bridge-relayer-client';
import {
  OracleRequestSubscription,
  SlotChangeSubscription,
} from './subscriptions';

import type { IBridgeServer } from './proto/eywa_solana_grpc_pb';
import type { web3 } from '../bridge-ts/bridge-relayer-client';
import { IOracleRequestEvent } from "../bridge-ts/interfaces";

export {
  BridgeService as BridgeServiceDefinition,
  IBridgeServer,
} from './proto/eywa_solana_grpc_pb';

export type Web3Connection = web3.Connection;


// @ts-ignore
export class BridgeServer implements IBridgeServer {
  private bridge: BridgeRelayerClient;

  public static create(connection: Web3Connection): IBridgeServer {
    return new BridgeServer(connection) as unknown as IBridgeServer;
  }

  protected constructor(
    private connection: Web3Connection,
  ) {
    this.bridge = new BridgeRelayerClient(connection);
  }

  async subscribeOracleRequest(
    call: grpc.ServerWritableStream<Empty, OracleRequest>,
  ): Promise<void> {
    (new OracleRequestSubscription(call, this.bridge)).subscribe();
  }

  async subscribeSlotChange(
    call: grpc.ServerWritableStream<Empty, SlotInfo>,
  ): Promise<void> {
    (new SlotChangeSubscription(this.connection, call)).subscribe();

    /*
    console.log(call.getPeer());
    call.eventNames().forEach((evName) => {
      if ( 'symbol' == typeof evName ) {
        console.log('skip symbol:', evName.toString())
      } else {
        console.log(`listen: ${ evName }`);
        call.on(evName, (...args) => console.log(`${ evName }:`, args));
      }
    });
    */
  }

  async testOracleRequest(
    call: grpc.ServerUnaryCall<OracleRequest, Empty>,
    callback: (err: Error, msg: Empty) => void,
  ): Promise<void> {
    const oracleRequest = call.request;
    // console.log(oracleRequest);
    const event: IOracleRequestEvent = {
      requestType: /* string */ oracleRequest.getRequestType(),
      bridge: /* Uint8Array */ oracleRequest.getBridge().getValue() as Uint8Array,
      requestId: /* Uint8Array */ oracleRequest.getRequestId().getValue() as Uint8Array,
      selector: /* Uint8Array */ oracleRequest.getSelector() as Uint8Array,
      receiveSide: /* Uint8Array */ oracleRequest.getReceiveSide().getValue() as Uint8Array,
      oppositeBridge: /* Uint8Array */ oracleRequest.getOppositeBridge().getValue() as Uint8Array,
      chainid: /* number */ oracleRequest.getChainid(),
    };
    this.bridge.test_emitOracleRequest(event);
    callback(null, new Empty());
  }
}
