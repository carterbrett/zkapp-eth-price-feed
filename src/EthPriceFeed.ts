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
  @state(Field) price = State<Field>();

  deploy(args: DeployArgs) {
    super.deploy(args);
    this.setPermissions({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature(),
    });
  }

  @method init() {
    this.price.set(Field(0));
  }

  @method update(price: Field, signature: Signature, key: PublicKey) {
    // verify the signature
    signature.verify(key, [price]);
    // if signature is valid, update the state
    this.price.set(price);
  }
}
