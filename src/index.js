import hdkey from 'hdkey'
import ecc from 'eosjs-ecc'
import wif from 'wif'
import { Buffer } from 'safe-buffer'
import eos from 'eosjs'
import { toEOSAmount, getExpiration } from './util'

class HDNode {
  constructor ({seed, extendedKey}) {
    if (seed) {
      this._seed = seed
      this._node = hdkey.fromMasterSeed(Buffer(seed, 'hex'))
    } else {
      this._seed = null
      this._node = hdkey.fromExtendedKey(extendedKey)
    }
  }

  static fromMasterSeed (seed) {
    return new this({ seed })
  }

  static fromExtendedKey (extendedKey) {
    return new this({ extendedKey })
  }

  derivePath (path) {
    this._node = this._node.derive(path)
    return new HDNode({ extendedKey: this._node.privateExtendedKey })
  }

  deriveChild (index) {
    this._node = this._node.deriveChild(index)
    return new HDNode({ extendedKey: this._node.privateExtendedKey })
  }

  getPrivateExtendedKey () {
    return this._node.privateExtendedKey
  }

  getPublicExtendedKey () {
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

  async generateTransaction ({ from, to, amount, memo, refBlockNum, refBlockPrefix, expiration = 60 }) {
    // offline mode eosjs
    const eosjsInstance = this.getInstance(expiration, refBlockNum, refBlockPrefix)
    const trx = await eosjsInstance.transfer(from, to, toEOSAmount(amount), memo)
    return trx
  }
}

module.exports = HDNode
