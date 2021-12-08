// export { StandaloneInstruction, TransactionAccount } from './prg-bridge';

import { IdlBridge, PrgBridge } from './prg-bridge';
import { IdlSyntesise, PrgSyntesise } from './prg-syntesise';
import { IdlTestStub, PrgTestStub } from './prg-test-stub';
import { IdlTestTokenFaucet, PrgTestTokenFaucet } from './prg-test-token-faucet';

import { web3 } from '@project-serum/anchor';
export { web3 } from '@project-serum/anchor';

export * from './solana-helper';

import idl from './idl';
import pid from './pid';

import type { IdlDeployed } from './idl';


const checkPid = (idl: IdlDeployed, pid: web3.PublicKey) => {
  if ( idl.metadata?.address ) {
    // console.log({
    //   'idl.metadata.address': idl.metadata?.address,
    //   pid,
    // });
    if ( !(idl.metadata?.address == pid?.toBase58()) ) {
      throw Error('Disambiguous programId (idl and deploy)');
    }
  } else {
    throw Error('Idl have no metadata.address');
  }
};


export default
class Factory {
  constructor(
    private connection: web3.Connection,
  ) {
    //
  }

  public get pidBridge(): web3.PublicKey {
    return pid.bridge;
  }

  protected _bridge: PrgBridge;
  public get bridge(): PrgBridge {
    if ( !this._bridge ) {
      checkPid(idl.bridge, pid.bridge);
      this._bridge = new PrgBridge(
        this.connection,
        pid.bridge,
        idl.bridge as IdlBridge,
      );
    }

    return this._bridge;
  }

  public get pidMain(): web3.PublicKey {
    return pid.main;
  }

  protected _main: PrgSyntesise;
  public get main(): PrgSyntesise {
    if ( !this._main ) {
      checkPid(idl.main, pid.main);
      this._main = new PrgSyntesise(
        this.connection,
        pid.main,
        idl.main as IdlSyntesise,
        this.bridge,
      );
    }

    return this._main;
  }

  public get pidStub(): web3.PublicKey {
    return pid.stub;
  }

  protected _stub: PrgTestStub;
  public get stub(): PrgTestStub {
    if ( !this._stub ) {
      checkPid(idl.stub, pid.stub);
      this._stub = new PrgTestStub(
        this.connection,
        pid.stub,
        idl.stub as IdlTestStub,
      );
    }

    return this._stub;
  }

  public get pidFaucet(): web3.PublicKey {
    return pid.faucet;
  }

  protected _faucet: PrgTestTokenFaucet;
  public get faucet(): PrgTestTokenFaucet {
    if ( !this._faucet ) {
      checkPid(idl.faucet, pid.faucet);
      this._faucet = new PrgTestTokenFaucet(
        this.connection,
        pid.faucet,
        idl.faucet as IdlTestTokenFaucet,
      );
    }

    return this._faucet;
  }
}

/*

const tokenTypeToStepDescription = {
  ONE: {
    [TOKEN_TYPE.ERC20]: (real: Token) =>
      STEPPER_LABELS.APPROVE(real, 'deposit'),
    [TOKEN_TYPE.SYNTH]: (synth: Token) => STEPPER_LABELS.APPROVE(synth, 'burn'),
  },
  TWO: {
    [TOKEN_TYPE.ERC20]: STEPPER_LABELS.DEPOSIT,
    [TOKEN_TYPE.SYNTH]: STEPPER_LABELS.BURN,
  },
  THREE: {
    [TOKEN_TYPE.ERC20]: STEPPER_LABELS.MINTING,
    [TOKEN_TYPE.SYNTH]: STEPPER_LABELS.UNLOCK,
  },
};

  private bridgeMethodMap = {
    [TOKEN_TYPE.ERC20]: this.synthesize,
    [TOKEN_TYPE.SYNTH]: this.unsynthesize,
  };

  private revertMethodMap = {
    [TOKEN_TYPE.ERC20]: this.revertSynthesize,
    [TOKEN_TYPE.SYNTH]: this.revertUnsynthesize,
  };


export const getPortalContract = (
  chainId: CHAIN_ID,
  providerOrSigner: TProviderOrSigner
): Contract => {
  return createContract(providerOrSigner, PORTAL_ADDRESS[chainId], PORTAL_ABI);
};

export const getSynthesizeContract = (
  chainId: CHAIN_ID,
  providerOrSigner: TProviderOrSigner
): Contract => {
  return createContract(
    providerOrSigner,
    SYNTHESIZE_ADDRESS[chainId],
    SYNTHESIZE_ABI
  );
};

export const getRouterContract = (
  chainId: CHAIN_ID,
  providerOrSigner: TProviderOrSigner
): Contract => {
  return createContract(
    providerOrSigner,
    ROUTER_ADDRESS[chainId],
    DEX_ROUTER_ABI
  );
};

export const getMulticallContract = (
  chainId: CHAIN_ID,
  providerOrSigner: TProviderOrSigner
): Contract => {
  return createContract(providerOrSigner, MULTICALL[chainId], MULTICALL_ABI);
};
*/
