require('dotenv').config()
const zksync = require('zksync-ethers');
const ethers = require("ethers");

async function getZkSyncProvider(rpc) {
  let zkSyncProvider
  try {
    zkSyncProvider = new zksync.Provider(rpc);
  } catch (error) {
    console.log('Unable to connect to zkSync.')
    console.log(error)
  }
  return zkSyncProvider
}

async function getEthereumProvider(networkName) {
  let ethersProvider
  try {
    // eslint-disable-next-line new-cap
    ethersProvider = new ethers.getDefaultProvider(networkName)
  } catch (error) {
    console.log('Could not connect to Rinkeby')
    console.log(error)
  }
  return ethersProvider
}

async function initAccount(etherWallet, zkSyncProvider, ethersProvider) {
  const zkSyncWallet = new zksync.Wallet(etherWallet, zkSyncProvider, ethersProvider)
  return zkSyncWallet
}


async function depositToZkSync(zkSyncWallet, token, amountToDeposit, ethers) {
  const deposit = await zkSyncWallet.deposit({
    depositTo: zkSyncWallet.address(),
    token: token,
    amount: ethers.utils.parseEther(amountToDeposit)
  });
  try {
    await deposit.awaitReceipt()
  } catch (error) {
    console.log('Error while awaiting confirmation from the zkSync operators.')
    console.log(error)
  }
}

async function transfer(from, toAddress, amountToTransfer, transferFee, token, zksync, ethers) {
  const closestPackableAmount = zksync.utils.closestPackableTransactionAmount(
    ethers.utils.parseEther(amountToTransfer))
  const closestPackableFee = zksync.utils.closestPackableTransactionFee(
    ethers.utils.parseEther(transferFee))

  const transfer = await from.syncTransfer({
    to: toAddress,
    token: token,
    amount: closestPackableAmount,
    fee: closestPackableFee
  })
  const transferReceipt = await transfer.awaitReceipt()
  console.log('Got transfer receipt.')
  console.log(transferReceipt)
}

async function getFee(transactionType, address, token, zkSyncProvider, ethers) {
  const feeInWei = await zkSyncProvider.getTransactionFee(transactionType, address, token)
  return ethers.utils.formatEther(feeInWei.totalFee.toString())
}

async function withdrawToEthereum(wallet, amountToWithdraw, withdrawalFee, token, zksync, ethers) {
  const closestPackableAmount = zksync.utils.closestPackableTransactionAmount(ethers.utils.parseEther(amountToWithdraw))
  const closestPackableFee = zksync.utils.closestPackableTransactionFee(ethers.utils.parseEther(withdrawalFee))
  const withdraw = await wallet.withdrawFromSyncToEthereum({
    ethAddress: wallet.address(),
    token: token,
    amount: closestPackableAmount,
    fee: closestPackableFee
  })
  await withdraw.awaitVerifyReceipt()
  console.log('ZKP verification is complete')
}

async function displayZkSyncBalance(wallet, ethers) {
  const state = await wallet.getAccountState()

  console.log("token balance: ", state.committed.balances);
  if (state.committed.balances.ETH) {
    console.log(`Commited ETH balance for ${wallet.address()}: ${ethers.utils.formatEther(state.committed.balances.ETH)}`)
  } else {
    console.log(`Commited ETH balance for ${wallet.address()}: 0`)
  }

  if (state.verified.balances.ETH) {
    console.log(`Verified ETH balance for ${wallet.address()}: ${ethers.utils.formatEther(state.verified.balances.ETH)}`)
  } else {
    console.log(`Verified ETH balance for ${wallet.address()}: 0`)
  }
}

module.exports = {
  getZkSyncProvider,
  getEthereumProvider,
  depositToZkSync,
  displayZkSyncBalance,
  transfer,
  withdrawToEthereum,
  getFee,
  initAccount
}
