const hre = require("hardhat");
const { MaxUint256 } = require("ethers");

async function main() {
  // Addresses
  const permit2Address = "0x000000000022D473030F116dDEE9F6B43aC78BA3";
  const tokenIn = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; 
  const tokenOut = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; 
  const swapHelperAddress = "Place Contract Address Here"; // Replace with actual deployed SwapHelper address
  const whaleAddress = "0x55FE002aefF02F77364de339a1292923A15844B8"; 
  const amountIn = BigInt(1000) * BigInt(10**6); // 1000 USDC (6 decimals)
  const minAmountOut = 0; // Set realistically in production
  const path = [tokenIn, tokenOut];
  const recipient = "0x58C25c26666B31241C67Cf7B9a82e325eB07c342"; // Your address or whale for testing
  const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour
  const nonce = MaxUint256; // Use a random/unique large number in production to avoid replays

  // Impersonate whale
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [whaleAddress],
  });
  const signer = await hre.ethers.getSigner(whaleAddress);

  // Fund signer with ETH for gas (if needed)
  await hre.network.provider.send("hardhat_setBalance", [
    whaleAddress,
    "0x" + (BigInt(10**18) * BigInt(10)).toString(16), // 10 ETH
  ]);

  // EIP-712 domain and types
  const domain = {
    name: "Permit2",
    version: "1",
    chainId: 1, // Mainnet chain ID
    verifyingContract: permit2Address,
  };

  const types = {
    PermitTransferFrom: [
      { name: "permitted", type: "TokenPermissions" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
    TokenPermissions: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
    ],
  };

  const message = {
    permitted: {
      token: tokenIn,
      amount: amountIn,
    },
    nonce: nonce,
    deadline: deadline,
  };

  // Sign the typed data
  const signature = await signer.signTypedData(domain, types, message);
  console.log("Signature:", signature);

  // Connect to SwapHelper
  const swapHelper = await hre.ethers.getContractAt("SwapHelper", swapHelperAddress, signer);

  // Prepare permit struct
  const permit = {
    permitted: {
      token: tokenIn,
      amount: amountIn,
    },
    nonce: nonce,
    deadline: deadline,
  };

  // Execute the swap (from signer or relayer; here same for simplicity)
  const tx = await swapHelper.permitAndSwap(
    whaleAddress, // owner
    permit,
    amountIn,
    minAmountOut,
    path,
    recipient,
    deadline,
    signature
  );
  await tx.wait();
  console.log("Swap executed in tx:", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});