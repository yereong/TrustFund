const hre = require("hardhat");

async function main() {
  const TrustFund = await hre.ethers.getContractFactory("TrustFund");
  const contract = await TrustFund.deploy();

  await contract.waitForDeployment();

  console.log("TrustFund deployed at:", await contract.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
