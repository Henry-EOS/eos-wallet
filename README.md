# EOS HDWallet

![travis](https://travis-ci.org/cobowallet/eos-wallet.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/cobowallet/eos-wallet/badge.svg?branch=master)](https://coveralls.io/github/cobowallet/eos-wallet?branch=master)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![NPM Package](https://img.shields.io/npm/v/@cobo/eos.svg?style=flat-square)](https://www.npmjs.com/package/@cobo/eos)

> JavaScript HDWallet for EOS blockchain, something like `ethereumjs-wallet`.

### Usage
```
yarn add @cobo/eos
```
```
import eos from '@cobo/eos';

const wallet = eos.fromMasterSeed('...');
const pubkey = wallet.getPublicKey(); // EOS4w7FYzzeYJ7oz6XD5exo9ARpQdGoBZhPPjv5ywyrF5PioHtthX
```

### EOS HDNode

You will create a EOS HDNode instance and use the methods of the instance:

**Static Methods:**

* `fromMasterSeed` - Create HD instance from a master seed
* `fromExtendedKey` - Create HD instance from a base58 string
* `fromMnemonic` - Create HD instance from a mnemonic
* `fromPrivateKey` - Create HD instance from a EOS private key, or WIF (Cannot derive or get xpriv, xpub in this way)
* `generateMnemonic` - Generate new mnemonic, or you can use `bip39` directly

**Instance Methods:**

* `derivePath` - Return a derived HD node instance use a path (`"m/44'/196'/0'/0/0"`)
* `deriveChild` - Return a derived HD node instance
* `getPrivateExtendedKey` - Return the private extend key (base58)
* `getPublicExtendedKey` - Return the public extend key (base58)
* `getPublicKey` - Return the EOS public key
* `getPrivateKey` - Return the private key of the current node / address (or WIF)
* `(async) generateTransaction` - Generate a EOS raw transaction, param example:
```JavaScript
const wallet = eos.fromMasterSeed('...');
const rawTx = await wallet.generateTransaction({
    from: 'from',
    to: 'to',
    amount: 100000, // will convert to '10.0000 EOS'
    memo: 'hello world',
    refBlockNum: 1, // get from eos.getInfo()
    refBlockPrefix: 452435776, // get from eos.getBlock(last_irrvertable_block)
    expiration: 60, // default is 60s
    symbol: 'EOS' // default is EOS
})
```
* `(async) delegate` - Generate a EOS raw tx for delegate bandwitdth
```JavaScript
const wallet = eos.fromMasterSeed('...');
const rawTx = await wallet.delegate({
    from: 'from',
    to: 'to',
    cpuAmount: 100000, // will convert to '10.0000 EOS'
    netAmount: 100000,
    symbol: 'EOS', // default is EOS
    refBlockNum: 1,
    refBlockPrefix: 452435776
})
```
* `(async) undelegate` - Same as delegate
* `(async) vote` - Generate a EOS raw tx for vote producers
```JavaScript
const wallet = eos.fromMasterSeed('...');
const rawTx = await wallet.vote({
    from: 'from',
    producers: ['lioninjungle'],
    refBlockNum: 1,
    refBlockPrefix: 452435776
})
```

### More Examples

See `test/test.js`
