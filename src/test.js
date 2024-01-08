
(async () => {
  const ethers = require('ethers')
  const zksync = require('zksync')
  const utils = require('./utils')

  const token = 'ETH'
  const amountToDeposit = '0.00002'
  const amountToTransfer = '0.0000001'
  const amountToWithdraw = '0.0000001'

  const zkSyncProvider = await utils.getZkSyncProvider(zksync, process.env.NETWORK_NAME)
  const ethersProvider = await utils.getEthereumProvider(ethers, process.env.NETWORK_NAME)

  console.log('Creating a new Rinkeby wallet for Alice')
  const aliceRinkebyWallet = new ethers.Wallet(process.env.ALICE_PRIVATE_KEY, ethersProvider)
  console.log(`Alice's ether address is: ${aliceRinkebyWallet.address}`)
  const aliceInitialRinkebyBalance = await aliceRinkebyWallet.getBalance()
  console.log(`Alice's initial balance on Rinkeby is: ${ethers.utils.formatEther(aliceInitialRinkebyBalance)}`)

  console.log('Creating a zkSync wallet for Alice')
  const aliceZkSyncWallet = await utils.initAccount(aliceRinkebyWallet, zkSyncProvider, zksync)
  console.log(`Alice's zksync address is: ${aliceZkSyncWallet.address()}`)
  // console.log(`Alice's zksync balance is: ${ethers.utils.formatEther(await aliceZkSyncWallet.getBalance())}`)

  console.log('Depositing')
  // await utils.depositToZkSync(aliceZkSyncWallet, token, amountToDeposit, ethers)
  // await utils.displayZkSyncBalance(aliceZkSyncWallet, ethers)
  await utils.registerAccount(aliceZkSyncWallet)
})()