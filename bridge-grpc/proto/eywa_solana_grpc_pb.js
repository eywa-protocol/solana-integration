// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var eywa_solana_pb = require('./eywa_solana_pb.js');
var google_protobuf_empty_pb = require('google-protobuf/google/protobuf/empty_pb.js');

function serialize_eywa_solana_grpc_OracleRequest(arg) {
  if (!(arg instanceof eywa_solana_pb.OracleRequest)) {
    throw new Error('Expected argument of type eywa_solana_grpc.OracleRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_eywa_solana_grpc_OracleRequest(buffer_arg) {
  return eywa_solana_pb.OracleRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_eywa_solana_grpc_SlotInfo(arg) {
  if (!(arg instanceof eywa_solana_pb.SlotInfo)) {
    throw new Error('Expected argument of type eywa_solana_grpc.SlotInfo');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_eywa_solana_grpc_SlotInfo(buffer_arg) {
  return eywa_solana_pb.SlotInfo.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_google_protobuf_Empty(arg) {
  if (!(arg instanceof google_protobuf_empty_pb.Empty)) {
    throw new Error('Expected argument of type google.protobuf.Empty');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_google_protobuf_Empty(buffer_arg) {
  return google_protobuf_empty_pb.Empty.deserializeBinary(new Uint8Array(buffer_arg));
}


var BridgeService = exports.BridgeService = {
  subscribeOracleRequest: {
    path: '/eywa_solana_grpc.Bridge/subscribeOracleRequest',
    requestStream: false,
    responseStream: true,
    requestType: google_protobuf_empty_pb.Empty,
    responseType: eywa_solana_pb.OracleRequest,
    requestSerialize: serialize_google_protobuf_Empty,
    requestDeserialize: deserialize_google_protobuf_Empty,
    responseSerialize: serialize_eywa_solana_grpc_OracleRequest,
    responseDeserialize: deserialize_eywa_solana_grpc_OracleRequest,
  },
  testOracleRequest: {
    path: '/eywa_solana_grpc.Bridge/testOracleRequest',
    requestStream: false,
    responseStream: false,
    requestType: eywa_solana_pb.OracleRequest,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_eywa_solana_grpc_OracleRequest,
    requestDeserialize: deserialize_eywa_solana_grpc_OracleRequest,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
  subscribeSlotChange: {
    path: '/eywa_solana_grpc.Bridge/subscribeSlotChange',
    requestStream: false,
    responseStream: true,
    requestType: google_protobuf_empty_pb.Empty,
    responseType: eywa_solana_pb.SlotInfo,
    requestSerialize: serialize_google_protobuf_Empty,
    requestDeserialize: deserialize_google_protobuf_Empty,
    responseSerialize: serialize_eywa_solana_grpc_SlotInfo,
    responseDeserialize: deserialize_eywa_solana_grpc_SlotInfo,
  },
};

exports.BridgeClient = grpc.makeGenericClientConstructor(BridgeService);
