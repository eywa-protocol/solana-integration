import path from "path";

import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

const PROTO_PATH = path.resolve(__dirname, "proto", "helloworld.proto");

const parseArgs = require("minimist");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const hello_proto = grpc.loadPackageDefinition(packageDefinition).helloworld;

function main() {
  const argv = parseArgs(process.argv.slice(2), {
    string: "target",
  });
  let target;
  if (argv.target) {
    target = argv.target;
  } else {
    target = "localhost:8080";
  }
  const client = new (hello_proto as any).Greeter(
    target,
    grpc.credentials.createInsecure()
  );
  let user;
  if (argv._.length > 0) {
    user = argv._[0];
  } else {
    user = "world";
  }

  /*
  type uint256 = {
    id_0 : number,
    id_1 : number,
    id_2 : number,
    id_3 : number,
  };

  type uint160 = {
    id_0 : number,
    id_1 : number,
    id_2 : number,
  }

  type reqSynt = {
    id: uint256,
    from: uint256,
    to: uint256,
    amount : number,
    real_token: uint256,
  };
  */

  client.sayHello({ name: user }, function (err, response) {
    if (err) {
      console.log("Error:", err);
      return;
    }
    console.log('response:', response);
    console.log('Greeting:', response.message);
  });

  const call = client.sayHello2({ name: user });

  call.on("data", function (response) {
    console.log("response:", response);
    console.log(response.message);
  });

  call.on("end", () => {
    console.log("END SERVICE");
  });
}

main();
