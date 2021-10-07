// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var eywa_solana_pb = require('./eywa_solana_pb.js');

function serialize_eywa_solana_grpc_Empty(arg) {
  if (!(arg instanceof eywa_solana_pb.Empty)) {
    throw new Error('Expected argument of type eywa_solana_grpc.Empty');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_eywa_solana_grpc_Empty(buffer_arg) {
  return eywa_solana_pb.Empty.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_eywa_solana_grpc_OracleRequest(arg) {
  if (!(arg instanceof eywa_solana_pb.OracleRequest)) {
    throw new Error('Expected argument of type eywa_solana_grpc.OracleRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_eywa_solana_grpc_OracleRequest(buffer_arg) {
  return eywa_solana_pb.OracleRequest.deserializeBinary(new Uint8Array(buffer_arg));
}


var BridgeService = exports.BridgeService = {
  subscribeOracleRequest: {
    path: '/eywa_solana_grpc.Bridge/subscribeOracleRequest',
    requestStream: false,
    responseStream: true,
    requestType: eywa_solana_pb.Empty,
    responseType: eywa_solana_pb.OracleRequest,
    requestSerialize: serialize_eywa_solana_grpc_Empty,
    requestDeserialize: deserialize_eywa_solana_grpc_Empty,
    responseSerialize: serialize_eywa_solana_grpc_OracleRequest,
    responseDeserialize: deserialize_eywa_solana_grpc_OracleRequest,
  },
};

exports.BridgeClient = grpc.makeGenericClientConstructor(BridgeService);
