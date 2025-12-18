import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  console.log("Deploying MockUSDC to ETO Testnet...");

  // Get the deployer's signer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy MockUSDC
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();

  const address = await mockUSDC.getAddress();
  console.log("MockUSDC deployed to:", address);
  
  // Verify initial supply
  const balance = await mockUSDC.balanceOf(deployer.address);
  console.log("Deployer balance:", ethers.formatUnits(balance, 6), "mUSDC");

  // Test faucet
  console.log("\nTesting faucet...");
  const tx = await mockUSDC.faucet();
  await tx.wait();
  console.log("Faucet successful!");

  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
