// package: eywa_solana_grpc
// file: eywa_solana.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as eywa_solana_pb from "./eywa_solana_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";

interface IBridgeService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    subscribeOracleRequest: IBridgeService_IsubscribeOracleRequest;
    testOracleRequest: IBridgeService_ItestOracleRequest;
    subscribeSlotChange: IBridgeService_IsubscribeSlotChange;
}

interface IBridgeService_IsubscribeOracleRequest extends grpc.MethodDefinition<google_protobuf_empty_pb.Empty, eywa_solana_pb.OracleRequest> {
    path: "/eywa_solana_grpc.Bridge/subscribeOracleRequest";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    requestDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
    responseSerialize: grpc.serialize<eywa_solana_pb.OracleRequest>;
    responseDeserialize: grpc.deserialize<eywa_solana_pb.OracleRequest>;
}
interface IBridgeService_ItestOracleRequest extends grpc.MethodDefinition<eywa_solana_pb.OracleRequest, google_protobuf_empty_pb.Empty> {
    path: "/eywa_solana_grpc.Bridge/testOracleRequest";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<eywa_solana_pb.OracleRequest>;
    requestDeserialize: grpc.deserialize<eywa_solana_pb.OracleRequest>;
    responseSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    responseDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
}
interface IBridgeService_IsubscribeSlotChange extends grpc.MethodDefinition<google_protobuf_empty_pb.Empty, eywa_solana_pb.SlotInfo> {
    path: "/eywa_solana_grpc.Bridge/subscribeSlotChange";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    requestDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
    responseSerialize: grpc.serialize<eywa_solana_pb.SlotInfo>;
    responseDeserialize: grpc.deserialize<eywa_solana_pb.SlotInfo>;
}

export const BridgeService: IBridgeService;

export interface IBridgeServer extends grpc.UntypedServiceImplementation {
    subscribeOracleRequest: grpc.handleServerStreamingCall<google_protobuf_empty_pb.Empty, eywa_solana_pb.OracleRequest>;
    testOracleRequest: grpc.handleUnaryCall<eywa_solana_pb.OracleRequest, google_protobuf_empty_pb.Empty>;
    subscribeSlotChange: grpc.handleServerStreamingCall<google_protobuf_empty_pb.Empty, eywa_solana_pb.SlotInfo>;
}

export interface IBridgeClient {
    subscribeOracleRequest(request: google_protobuf_empty_pb.Empty, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<eywa_solana_pb.OracleRequest>;
    subscribeOracleRequest(request: google_protobuf_empty_pb.Empty, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<eywa_solana_pb.OracleRequest>;
    testOracleRequest(request: eywa_solana_pb.OracleRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    testOracleRequest(request: eywa_solana_pb.OracleRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    testOracleRequest(request: eywa_solana_pb.OracleRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    subscribeSlotChange(request: google_protobuf_empty_pb.Empty, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<eywa_solana_pb.SlotInfo>;
    subscribeSlotChange(request: google_protobuf_empty_pb.Empty, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<eywa_solana_pb.SlotInfo>;
}

export class BridgeClient extends grpc.Client implements IBridgeClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public subscribeOracleRequest(request: google_protobuf_empty_pb.Empty, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<eywa_solana_pb.OracleRequest>;
    public subscribeOracleRequest(request: google_protobuf_empty_pb.Empty, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<eywa_solana_pb.OracleRequest>;
    public testOracleRequest(request: eywa_solana_pb.OracleRequest, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public testOracleRequest(request: eywa_solana_pb.OracleRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public testOracleRequest(request: eywa_solana_pb.OracleRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: google_protobuf_empty_pb.Empty) => void): grpc.ClientUnaryCall;
    public subscribeSlotChange(request: google_protobuf_empty_pb.Empty, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<eywa_solana_pb.SlotInfo>;
    public subscribeSlotChange(request: google_protobuf_empty_pb.Empty, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<eywa_solana_pb.SlotInfo>;
}
