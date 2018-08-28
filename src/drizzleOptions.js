import BlockMarket from '../build/contracts/BlockMarket.json';

const drizzleOptions = {
  web3: {
    block: false,
    fallback: {
      type: 'ws',
      url: 'ws://127.0.0.1:8545'
    }
  },
  contracts: [
    BlockMarket
  ],
  events: {
    BlockMarket: ['adminSet',
                  'merchantApproved', 
                  'merchantRejected', 
                  'storeOpened',
                  'merchantRejected',
                  'storeOpened',
                  'productAdded',
                  'orderPlaced',
                  'orderShipped',
                  'withdrawalMade']
  },
  polls: {
    accounts: 1500
  },
  syncAlways: true
}

export default drizzleOptions;