# EOS HDWallet

![travis](https://travis-ci.org/cobowallet/eoswallet.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/cobowallet/eoswallet/badge.svg?branch=master)](https://coveralls.io/github/cobowallet/eoswallet?branch=master)

JavaScript HDWallet for EOS blockchain

### HDNode

Constructors:

* `fromMasterSeed` - Create HD instance from a master seed
* `fromExtendedKey` - Create HD instance from a base58 string

Instance Methods:

* `derivePath` - Return a derived HD node instance use a path ("m/44'/196'/0'/0/0")
* `deriveChild` - Return a derived HD node instance
* `getPrivateExtendedKey` - Return the private extend key (base58)
* `getPublicExtendedKey` - Return the public extend key (base58)
* `getAddress` - Return the EOS address (sometimes called pubkey in eosjs)
* `getPrivateKey` - Return the private key of the current node / address (sometimes called wif in eosjs)
