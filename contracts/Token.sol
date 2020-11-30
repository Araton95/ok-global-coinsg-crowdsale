pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";


contract Token is ERC20Detailed, ERC20Burnable {
  address public owner;

  constructor () public ERC20Detailed("MY IDENTITY COIN", "MYID", 18) {
    owner = msg.sender;
    _mint(owner, 100000000000 ether);
  }


    /**
     * @dev mint : To increase total supply of tokens
     */
    function mint(address receiver, uint256 amount) public returns (bool) {
        require(amount > 0, "mint: Invalid amount");
        require(owner == msg.sender, "mint: UnAuthorized");

        _mint(receiver, amount);
    }
}
