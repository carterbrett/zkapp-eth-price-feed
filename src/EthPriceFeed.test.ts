import { EthPriceFeed } from './EthPriceFeed';
import {
  isReady,
  shutdown,
  Field,
  Mina,
  PrivateKey,
  PublicKey,
  Party,
  Signature,
} from 'snarkyjs';

/*
 * This file specifies how to test the `Add` example smart contract. It is safe to delete this file and replace
 * with your own tests.
 *
 * See https://docs.minaprotocol.com/zkapps for more info.
 */

await isReady;

function createLocalBlockchain() {
  const Local = Mina.LocalBlockchain();
  Mina.setActiveInstance(Local);
  return Local.testAccounts[0].privateKey;
}

async function localDeploy(
  zkAppInstance: EthPriceFeed,
  zkAppPrivkey: PrivateKey,
  deployerAccount: PrivateKey
) {
  const txn = await Mina.transaction(deployerAccount, () => {
    Party.fundNewAccount(deployerAccount);
    zkAppInstance.deploy({ zkappKey: zkAppPrivkey });
    zkAppInstance.init();
  });
  await txn.send().wait();
}

describe('EthPriceFeed', () => {
  let deployerAccount: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    signature: Signature | any;

  beforeEach(async () => {
    deployerAccount = createLocalBlockchain();
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    signature = Signature.fromJSON({
      r: '16047317189839310300037309433562432729531219527961893527890138183396213596282',
      s: '13796934671990055413040091403880890284434414853645492071905299593761877254991',
    });
  });

  afterAll(async () => {
    // `shutdown()` internally calls `process.exit()` which will exit the running Jest process early.
    // Specifying a timeout of 0 is a workaround to defer `shutdown()` until Jest is done running all tests.
    // This should be fixed with https://github.com/MinaProtocol/mina/issues/10943
    setTimeout(shutdown, 0);
  });

  it('generates and deploys the `EthPriceFeed` smart contract', async () => {
    const zkAppInstance = new EthPriceFeed(zkAppAddress);
    await localDeploy(zkAppInstance, zkAppPrivateKey, deployerAccount);
    const price = zkAppInstance.priceInCents.get();
    expect(price).toEqual(Field.zero);
    const trustedSigner = zkAppInstance.trustedSigner.get();
    expect(trustedSigner).toEqual(
      PublicKey.fromBase58(
        'B62qnxEfmJi1gTQuR4Fc7E3FcWrQBPm9GaVZ1df2ebMdMQJM543uELt'
      )
    );
  });

  it('correctly updates the price state on the `EthPriceFeed` smart contract', async () => {
    const zkAppInstance = new EthPriceFeed(zkAppAddress);
    const newPrice = Field(111000);
    const _trustedSigner = PublicKey.fromBase58(
      'B62qnxEfmJi1gTQuR4Fc7E3FcWrQBPm9GaVZ1df2ebMdMQJM543uELt'
    );

    await localDeploy(zkAppInstance, zkAppPrivateKey, deployerAccount);
    const txn = await Mina.transaction(deployerAccount, () => {
      zkAppInstance.updatePrice(newPrice, signature, _trustedSigner);
      zkAppInstance.sign(zkAppPrivateKey);
    });

    await txn.send().wait();

    const updatedPrice = zkAppInstance.priceInCents.get();
    expect(updatedPrice).toEqual(Field(111000));
  });
});
