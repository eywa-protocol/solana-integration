// package: eywa_solana_grpc
// file: eywa_solana.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as eywa_solana_pb from "./eywa_solana_pb";

interface IBridgeService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    subscribeOracleRequest: IBridgeService_IsubscribeOracleRequest;
}

interface IBridgeService_IsubscribeOracleRequest extends grpc.MethodDefinition<eywa_solana_pb.Empty, eywa_solana_pb.OracleRequest> {
    path: "/eywa_solana_grpc.Bridge/subscribeOracleRequest";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<eywa_solana_pb.Empty>;
    requestDeserialize: grpc.deserialize<eywa_solana_pb.Empty>;
    responseSerialize: grpc.serialize<eywa_solana_pb.OracleRequest>;
    responseDeserialize: grpc.deserialize<eywa_solana_pb.OracleRequest>;
}

export const BridgeService: IBridgeService;

export interface IBridgeServer extends grpc.UntypedServiceImplementation {
    subscribeOracleRequest: grpc.handleServerStreamingCall<eywa_solana_pb.Empty, eywa_solana_pb.OracleRequest>;
}

export interface IBridgeClient {
    subscribeOracleRequest(request: eywa_solana_pb.Empty, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<eywa_solana_pb.OracleRequest>;
    subscribeOracleRequest(request: eywa_solana_pb.Empty, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<eywa_solana_pb.OracleRequest>;
}

export class BridgeClient extends grpc.Client implements IBridgeClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public subscribeOracleRequest(request: eywa_solana_pb.Empty, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<eywa_solana_pb.OracleRequest>;
    public subscribeOracleRequest(request: eywa_solana_pb.Empty, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<eywa_solana_pb.OracleRequest>;
}
