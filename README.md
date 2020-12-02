# ok-global-coinsg-crowdsale

How to deploy:

1. Open the project folder

2. Rename `.env.sample` to `.env`

3. Paste your `PRIVATE_KEY` on `.env` file (without `0x`). It will be the deployer address, who should have enough ETH for deployment.

4. Open termnal and run `npm install`

5. Run `npm run ganache`

6. Open new terminal and run `npm run test`

7. Run `npm run deploy:mainnet`
