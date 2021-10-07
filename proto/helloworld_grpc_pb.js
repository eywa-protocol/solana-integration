// GENERATED CODE -- DO NOT EDIT!

// Original file comments:
// Copyright 2015 gRPC authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
'use strict';
var grpc = require('@grpc/grpc-js');
var helloworld_pb = require('./helloworld_pb.js');
var google_protobuf_any_pb = require('google-protobuf/google/protobuf/any_pb.js');

function serialize_helloworld_BridgeMsg(arg) {
  if (!(arg instanceof helloworld_pb.BridgeMsg)) {
    throw new Error('Expected argument of type helloworld.BridgeMsg');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_helloworld_BridgeMsg(buffer_arg) {
  return helloworld_pb.BridgeMsg.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_helloworld_HelloReply(arg) {
  if (!(arg instanceof helloworld_pb.HelloReply)) {
    throw new Error('Expected argument of type helloworld.HelloReply');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_helloworld_HelloReply(buffer_arg) {
  return helloworld_pb.HelloReply.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_helloworld_PortalSynthesysMsg(arg) {
  if (!(arg instanceof helloworld_pb.PortalSynthesysMsg)) {
    throw new Error('Expected argument of type helloworld.PortalSynthesysMsg');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_helloworld_PortalSynthesysMsg(buffer_arg) {
  return helloworld_pb.PortalSynthesysMsg.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_helloworld_Request(arg) {
  if (!(arg instanceof helloworld_pb.Request)) {
    throw new Error('Expected argument of type helloworld.Request');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_helloworld_Request(buffer_arg) {
  return helloworld_pb.Request.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_helloworld_SynthesisMsg(arg) {
  if (!(arg instanceof helloworld_pb.SynthesisMsg)) {
    throw new Error('Expected argument of type helloworld.SynthesisMsg');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_helloworld_SynthesisMsg(buffer_arg) {
  return helloworld_pb.SynthesisMsg.deserializeBinary(new Uint8Array(buffer_arg));
}


// The greeting service definition.
var GreeterService = exports.GreeterService = {
  // Sends a greeting
sayHello: {
    path: '/helloworld.Greeter/SayHello',
    requestStream: false,
    responseStream: false,
    requestType: helloworld_pb.Request,
    responseType: helloworld_pb.HelloReply,
    requestSerialize: serialize_helloworld_Request,
    requestDeserialize: deserialize_helloworld_Request,
    responseSerialize: serialize_helloworld_HelloReply,
    responseDeserialize: deserialize_helloworld_HelloReply,
  },
  sayHello2: {
    path: '/helloworld.Greeter/sayHello2',
    requestStream: false,
    responseStream: true,
    requestType: helloworld_pb.Request,
    responseType: helloworld_pb.HelloReply,
    requestSerialize: serialize_helloworld_Request,
    requestDeserialize: deserialize_helloworld_Request,
    responseSerialize: serialize_helloworld_HelloReply,
    responseDeserialize: deserialize_helloworld_HelloReply,
  },
};

exports.GreeterClient = grpc.makeGenericClientConstructor(GreeterService);
var PortalService = exports.PortalService = {
  subscribe_portal: {
    path: '/helloworld.Portal/subscribe_portal',
    requestStream: false,
    responseStream: true,
    requestType: helloworld_pb.Request,
    responseType: helloworld_pb.PortalSynthesysMsg,
    requestSerialize: serialize_helloworld_Request,
    requestDeserialize: deserialize_helloworld_Request,
    responseSerialize: serialize_helloworld_PortalSynthesysMsg,
    responseDeserialize: deserialize_helloworld_PortalSynthesysMsg,
  },
};

exports.PortalClient = grpc.makeGenericClientConstructor(PortalService);
var SynthesisService = exports.SynthesisService = {
  subscribe_synthesis: {
    path: '/helloworld.Synthesis/subscribe_synthesis',
    requestStream: false,
    responseStream: true,
    requestType: helloworld_pb.Request,
    responseType: helloworld_pb.SynthesisMsg,
    requestSerialize: serialize_helloworld_Request,
    requestDeserialize: deserialize_helloworld_Request,
    responseSerialize: serialize_helloworld_SynthesisMsg,
    responseDeserialize: deserialize_helloworld_SynthesisMsg,
  },
};

exports.SynthesisClient = grpc.makeGenericClientConstructor(SynthesisService);
var BridgeService = exports.BridgeService = {
  subscribe_bridge: {
    path: '/helloworld.Bridge/subscribe_bridge',
    requestStream: false,
    responseStream: true,
    requestType: helloworld_pb.Request,
    responseType: helloworld_pb.BridgeMsg,
    requestSerialize: serialize_helloworld_Request,
    requestDeserialize: deserialize_helloworld_Request,
    responseSerialize: serialize_helloworld_BridgeMsg,
    responseDeserialize: deserialize_helloworld_BridgeMsg,
  },
};

exports.BridgeClient = grpc.makeGenericClientConstructor(BridgeService);
