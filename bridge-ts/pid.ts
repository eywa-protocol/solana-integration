import { Keypair } from '@solana/web3.js';

import privBridge from '../target/deploy/eywa_bridge-keypair.json';
import privFaucet from '../target/deploy/test_token_faucet-keypair.json';
import privGastank from '../target/deploy/eywa_gas_tank-keypair.json';
import privMain from '../target/deploy/eywa_portal_synthesis-keypair.json';
import privStub from '../target/deploy/test_stub-keypair.json';


const pairBridge = Keypair.fromSecretKey(Buffer.from(privBridge));
const pairFaucet = Keypair.fromSecretKey(Buffer.from(privFaucet));
const pairGastank = Keypair.fromSecretKey(Buffer.from(privGastank));
const pairMain = Keypair.fromSecretKey(Buffer.from(privMain));
const pairStub = Keypair.fromSecretKey(Buffer.from(privStub));

export const pidBridge = pairBridge.publicKey;
export const pidFaucet = pairFaucet.publicKey;
export const pidGastank = pairGastank.publicKey;
export const pidMain = pairMain.publicKey;
export const pidStub = pairStub.publicKey;

export default {
  bridge: pidBridge,
  faucet: pidFaucet,
  gastank: pidGastank,
  main: pidMain,
  stub: pidStub,
};
