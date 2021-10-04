import path from 'path';

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const PROTO_PATH = path.resolve(__dirname, 'proto', 'helloworld.proto');

const parseArgs = require('minimist');

const packageDefinition = protoLoader.loadSync(
  PROTO_PATH,
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  },
);
const hello_proto = grpc.loadPackageDefinition(packageDefinition).helloworld;

function main() {
  const argv = parseArgs(process.argv.slice(2), {
    string: 'target'
  });
  let target;
  if (argv.target) {
    target = argv.target;
  } else {
    target = 'localhost:50051';
  }
  const client = new (hello_proto as any).Greeter(
    target,
    grpc.credentials.createInsecure(),
  );
  let user;
  if (argv._.length > 0) {
    user = argv._[0];
  } else {
    user = 'world';
  }
  client.sayHello({name: user}, function(err, response) {
    if ( err ) {
      console.log('Error:', err);
      return;
    }
    // console.log('response:', response);
    console.log('Greeting:', response.message);
  });
}

main();
