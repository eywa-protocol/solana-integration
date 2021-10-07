// package: eywa_solana_grpc
// file: eywa_solana.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class uinteger256 extends jspb.Message { 
    getId0(): number;
    setId0(value: number): uinteger256;
    getId1(): number;
    setId1(value: number): uinteger256;
    getId2(): number;
    setId2(value: number): uinteger256;
    getId3(): number;
    setId3(value: number): uinteger256;

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
        id0: number,
        id1: number,
        id2: number,
        id3: number,
    }
}

export class uinteger160 extends jspb.Message { 
    getId0(): number;
    setId0(value: number): uinteger160;
    getId1(): number;
    setId1(value: number): uinteger160;
    getId2(): number;
    setId2(value: number): uinteger160;

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
        id0: number,
        id1: number,
        id2: number,
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
    getReceiveSide(): string;
    setReceiveSide(value: string): OracleRequest;
    getOppositeBridge(): string;
    setOppositeBridge(value: string): OracleRequest;
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
        receiveSide: string,
        oppositeBridge: string,
        chainid: number,
    }
}

export class Empty extends jspb.Message { 

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Empty.AsObject;
    static toObject(includeInstance: boolean, msg: Empty): Empty.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Empty, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Empty;
    static deserializeBinaryFromReader(message: Empty, reader: jspb.BinaryReader): Empty;
}

export namespace Empty {
    export type AsObject = {
    }
}
