import * as grpc from "@grpc/grpc-js";

import healthServer from "./healthcheck-server";
import { BridgeService, IBridgeServer, BridgeServer } from "./bridge-service";

/*
const PROTO_PATH = path.resolve(__dirname, "proto", "helloworld.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const hello_proto = grpc.loadPackageDefinition(packageDefinition).helloworld;

function sayHello(call, callback) {
  callback(null, { message: "Hello " + call.request.name });
}

function sayHello2(call, callback) {
  call.write({ message: "Hello_1" });
  setTimeout(() => {
    call.write({ message: "Hello_2" });
    console.log(call);
    call.end();
  }, 3000);
}
//Portal
function reqSyntesize(call) {
  if (
    call.id.id_0 != 0 &&
    call.from.id_0 != 0 &&
    call.to.id_0 != 0 &&
    call.amount.id_0 != 0 &&
    call.real_token.id_0 != 0
  ) {
    call.write({ message: "Hello_3" });
    call.end();
  }
}

function reqRevertBurn(call) {}

}

function complBurn (call) {

}

function complRevertSynthesize (call) {

}
//Synthesis
function reqBurn (call) {

}

function reqRevertSynthesize (call) {

}

function complSynthesize (call) {

}

function complRevertBurn (call) {

}
//Bridge
function reqOracle (call) {

}

function reqReceive (call) {

}
*/

function main() {
  const server = new grpc.Server();
  // server.addService(bridgeService.definition, bridgeService.implementation);
  const bridgeServer = new BridgeServer() as unknown as IBridgeServer;
  server.addService(BridgeService, bridgeServer);

  const onBind = () => {
    server.start();
    healthServer.listen(8081);
  };

  server.bindAsync(
    "0.0.0.0:8080",
    grpc.ServerCredentials.createInsecure(),
    onBind,
  );
}

process.on("uncaughtException", (err) => {
  console.log(`process on uncaughtException error: ${err}`);
});

process.on("unhandledRejection", (err) => {
  console.log(`process on unhandledRejection error: ${err}`);
});

main();
