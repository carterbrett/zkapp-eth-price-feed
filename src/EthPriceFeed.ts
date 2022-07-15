import {
  Field,
  SmartContract,
  state,
  State,
  method,
  DeployArgs,
  Permissions,
  Signature,
  PublicKey,
} from 'snarkyjs';

/**
 * ETH Price Feed Example
 * See https://docs.minaprotocol.com/zkapps for more info.
 *
 * The EthPriceFeed contract initializes the state variable 'priceInCents' to be 0 by default when deployed.
 * It also sets the 'trustedSigner' to the public key 'B62qnxEfmJi1gTQuR4Fc7E3FcWrQBPm9GaVZ1df2ebMdMQJM543uELt'.
 * When the 'updatePrice' method is called, the EthPriceFeed contract checks if a signature and it's
 * public key are trusted and valid, then updates price if both are true.
 *
 * This file is safe to delete and replace with your own contract.
 */
export class EthPriceFeed extends SmartContract {
  @state(PublicKey as any) trustedSigner = State<PublicKey>();
  @state(Field) priceInCents = State<Field>();

  deploy(args: DeployArgs) {
    super.deploy(args);
    this.setPermissions({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature(),
    });
  }

  @method init() {
    this.trustedSigner.set(
      PublicKey.fromBase58(
        'B62qnxEfmJi1gTQuR4Fc7E3FcWrQBPm9GaVZ1df2ebMdMQJM543uELt'
      )
    );
    this.priceInCents.set(Field(0));
  }

  @method updatePrice(price: Field, signature: Signature, key: PublicKey) {
    // get trusted public key from state
    const _trustedSigner = this.trustedSigner.get();
    // check that the public key of message signer === trusted public key in state
    key.assertEquals(_trustedSigner);
    // verify the signature
    signature.verify(key, [price]);
    // if signature is valid, update the price in state
    this.priceInCents.set(price);
  }
}
