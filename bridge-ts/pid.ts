import { Keypair } from '@solana/web3.js';

import privBridge from '../target/deploy/eywa_bridge-keypair.json';
import privStub from '../target/deploy/test_stub-keypair.json';
import privGastank from '../target/deploy/eywa_gas_tank-keypair.json';
import privMain from '../target/deploy/eywa_portal_synthesis-keypair.json';

console.log({
  privBridge,
  privStub,
  privGastank,
  privMain,
});

const pairBridge = Keypair.fromSecretKey(Buffer.from(privBridge));
const pairStub = Keypair.fromSecretKey(Buffer.from(privStub));
const pairMain = Keypair.fromSecretKey(Buffer.from(privMain));
const pairGastank = Keypair.fromSecretKey(Buffer.from(privGastank));

export const pidBridge = pairBridge.publicKey;
export const pidStub = pairStub.publicKey;
export const pidMain = pairMain.publicKey;
export const pidGastank = pairGastank.publicKey;

export default {
  bridge: pidBridge,
  stub: pidStub,
  main: pidMain,
  gastank: pidGastank,
};
