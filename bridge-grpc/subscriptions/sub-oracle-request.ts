import * as grpc from "@grpc/grpc-js";

import * as msgHelpers from '../msg-helpers';
import { ASubscription } from './a-subscription';

import type { IOracleRequestEvent } from '../../bridge-ts//interfaces';
import type { BridgeRelayerClient } from '../../bridge-ts/bridge-relayer-client';
import type {
  // Empty,
  OracleRequest,
  // SlotInfo,
} from "../proto/eywa_solana_pb";
import type Empty from 'google-protobuf/google/protobuf/empty_pb.js';
// console.log(Empty);


export class OracleRequestSubscription extends ASubscription {
  constructor(
    private call: grpc.ServerWritableStream<Empty, OracleRequest>,
    private bridge: BridgeRelayerClient,
  ) {
    super(
      () => this.bridge.subscribeOracleRequest(this.handler.bind(this)),
      async (id) => this.bridge.unsubscribeBridgeEvent(id),
    );
    call.on('finish', () => this.unsubscribe());
  }

  private handler(event: IOracleRequestEvent) {
    const oracleRequest = msgHelpers.oracleRequestToClass(event);
    // console.log('SlotInfo:', slotInfo.toObject());

    if ( !this.call.write(oracleRequest) ) {
      this.unsubscribe();
    }
  }
}
