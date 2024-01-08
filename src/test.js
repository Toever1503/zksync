
(async () => {
  const zksync = require('zksync-ethers')
  const ethers = require('ethers')
  const utils = require('./utils')

  const token = 'SHIO'
  const amountToDeposit = '11'
  const amountToTransfer = '0.0000001'
  const amountToWithdraw = '0.0000001'

  const zkSyncProvider = await utils.getZkSyncProvider("https://sepolia.era.zksync.dev");
  const ethersProvider = await utils.getEthereumProvider(process.env.NETWORK_NAME)

  console.log('Creating a new Sepolia wallet for Alice')
  const aliceEtherbyWallet = new ethers.Wallet(process.env.ALICE_PRIVATE_KEY).connect(ethersProvider)
  console.log(`Alice's ether address is: ${aliceEtherbyWallet.address}`)
  const aliceBalance = await aliceEtherbyWallet.getBalance()
  console.log(`Alice's initial balance on Rinkeby is: ${ethers.utils.formatEther(aliceBalance)}`)

  console.log('Creating a zkSync wallet for Alice')
  const aliceZkSyncWallet = await utils.initAccount(aliceEtherbyWallet, zkSyncProvider, ethersProvider)
  const zkSyncBalace = ethers.utils.formatEther(await aliceZkSyncWallet.getBalance("0xC4a71531f41635EB44062cCb7608242826c035b2"));
  console.log("zksync's SHIO balance: ", zkSyncBalace);

  console.log('Depositing')
  const SHIO_ADDRESS = '0x2B342762175A4565cafe8f6E057a664c8a738d7e'
  // const txHandle = await wallet.approveERC20(
  //   SHIO_ADDRESS,
  //   "2" // 10.0 USDC
  // );
  // await txHandle.wait();

  const deposit = await aliceZkSyncWallet.deposit({
    token: SHIO_ADDRESS,
    amount: ethers.utils.parseEther("2"),
    approveERC20: true,
  });
  const ethereumTxReceipt = await deposit.waitL1Commit();
  console.log('main tx done!')
  const depositReceipt = await deposit.wait();
  console.log('zksync tx done!')

  // await utils.depositToZkSync(aliceZkSyncWallet, token, amountToDeposit, ethers)
  // await utils.displayZkSyncBalance(aliceZkSyncWallet, ethers)

})()