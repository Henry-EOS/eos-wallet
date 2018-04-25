const assert = require('assert')
const bip39 = require('bip39')
const HDNode = require('../')
const mnemonic = 'cobo wallet is awesome'
const seed = bip39.mnemonicToSeedHex(mnemonic)

describe('EOS HDNode', function () {
  it('Can import from seed and get EOS address', () => {
    const node = HDNode.fromMasterSeed(seed)
    assert.equal(node.getAddress(), 'EOS4w7FYzzeYJ7oz6XD5exo9ARpQdGoBZhPPjv5ywyrF5PioHtthX')
  })

  it('Can import from base58 string', () => {
    const node = HDNode.fromExtendedKey('xprv9s21ZrQH143K27GwrJ5SPAZc9KPn8i8gkjeXcQe5vPtRPgUDyoq8qrh4qCRPwZAxzP8abdc9nZduW7UDYN1B5V6rjhc3YPMXzr9ArHaM4M6')
    assert.equal(node.getAddress(), 'EOS4w7FYzzeYJ7oz6XD5exo9ARpQdGoBZhPPjv5ywyrF5PioHtthX')
  })

  it('Can derive to child nodes and get EOS address', () => {
    const parentNode = HDNode.fromMasterSeed(seed)
    const node1 = parentNode.derivePath("m/44'/194'/0'/0/0")
    assert.equal(node1.getAddress(), 'EOS8Q6s4WGcswUdot8UntNA2G4PVnUha5MyE1CDwZSX76FWc1xQEs')

    const node2 = parentNode.deriveChild(0)
    assert.equal(node2.getAddress(), 'EOS5PHB3qTNS2mTeQN1Zo5MeRzvSchws7kkpq9TYwYk3mZACv5JzZ')
  })

  it('Can get private key from a node', () => {
    const node = HDNode.fromMasterSeed(seed).derivePath("m/44'/194'/0'/0/0")
    assert.equal(node.getPrivateKey(), '5JEz3RE92t35seYNWzrBhXvE22LkFCSJPWqi1icoxoXH9ZPqMVj')
  })

  it('Can get public extended key and private extended key', () => {
    const node = HDNode.fromMasterSeed(seed)
    assert.equal(node.getPrivateExtendedKey(), 'xprv9s21ZrQH143K27GwrJ5SPAZc9KPn8i8gkjeXcQe5vPtRPgUDyoq8qrh4qCRPwZAxzP8abdc9nZduW7UDYN1B5V6rjhc3YPMXzr9ArHaM4M6')
    assert.equal(node.getPublicExtendedKey(), 'xpub661MyMwAqRbcEbMQxKcSkJWLhMEGYArY7xa8Qo3hUjRQGUoNXM9PPf1YgT9CCwi8MNvRLW91thbtChgu6eP5qcUeg3x2QLQGfFfC5LqM5dt')
  })
})
