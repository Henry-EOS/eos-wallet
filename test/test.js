const assert = require('assert')
const bip39 = require('bip39')
const Eos = require('eosjs')
const HDNode = require('../dist/index.cjs.js')
const mnemonic = 'cobo wallet is awesome'
const seed = bip39.mnemonicToSeedHex(mnemonic)

describe('EOS HDNode', function () {
  it('Can import from seed and get EOS address', () => {
    const node = HDNode.fromMasterSeed(seed)
    assert.equal(node.getPublicKey(), 'EOS4w7FYzzeYJ7oz6XD5exo9ARpQdGoBZhPPjv5ywyrF5PioHtthX')
  })

  it('Can generate new mnemonic and import', () => {
    const myMnemonic = HDNode.generateMnemonic()
    const node = HDNode.fromMnemonic(myMnemonic)
    assert(node.getPublicKey())
  })

  it('Can import from base58 string', () => {
    const node = HDNode.fromExtendedKey('xprv9s21ZrQH143K27GwrJ5SPAZc9KPn8i8gkjeXcQe5vPtRPgUDyoq8qrh4qCRPwZAxzP8abdc9nZduW7UDYN1B5V6rjhc3YPMXzr9ArHaM4M6')
    assert.equal(node.getPublicKey(), 'EOS4w7FYzzeYJ7oz6XD5exo9ARpQdGoBZhPPjv5ywyrF5PioHtthX')
  })

  it('Can import from private key', () => {
    const node = HDNode.fromPrivateKey('5JEz3RE92t35seYNWzrBhXvE22LkFCSJPWqi1icoxoXH9ZPqMVj')
    assert.equal(node.getPublicKey(), 'EOS8Q6s4WGcswUdot8UntNA2G4PVnUha5MyE1CDwZSX76FWc1xQEs')
    assert.throws(() => node.derivePath('123'), Error)
    assert.throws(() => node.getPublicExtendedKey(), Error)
  })

  it('Can derive to child nodes and get EOS address', () => {
    const parentNode = HDNode.fromMasterSeed(seed)
    const node1 = parentNode.derivePath("m/44'/194'/0'/0/0")
    assert.equal(node1.getPublicKey(), 'EOS8Q6s4WGcswUdot8UntNA2G4PVnUha5MyE1CDwZSX76FWc1xQEs')

    const node2 = parentNode.deriveChild(0)
    assert.equal(node2.getPublicKey(), 'EOS5PHB3qTNS2mTeQN1Zo5MeRzvSchws7kkpq9TYwYk3mZACv5JzZ')
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

  it('Can generate and sign transaction', async () => {
    const node = HDNode.fromMasterSeed(seed)
    const trx = await node.generateTransaction({
      from: 'eosio',
      to: 'cobowallet',
      amount: 100000,
      memo: 'cobo wallet is awesome',
      refBlockNum: 1,
      refBlockPrefix: 452435776
    })
    assert.equal(trx.transaction.signatures.length, 1, 'expecting 1 signature')

    const trx2 = await node.generateTransaction({
      from: 'eosio',
      to: 'cobowallet',
      amount: 100000,
      memo: 'cobo wallet is awesome',
      refBlockNum: 1,
      refBlockPrefix: 452435776,
      symbol: 'CUR',
      expiration: 120
    })
    assert.equal(trx2.transaction.signatures.length, 1, 'expecting 1 signature')
  })
})

// http://jungle.cryptolions.io/#home
// jungle testnet
// Pub EOS6VqCksTcXbYN9TQUBUewZv144PsJWmHsvWLvNLhiKEFDxXJj3g
// Pri 5J7k1w53wGeyaduCdULjkng1JeMnNhqsfvUeGSHaWhw5z2joUQK
describe('With jungle testnet, real blockchain methods', () => {
  let refBlockNum, refBlockPrefix, provider, node
  before(async () => {
    provider = Eos({
      httpEndpoint: 'http://bp4-d3.eos42.io:8888',
      chainId: '038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca'
    })
    const latestBlock = await provider.getInfo({})
    refBlockNum = (latestBlock.head_block_num - 3) & 0xFFFF
    const blockInfo = await provider.getBlock(latestBlock.head_block_num - 3)
    refBlockPrefix = blockInfo.ref_block_prefix
    node = HDNode.fromPrivateKey(
      '5J7k1w53wGeyaduCdULjkng1JeMnNhqsfvUeGSHaWhw5z2joUQK',
      '038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca'
    )
  })

  it('Can create account use a pubkey', async () => {
    const randomName = () => {
      const name = String(Math.round(Math.random() * 1000000000)).replace(/[0,6-9]/g, '')
      return 'a' + name + '111222333444'.substring(0, 11 - name.length) // always 12 in length
    }
    const accountName = randomName()
    const { transaction } = await node.registerAccount({
      refBlockNum,
      refBlockPrefix,
      accountName,
      creator: 'cobowalletaa'
    })
    console.log('Created account, name is: ', accountName)
    const res = await provider.pushTransaction(transaction)
    return res
  })

  it('Can import from private key and transfer', async () => {
    const rawTx = await node.generateTransaction({
      from: 'cobowalletaa',
      to: 'liukailiukai',
      amount: 10000,
      memo: 'cobo wallet is awesome',
      refBlockNum,
      refBlockPrefix
    })
    const { transaction } = rawTx
    const res = await provider.pushTransaction(transaction)
    return res
  })

  it('Can delegate bandwidth', async () => {
    const rawTx = await node.delegate({
      from: 'cobowalletaa',
      to: 'cobowalletaa',
      cpuAmount: 10000,
      netAmount: 10000,
      refBlockNum,
      refBlockPrefix
    })
    const { transaction } = rawTx
    const res = await provider.pushTransaction(transaction)
    return res
  })

  it('Can undelegate bandwidth', async () => {
    const rawTx = await node.undelegate({
      from: 'cobowalletaa',
      to: 'cobowalletaa',
      cpuAmount: 10000,
      netAmount: 10000,
      refBlockNum,
      refBlockPrefix
    })
    const { transaction } = rawTx
    const res = await provider.pushTransaction(transaction)
    return res
  })

  it('Can vote producer', async () => {
    const rawTx = await node.vote({
      from: 'cobowalletaa',
      producers: ['lioninjungle'],
      refBlockNum,
      refBlockPrefix
    })
    const { transaction } = rawTx
    const res = await provider.pushTransaction(transaction)
    return res
  })
})
