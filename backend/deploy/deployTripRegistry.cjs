const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const TripRegistry = await hre.ethers.getContractFactory("TripRegistry");
  const registry = await TripRegistry.deploy();

  await registry.waitForDeployment();

  console.log("TripRegistry deployed to:", await registry.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
