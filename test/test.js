const assert = require('assert')
const bip39 = require('bip39')
const EOS = require('eosjs')
const HDNode = require('../dist/index.cjs.js')
const mnemonic = 'cobo wallet is awesome'
const seed = bip39.mnemonicToSeedHex(mnemonic)

describe('EOS HDNode', function () {
  it('Can import from seed and get EOS address', () => {
    const node = HDNode.fromMasterSeed(seed)
    assert.equal(node.getAddress(), 'EOS4w7FYzzeYJ7oz6XD5exo9ARpQdGoBZhPPjv5ywyrF5PioHtthX')
  })

  it('Can generate new mnemonic and import', () => {
    const myMnemonic = HDNode.generateMnemonic()
    const node = HDNode.fromMnemonic(myMnemonic)
    assert(node.getAddress())
  })

  it('Can import from base58 string', () => {
    const node = HDNode.fromExtendedKey('xprv9s21ZrQH143K27GwrJ5SPAZc9KPn8i8gkjeXcQe5vPtRPgUDyoq8qrh4qCRPwZAxzP8abdc9nZduW7UDYN1B5V6rjhc3YPMXzr9ArHaM4M6')
    assert.equal(node.getAddress(), 'EOS4w7FYzzeYJ7oz6XD5exo9ARpQdGoBZhPPjv5ywyrF5PioHtthX')
  })

  it('Can import from private key', () => {
    const node = HDNode.fromPrivateKey('5JEz3RE92t35seYNWzrBhXvE22LkFCSJPWqi1icoxoXH9ZPqMVj')
    assert.equal(node.getAddress(), 'EOS8Q6s4WGcswUdot8UntNA2G4PVnUha5MyE1CDwZSX76FWc1xQEs')
    assert.throws(() => node.derivePath('123'), Error)
    assert.throws(() => node.getPublicExtendedKey(), Error)
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

  it('Test EOS tx', async () => {
    const node = HDNode.fromPrivateKey('5JEz3RE92t35seYNWzrBhXvE22LkFCSJPWqi1icoxoXH9ZPqMVj')
    assert.equal(node.getAddress(), 'EOS8Q6s4WGcswUdot8UntNA2G4PVnUha5MyE1CDwZSX76FWc1xQEs')

    const instance = await node.getOnlineInstance()
    const tx = await instance.transfer('inita', 'initb', '1 SYS', '', { broadcast: false })
    return tx
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

  it('Can create account use a pubkey', async () => {
    const node = HDNode.fromPrivateKey('5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3')
    const provider = EOS({ httpEndpoint: 'http://127.0.0.1:8888' })
    const latestBlock = await provider.getInfo({})
    const refBlockNum = (latestBlock.head_block_num - 3) & 0xFFFF
    const blockInfo = await provider.getBlock(latestBlock.head_block_num - 3)

    // const randomName = () => 'a' +
    //   String(Math.round(Math.random() * 1000000000)).replace(/[0,6-9]/g, '')
    const { transaction } = await node.registerAccount({
      refBlockNum,
      refBlockPrefix: blockInfo.ref_block_prefix,
      accountName: 'liukai'
    })
    const res = await provider.pushTransaction(transaction)
    console.log(JSON.stringify(res, null, 2))
    return res
  })

  // it('Can import from private key and transfer', async () => {
  //   const node = HDNode.fromPrivateKey('5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3')
  //   const provider = EOS({ httpEndpoint: 'http://127.0.0.1:8888' })
  //   const latestBlock = await provider.getInfo({})
  //   const refBlockNum = (latestBlock.head_block_num - 3) & 0xFFFF
  //   const blockInfo = await provider.getBlock(latestBlock.head_block_num - 3)
  //   const { transaction } = await node.generateTransaction({
  //     from: 'eosio',
  //     to: 'inita',
  //     amount: 100000,
  //     memo: 'cobo wallet is awesome',
  //     refBlockNum,
  //     refBlockPrefix: blockInfo.ref_block_prefix
  //   })
  //   const res = await provider.pushTransaction(transaction)
  //   assert.equal(res.processed.status, 'executed')
  // })
})
