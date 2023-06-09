const HDWalletProvider = require ('@truffle/hdwallet-provider');
require('dotenv').config();

module.exports = {

  networks: {

    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },
    sepolia: {
      provider: function(){ 
        return new HDWalletProvider(
          `${process.env.MNEMONIC}`, 
          `https://sepolia.infura.io/v3/${process.env.INFURA_ID}`
        )
      },
      network_id:11155111,
    },
  },

  plugins: ["solidity-coverage"],

  mocha: {
    reporter: 'eth-gas-reporter',
    showTimeSpent: true,
  },

  compilers: {
    solc: {
      version: "0.8.18",      // Fetch exact version from solc-bin (default: truffle's version)
        settings: {          // See the solidity docs for advice about optimization and evmVersion
          optimizer: {
            enabled: false,
            runs: 200
          },
        }
    }
  }
};