import * as grpc from "@grpc/grpc-js";

import * as msgHelpers from '../msg-helpers';
import { ASubscription } from './a-subscription';

import type { web3 } from '../../bridge-ts/bridge-relayer-client';
import type {
  // Empty,
  // OracleRequest,
  SlotInfo,
} from "../proto/eywa_solana_pb";
import type Empty from 'google-protobuf/google/protobuf/empty_pb.js';
// console.log(Empty);


export class SlotChangeSubscription extends ASubscription {
  constructor(
    private connection: web3.Connection,
    private call: grpc.ServerWritableStream<Empty, SlotInfo>,
  ) {
    super(
      () => this.connection.onSlotChange(this.handler.bind(this)),
      async (id) => this.connection.removeSlotChangeListener(id),
    );

    call.on('finish', () => this.unsubscribe());
  }

  private handler(si: web3.SlotInfo) {
    const slotInfo = msgHelpers.slotInfoToClass(si);
    // console.log('SlotInfo:', slotInfo.toObject());

    if ( !this.call.write(slotInfo) ) {
      this.unsubscribe();
    }
  }
}
