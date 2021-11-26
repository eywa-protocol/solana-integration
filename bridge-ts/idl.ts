
import bridge from '../target/idl/eywa_bridge.json';
import faucet from '../target/idl/test_token_faucet.json';
import gastank from '../target/idl/eywa_gas_tank.json';
import main from '../target/idl/eywa_portal_synthesis.json';
import stub from '../target/idl/test_stub.json';

import type { Idl } from '@project-serum/anchor';
import type { Base58PublicKey } from '../bridge-ts/interfaces/types';

type IdlMeta = { address: Base58PublicKey };
export type IdlDeployed = Idl & { metadata?: IdlMeta };

export const idlBridge: IdlDeployed = bridge as IdlDeployed;
export const idlFaucet: IdlDeployed = faucet as IdlDeployed;
export const idlGastank: IdlDeployed = gastank as IdlDeployed;
export const idlMain: IdlDeployed = main as IdlDeployed;
export const idlStub: IdlDeployed = stub as IdlDeployed;

export default {
  bridge: idlBridge,
  faucet: idlFaucet,
  gastank: idlGastank,
  main: idlMain,
  stub: idlStub,
};
