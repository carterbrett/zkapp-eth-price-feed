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
 * Basic Example
 * See https://docs.minaprotocol.com/zkapps for more info.
 *
 * The Add contract initializes the state variable 'num' to be a Field(1) value by default when deployed.
 * When the 'update' method is called, the Add contract adds Field(2) to its 'num' contract state.
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
