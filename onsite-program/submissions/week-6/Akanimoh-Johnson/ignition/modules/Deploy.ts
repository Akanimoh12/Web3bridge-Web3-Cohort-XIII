
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { getAddress } from "ethers"; 

const DeployModule = buildModule("DeployModule", (m) => {
  const permit2 = "0x000000000022D473030F116dDEE9F6B43aC78BA3";
  const uniswapV2Router = getAddress("0x7a250d5630b4cf539739df2c5dacb4c659f2488d");

  const swapHelper = m.contract("SwapHelper", [permit2, uniswapV2Router]);

  return { swapHelper };
});

export default DeployModule;