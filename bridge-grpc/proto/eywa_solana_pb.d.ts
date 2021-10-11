// package: eywa_solana_grpc
// file: eywa_solana.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";

export class uinteger256 extends jspb.Message { 
    getValue(): Uint8Array | string;
    getValue_asU8(): Uint8Array;
    getValue_asB64(): string;
    setValue(value: Uint8Array | string): uinteger256;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): uinteger256.AsObject;
    static toObject(includeInstance: boolean, msg: uinteger256): uinteger256.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: uinteger256, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): uinteger256;
    static deserializeBinaryFromReader(message: uinteger256, reader: jspb.BinaryReader): uinteger256;
}

export namespace uinteger256 {
    export type AsObject = {
        value: Uint8Array | string,
    }
}

export class uinteger160 extends jspb.Message { 
    getValue(): Uint8Array | string;
    getValue_asU8(): Uint8Array;
    getValue_asB64(): string;
    setValue(value: Uint8Array | string): uinteger160;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): uinteger160.AsObject;
    static toObject(includeInstance: boolean, msg: uinteger160): uinteger160.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: uinteger160, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): uinteger160;
    static deserializeBinaryFromReader(message: uinteger160, reader: jspb.BinaryReader): uinteger160;
}

export namespace uinteger160 {
    export type AsObject = {
        value: Uint8Array | string,
    }
}

export class OracleRequest extends jspb.Message { 
    getRequestType(): string;
    setRequestType(value: string): OracleRequest;

    hasBridge(): boolean;
    clearBridge(): void;
    getBridge(): uinteger256 | undefined;
    setBridge(value?: uinteger256): OracleRequest;

    hasRequestId(): boolean;
    clearRequestId(): void;
    getRequestId(): uinteger256 | undefined;
    setRequestId(value?: uinteger256): OracleRequest;
    getSelector(): Uint8Array | string;
    getSelector_asU8(): Uint8Array;
    getSelector_asB64(): string;
    setSelector(value: Uint8Array | string): OracleRequest;

    hasReceiveSide(): boolean;
    clearReceiveSide(): void;
    getReceiveSide(): uinteger160 | undefined;
    setReceiveSide(value?: uinteger160): OracleRequest;

    hasOppositeBridge(): boolean;
    clearOppositeBridge(): void;
    getOppositeBridge(): uinteger160 | undefined;
    setOppositeBridge(value?: uinteger160): OracleRequest;
    getChainid(): number;
    setChainid(value: number): OracleRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): OracleRequest.AsObject;
    static toObject(includeInstance: boolean, msg: OracleRequest): OracleRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: OracleRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): OracleRequest;
    static deserializeBinaryFromReader(message: OracleRequest, reader: jspb.BinaryReader): OracleRequest;
}

export namespace OracleRequest {
    export type AsObject = {
        requestType: string,
        bridge?: uinteger256.AsObject,
        requestId?: uinteger256.AsObject,
        selector: Uint8Array | string,
        receiveSide?: uinteger160.AsObject,
        oppositeBridge?: uinteger160.AsObject,
        chainid: number,
    }
}

export class SlotInfo extends jspb.Message { 
    getSlot(): number;
    setSlot(value: number): SlotInfo;
    getParent(): number;
    setParent(value: number): SlotInfo;
    getRoot(): number;
    setRoot(value: number): SlotInfo;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SlotInfo.AsObject;
    static toObject(includeInstance: boolean, msg: SlotInfo): SlotInfo.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SlotInfo, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SlotInfo;
    static deserializeBinaryFromReader(message: SlotInfo, reader: jspb.BinaryReader): SlotInfo;
}

export namespace SlotInfo {
    export type AsObject = {
        slot: number,
        parent: number,
        root: number,
    }
}
