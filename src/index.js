import hdkey from 'hdkey'
import ecc from 'eosjs-ecc'
import wif from 'wif'
import { Buffer } from 'safe-buffer'
import eos from 'eosjs'
import bip39 from 'bip39'
import assert from 'assert'
import secp256k1 from 'secp256k1'
import { toEOSAmount, getExpiration } from './util'

class HDNode {
  constructor ({ seed, extendedKey, privateKey }) {
    if (seed) {
      this._seed = seed
      this._node = hdkey.fromMasterSeed(Buffer(seed, 'hex'))
    } else if (extendedKey) {
      this._seed = null
      this._node = hdkey.fromExtendedKey(extendedKey)
    } else {
      assert.equal(privateKey.length, 32, 'Private key must be 32 bytes.')
      assert(secp256k1.privateKeyVerify(privateKey), 'Invalid private key')
      this._seed = null
      this._node = {
        _publicKey: secp256k1.publicKeyCreate(privateKey, true),
        _privateKey: privateKey
      }
    }
  }

  static generateMnemonic () {
    return bip39.generateMnemonic()
  }

  static fromMnemonic (mnemonic) {
    const seed = bip39.mnemonicToSeedHex(mnemonic)
    return new this({ seed })
  }

  static fromMasterSeed (seed) {
    return new this({ seed })
  }

  static fromExtendedKey (extendedKey) {
    return new this({ extendedKey })
  }

  static fromPrivateKey (key) {
    const privateKey = wif.decode(key).privateKey
    return new this({ privateKey })
  }

  derivePath (path) {
    assert(this._node.derive, 'can not derive when generate from private / public key')
    this._node = this._node.derive(path)
    return new HDNode({ extendedKey: this._node.privateExtendedKey })
  }

  deriveChild (index) {
    assert(this._node.deriveChild, 'can not derive when generate from private / public key')
    this._node = this._node.deriveChild(index)
    return new HDNode({ extendedKey: this._node.privateExtendedKey })
  }

  getPrivateExtendedKey () {
    assert(this._node.privateExtendedKey, 'can not get xpriv when generate from private / public key')
    return this._node.privateExtendedKey
  }

  getPublicExtendedKey () {
    assert(this._node.publicExtendedKey, 'can not get xpub when generate from private / public key')
    return this._node.publicExtendedKey
  }

  getAddress () {
    return ecc.PublicKey(this._node._publicKey).toString()
  }

  getPrivateKey () {
    return wif.encode(128, this._node._privateKey, false)
  }

  getInstance (expiration, refBlockNum, refBlockPrefix) {
    const headers = {
      expiration: getExpiration(expiration),
      region: 0,
      ref_block_num: refBlockNum,
      ref_block_prefix: refBlockPrefix,
      max_net_usage_words: 0,
      max_kcpu_usage: 0,
      delay_sec: 0,
      context_free_actions: []
    }
    const privateKey = this.getPrivateKey()
    return eos.Localnet({
      keyProvider: privateKey,
      httpEndpoint: 'https://doesnotexist.example.org',
      transactionHeaders: (expireInSeconds, callback) => callback(null, headers),
      broadcast: false,
      sign: true
    })
  }

  async generateTransaction ({ from, to, amount, memo, refBlockNum, refBlockPrefix, expiration, symbol }) {
    // offline mode eosjs
    const eosjsInstance = this.getInstance(expiration, refBlockNum, refBlockPrefix)
    const trx = await eosjsInstance.transfer(from, to, toEOSAmount(amount, symbol), memo)
    return trx
  }
}

export default HDNode
