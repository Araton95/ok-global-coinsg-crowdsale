const { accounts, contract } = require('@openzeppelin/test-environment')
const { balance, constants, ether, expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers')
const { ZERO_ADDRESS } = constants
const { expect } = require('chai')

const OKGlobalCrowdsale = contract.fromArtifact('OKGlobalCrowdsale')
const Token = contract.fromArtifact('Token')

describe('OKglobalCrowdsale.test', function () {
  const [ owner, investor, purchaser ] = accounts
  const configs = {
    'TOKEN_PRICE':  '500000',         // 1 ETH = 500,000 tokens
    'HARD_CAP':     '50000',          // 50,000 ETH hard cap
    'TOKENS_CAP':   '25000000000',    // 25 Billion tokens (token price * hard cap)
    'START_DATE':   '',               // Will be filled later
    'DURATION':     5184000,          // 60 days in seconds
  }

  before('Deploy contract', async () => {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
    await time.advanceBlock()

    configs['START_DATE'] = (await time.latest()).add(time.duration.days(1)).toString()

    // Deploy token and crowdsale contracts
    this.token = await Token.new()
    this.crowdsale = await OKGlobalCrowdsale.new(
      configs['TOKEN_PRICE'],
      owner,
      this.token.address,
      ether(configs['HARD_CAP']),
      parseInt(configs['START_DATE']),
      parseInt(configs['START_DATE']) + configs['DURATION']
    )

    // Transfer crowdsale tokens to crowdsale address
    await this.token.transfer(this.crowdsale.address, ether(configs['TOKENS_CAP']))
  })

  describe('Check methods before start time', async () => {
    it('Check contract balance', async () => {
      const balance = await this.token.balanceOf(this.crowdsale.address)
      expect(balance.toString()).to.equal(ether(configs['TOKENS_CAP']).toString())
    })

    it('Purchase should be failed if start time is not reached', async () => {
      await expectRevert(
        this.crowdsale.send(ether('1'), { from: investor }),
        "TimedCrowdsale: not open"
      )
    })

    it('Increase time', async () => {
      await time.increaseTo(configs['START_DATE'])
    })
  })

  describe('What if purchase different amounts', async () => {
    it('Purchase for 0x0 address should be failed', async () => {
      await expectRevert(
        this.crowdsale.buyTokens(ZERO_ADDRESS, { from: investor, value: ether('1') }),
        "Crowdsale: beneficiary is the zero address"
      )
    })

    it('Purchase without ETH should be failed', async () => {
      await expectRevert(
        this.crowdsale.buyTokens(investor, { from: investor, value: '0x0' }),
        "Crowdsale: weiAmount is 0"
      )
    })

    it('Purchase with 1 wei (minimum amount), check investor token balance and company ETH balance', async () => {
      const ownerEthBalanceBefore = await balance.current(owner)
      const investorBalanceBefore = await this.token.balanceOf(investor)
      const contractBalanceBefore = await this.token.balanceOf(this.crowdsale.address)

      // Send ETH to crowdsale
      await this.crowdsale.send('1', { from: investor })

      const ownerEthBalanceAfter = await balance.current(owner)
      let different = ownerEthBalanceAfter.sub(ownerEthBalanceBefore).toString()
      expect(different).to.equal('1')

      const investorBalanceAfter = await this.token.balanceOf(investor)
      different = investorBalanceAfter.sub(investorBalanceBefore).toString()
      expect(different).to.equal('500000')

      const contractBalanceAfter = await this.token.balanceOf(this.crowdsale.address)
      different = contractBalanceAfter.sub(contractBalanceBefore).toString()
      expect(different).to.equal('-500000')
    })

    it('Purchase with 1 ETH, check investor token balance and company ETH balance', async () => {
      const ownerEthBalanceBefore = await balance.current(owner)
      const investorBalanceBefore = await this.token.balanceOf(investor)
      const contractBalanceBefore = await this.token.balanceOf(this.crowdsale.address)

      // Send ETH to crowdsale
      await this.crowdsale.send(ether('1').toString(), { from: investor })

      const ownerEthBalanceAfter = await balance.current(owner)
      let different = ownerEthBalanceAfter.sub(ownerEthBalanceBefore).toString()
      expect(different).to.equal(ether('1').toString())

      const investorBalanceAfter = await this.token.balanceOf(investor)
      different = investorBalanceAfter.sub(investorBalanceBefore).toString()
      expect(different).to.equal(ether('500000').toString())

      const contractBalanceAfter = await this.token.balanceOf(this.crowdsale.address)
      different = contractBalanceAfter.sub(contractBalanceBefore).toString()
      expect(different).to.equal(ether('-500000').toString())
    })

    it('Purchase with 10 ETH, check investor token balance and company ETH balance', async () => {
      const ownerEthBalanceBefore = await balance.current(owner)
      const investorBalanceBefore = await this.token.balanceOf(investor)
      const contractBalanceBefore = await this.token.balanceOf(this.crowdsale.address)

      // Send ETH to crowdsale
      await this.crowdsale.send(ether('10').toString(), { from: investor })

      const ownerEthBalanceAfter = await balance.current(owner)
      let different = ownerEthBalanceAfter.sub(ownerEthBalanceBefore).toString()
      expect(different).to.equal(ether('10').toString())

      const investorBalanceAfter = await this.token.balanceOf(investor)
      different = investorBalanceAfter.sub(investorBalanceBefore).toString()
      expect(different).to.equal(ether('5000000').toString())

      const contractBalanceAfter = await this.token.balanceOf(this.crowdsale.address)
      different = contractBalanceAfter.sub(contractBalanceBefore).toString()
      expect(different).to.equal(ether('-5000000').toString())
    })

    it('Purchase with 99 ETH, check investor token balance and company ETH balance', async () => {
      const ownerEthBalanceBefore = await balance.current(owner)
      const investorBalanceBefore = await this.token.balanceOf(purchaser)
      const contractBalanceBefore = await this.token.balanceOf(this.crowdsale.address)

      // Send ETH to crowdsale
      await this.crowdsale.send(ether('99').toString(), { from: purchaser })

      const ownerEthBalanceAfter = await balance.current(owner)
      let different = ownerEthBalanceAfter.sub(ownerEthBalanceBefore).toString()
      expect(different).to.equal(ether('99').toString())

      const investorBalanceAfter = await this.token.balanceOf(purchaser)
      different = investorBalanceAfter.sub(investorBalanceBefore).toString()
      expect(different).to.equal(ether('49500000').toString())

      const contractBalanceAfter = await this.token.balanceOf(this.crowdsale.address)
      different = contractBalanceAfter.sub(contractBalanceBefore).toString()
      expect(different).to.equal(ether('-49500000').toString())
    })
  })

  describe('What if finish time has been reached', async () => {
    before('Deploy contract', async () => {
      // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
      await time.advanceBlock()

      configs['START_DATE'] = (await time.latest()).add(time.duration.days(1)).toString()

      // Deploy token and crowdsale contracts
      this.token = await Token.new()
      this.crowdsale = await OKGlobalCrowdsale.new(
        configs['TOKEN_PRICE'],
        owner,
        this.token.address,
        ether(configs['HARD_CAP']),
        parseInt(configs['START_DATE']),
        parseInt(configs['START_DATE']) + configs['DURATION']
      )

      // Transfer crowdsale tokens to crowdsale address
      await this.token.transfer(this.crowdsale.address, ether(configs['TOKENS_CAP']))
    })

    it('Increase time', async () => {
      await time.increaseTo(parseInt(configs['START_DATE']) + configs['DURATION'] + 10)
    })

    it('Purchase should be failed if start time is not reached', async () => {
      await expectRevert(
        this.crowdsale.send(ether('1'), { from: investor }),
        "TimedCrowdsale: not open"
      )
    })
  })
})