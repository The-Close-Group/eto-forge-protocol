import "@nomicfoundation/hardhat-toolbox";

// Private key from the user
const PRIVATE_KEY = "0xe555d4ec5d27fe54ae0ef4b30d81fe429799763f920de796d776cd03c4a3bd36";

export default {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    etoTestnet: {
      url: "https://subnets.avax.network/eto/testnet/rpc",
      chainId: 83055,
      accounts: [PRIVATE_KEY],
      gasPrice: 25000000000, // 25 gwei
    },
  },
  etherscan: {
    apiKey: {
      etoTestnet: "no-api-key-needed", // Placeholder
    },
    customChains: [
      {
        network: "etoTestnet",
        chainId: 83055,
        urls: {
          apiURL: "https://subnets-test.avax.network/eto/api",
          browserURL: "https://subnets-test.avax.network/eto",
        },
      },
    ],
  },
};
