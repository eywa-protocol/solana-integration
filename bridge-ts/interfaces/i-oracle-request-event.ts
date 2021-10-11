
export interface IOracleRequestEvent {
  requestType: string,
  bridge: Uint8Array,
  requestId: Uint8Array,
  selector: Uint8Array,
  receiveSide: Uint8Array,
  oppositeBridge: Uint8Array,
  chainid: number,
}
