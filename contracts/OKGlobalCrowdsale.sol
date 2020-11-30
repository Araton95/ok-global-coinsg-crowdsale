pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/crowdsale/validation/CappedCrowdsale.sol";
import "@openzeppelin/contracts/crowdsale/validation/TimedCrowdsale.sol";


contract OKGlobalCrowdsale is CappedCrowdsale, TimedCrowdsale {
  constructor (
    uint256 rate,
    address payable wallet,
    IERC20 token,
    uint256 cap,
    uint256 openingTime,
    uint256 closingTime
  )
    public
    Crowdsale(rate, wallet, token)
    CappedCrowdsale(cap)
    TimedCrowdsale(openingTime, closingTime)
  {
    // Silence
  }
}