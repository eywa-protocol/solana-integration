import { BN, web3 } from '@project-serum/anchor';
// import {
//   Token,
//   TOKEN_PROGRAM_ID,
//   ASSOCIATED_TOKEN_PROGRAM_ID,
// } from "@solana/spl-token";

import BridgeFactory from './';

import type { Bridge } from './prg-bridge';
import type { IOracleRequestEvent } from '../bridge-ts//interfaces';
// import { OracleRequest } from '../bridge-grpc/proto/eywa_solana_pb';

export /* type */ { web3 } from '@project-serum/anchor';

type EventCallback = (event: any, slot: number) => void;

// export type TSubscriptionId = number & {
//   unsubscribe: () => Promise<void>;
// };

// export interface IOracleRequestEvent {
// }


export class BridgeRelayerClient {
  private bridge: Bridge;

  private _eventListeners: Map<string, Array<number>>;
  private _eventCallbacks: Map<number, [string, EventCallback]>;

  constructor(
    connection: web3.Connection,
  ) {
    this.bridge = (new BridgeFactory(connection)).bridge;
    this._eventCallbacks = new Map();
    this._eventListeners = new Map();
  }

  // public get pidSynthesis() {}
  // public get pidBridge() {}

  public subscribeOracleRequest(
    handler: (ev: IOracleRequestEvent) => void,
  ): number {
    const listenerId = this.bridge.addEventListener('OracleRequest', handler);
    if (!('OracleRequest' in this._eventCallbacks)) {
      this._eventListeners.set('OracleRequest', []);
    }
    this._eventListeners.set(
      'OracleRequest',
      (this._eventListeners.get('OracleRequest') ?? []).concat(listenerId),
    );
    this._eventCallbacks.set(listenerId, ['OracleRequest', handler]);

    return listenerId;
  }

  public unsubscribeBridgeEvent(subscriptionId: number) {
    return this.bridge.removeEventListener(subscriptionId);
  }

  test_emitOracleRequest(oracleRequest: IOracleRequestEvent) {
    const allListeners = this._eventListeners.get('OracleRequest');
    if (allListeners) {
      allListeners.forEach((listener) => {
        const listenerCb = this._eventCallbacks.get(listener);
        if (listenerCb) {
          const [, callback] = listenerCb;
          callback(oracleRequest, null);
        }
      });
    }

    // this.bridge.test_emitOracleRequest(oracleRequest);
  }
}
