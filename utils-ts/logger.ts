import {
  AccountInfo,
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  BN,
  // parseIdlErrors,
  // ProgramError,
  // web3,
} from '@project-serum/anchor';

export
class Logger {
  //


  public log(...args) {
    console.log(...args);
    return this;
  }

  public logKeys(obj) {
    console.log(Object.keys(obj));
    return this;
  }

  public logPublicKey(title: string, key: PublicKey) {
    this.log(title, 'base58:', key.toBase58());
    this.log(title, 'hex:', key.toBuffer().toString('hex'));
    return this;
  }

  public accountInfo<T>(title: string, ai: AccountInfo<T>) {
    this.log(title);
    this.log(JSON.stringify(ai, (key, value) => {
      if ( key === 'data' ) {
        const hex = Buffer.from(value).toString('hex');
        const arr = value.data?.toString();
        return `${ hex } [${ arr }]`;
      }

      if ( ('object' == typeof value) && (value instanceof PublicKey) ) {
        // return (value as PublicKey).toBase58();
        const pk = value as PublicKey;
        let r;
        try {
          r = [ pk.toBuffer().toString('hex'), pk.toBase58() ];
        } catch (ex) {
          this.log('Logger error:', ex.message);
          r = [ 'undefined' ];
        }
        return r.join(' ');
      }

      return value;
    }, 2));
    return this;
  };

  public logState(title: string, state: object) {
    this.log(title);
    this.log(JSON.stringify(state, (key, value) => {
      if ( ('object' == typeof value) && (value instanceof PublicKey) ) {
        // return (value as PublicKey).toBase58();
        const pk = value as PublicKey;
        let r;
        try {
          r = [ pk.toBuffer().toString('hex'), pk.toBase58() ];
        } catch (ex) {
          this.log('Logger error:', ex.message);
          r = [ 'undefined' ];
        }
        return r.join(' ');
      }

      // console.log(key, typeof value, BN.isBN(value));
      // try {
      //   console.log(
      //     "'object' == typeof value",
      //     'object' == typeof value,
      //   );
      // } catch {}
      // try {
      //   console.log(
      //     "isPublicKey",
      //     ('object' == typeof value) && value instanceof PublicKey,
      //   );
      // } catch {}
      // try {
      //   console.log(
      //     'value instanceof BN',
      //     value instanceof BN,
      //     // BN.isBN(value)
      //   );
      // } catch {}

      return value;
    }, 2));
    return this;
  };

  public logIx(title: string, ix: TransactionInstruction) {
    this.log(title);
    this.log(JSON.stringify(ix, (key, value) => {
      // if (typeof value === 'string') return undefined
      if ( key === 'keys' ) {
        return value.map(k => {
          const pk = k.pubkey as PublicKey;
          let r;
          try {
            r = [ pk.toBuffer().toString('hex'), pk.toBase58() ];
          } catch (ex) {
            this.log('Logger error:', ex.message);
            r = [ 'undefined' ];
          }
          if ( k.isWritable ) r.push('Writable');
          if ( k.isSigner ) r.push('Signer');
          return r.join(' ');
        });
      }
      if ( key === 'pubkey' || key === 'programId' ) {
        return (value as PublicKey).toBase58();
      }
      if ( value?.type === 'Buffer' ) {
        const hex = Buffer.from(value.data).toString('hex');
        const arr = value.data?.toString();
        return `${ hex } [${ arr }]`;
      }

      return value;
    }, 2));
    return this;
  };
}
