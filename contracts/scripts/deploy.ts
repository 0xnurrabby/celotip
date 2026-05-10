import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying CeloTip with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "CELO");

  const CeloTip = await ethers.getContractFactory("CeloTip");
  const ct = await CeloTip.deploy();
  await ct.waitForDeployment();
  const addr = await ct.getAddress();

  console.log("\n✅ CeloTip deployed to:", addr);
  console.log("Network:", network.name, "| Chain:", network.config.chainId);
  if (network.name === "celo")      console.log("Explorer: https://celoscan.io/address/" + addr);
  if (network.name === "alfajores") console.log("Explorer: https://alfajores.celoscan.io/address/" + addr);
  console.log("\nVerify: npx hardhat verify --network", network.name, addr);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
