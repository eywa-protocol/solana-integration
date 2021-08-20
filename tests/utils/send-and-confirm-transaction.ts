import { web3 } from '@project-serum/anchor';

export
function sendAndConfirmTransaction(
  title: string,
  connection: web3.Connection,
  transaction: web3.Transaction,
  ...signers: Array<web3.Signer>
): Promise<web3.TransactionSignature> {
  console.log(title);
  return web3.sendAndConfirmTransaction(connection, transaction, signers, {
    skipPreflight: false,
  });
}
