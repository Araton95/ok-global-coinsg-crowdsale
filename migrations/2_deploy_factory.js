const { ether } = require('@openzeppelin/test-helpers')

const Token = artifacts.require('Token')
const OKGlobalCrowdsale = artifacts.require('OKGlobalCrowdsale')

module.exports = function (deployer, network, accounts) {
  const deployerWallet = accounts[0]
  console.log('Deployer address:', deployerWallet)

  const mainnetAddresses = {
    'TOKEN':  '0xbee571a0a8599ada125e1a33e56287c3c594a5e2',
    'WALLET': '0xc7536654aa2bc3D6fD36135b55c19f1d980f99f0'
  }

  const configs = {
    'TOKEN_PRICE':  '500000',       // 1 ETH = 500,000 tokens
    'HARD_CAP':     '50000',        // 50,000 ETH hard cap
    'TOKENS_CAP':   '25000000000',  // 25 Billion tokens (token price * hard cap)
    'START_DATE':   1609027200,     // 27 Dec 2020, 00:00:00 (UNIX format)
    'DURATION':     5184000,        // 60 days in seconds
  }

  deployer.then(async () => {
    let crowdsale

    // For Mainnet deployment
    if (network === 'mainnet') {
      crowdsale = await deployer.deploy(
        OKGlobalCrowdsale,
        configs['TOKEN_PRICE'],
        mainnetAddresses['WALLET'],
        mainnetAddresses['TOKEN'],
        ether(configs['HARD_CAP']),
        configs['START_DATE'],
        configs['START_DATE'] + configs['DURATION']
      )
    } else {
      // Deploy token and crowdsale contracts
      const token = await deployer.deploy(Token)
      crowdsale =  await deployer.deploy(
        OKGlobalCrowdsale,
        configs['TOKEN_PRICE'],
        deployerWallet,
        token.address,
        ether(configs['HARD_CAP']),
        configs['START_DATE'],
        configs['START_DATE'] + configs['DURATION']
      )

      // Transfer crowdsale tokens to crowdsale address
      await token.transfer(crowdsale.address, ether(configs['TOKENS_CAP']))
    }

    console.log('Crowdsale address:', crowdsale.address)
    console.log('Send 25 billion tokens to crowdsale contract address!')
  })
}