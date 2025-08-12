import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { vars } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: "https://eth-mainnet.g.alchemy.com/v2/RyUpg4QFZGXfE_6vvXCPbhC8uy6etzmV",
      accounts: [vars.get("PRIVATE_KEY")],
      gasPrice: 100000000000, // 20 Gwei
    },
  },
  etherscan: {
    apiKey: {
      sepolia: "FDNINJNMBGY2XV7D2KD998SURHTAGZZEKD",
    },
  },
};

export default config;