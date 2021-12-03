import {
  // Empty,
  OracleRequest,
  SlotInfo,
  uinteger256,
  uinteger160,
} from "./proto/eywa_solana_pb";

import type { IOracleRequestEvent } from '../bridge-ts/interfaces';


export function slotInfoToClass({ root, parent, slot }: SlotInfo.AsObject) {
  const slotInfo = new SlotInfo();
  slotInfo.setRoot(root);
  slotInfo.setParent(parent);
  slotInfo.setSlot(slot);
  return slotInfo;
}

/*
  private handler(event: OracleRequest) {
    const oracleRequest = msgHelpers.oracleRequestToClass(event);
*/
// export function oracleRequestToClass(obj: OracleRequest.AsObject) {
export function oracleRequestToClass(obj: IOracleRequestEvent): OracleRequest {
  const oracleRequest = new OracleRequest();
  const bridge = new uinteger256();
  bridge.setValue(obj.bridge);
  oracleRequest.setBridge(bridge);
  const requestId = new uinteger256();
  requestId.setValue(obj.bridge);
  oracleRequest.setRequestId(requestId);
  oracleRequest.setChainid(obj.chainid);
  const oppositeBridge = new uinteger160();
  oppositeBridge.setValue(obj.oppositeBridge);
  oracleRequest.setOppositeBridge(oppositeBridge);
  const receiveSide = new uinteger160();
  receiveSide.setValue(obj.receiveSide);
  oracleRequest.setReceiveSide(receiveSide);
  oracleRequest.setRequestType(obj.requestType);
  oracleRequest.setSelector(obj.selector);
  return oracleRequest;
}
