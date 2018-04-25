import hdkey from 'hdkey'
import ecc from 'eosjs-ecc'
import wif from 'wif'
import { Buffer } from 'safe-buffer'

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
}

module.exports = HDNode
