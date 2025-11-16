import { ethers } from "ethers";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// __dirname fix for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load ABI
const abiPath = path.join(
  __dirname,
  "../artifacts/contracts/TripRegistry.sol/TripRegistry.json"
);
const abiJson = JSON.parse(fs.readFileSync(abiPath));
const abi = abiJson.abi;

let provider;
let wallet;
let contract;

export function initBlockchain() {
  try {
    const rpc = process.env.RPC_URL;
    const priv = process.env.PRIV_KEY;
    const addr = process.env.CONTRACT_ADDR;

    if (!rpc || !priv || !addr) {
      console.log("⚠ Blockchain config missing. Skipping initialization.");
      return;
    }

    provider = new ethers.JsonRpcProvider(rpc);
    wallet = new ethers.Wallet(priv, provider);
    contract = new ethers.Contract(addr, abi, wallet);

    console.log("✅ Blockchain connected. Contract:", addr);
  } catch (err) {
    console.error("❌ Blockchain init error:", err);
  }
}

export async function createTripOnChain(metaString) {
  if (!contract) throw new Error("Blockchain not initialized");

  const tx = await contract.createTrip(metaString);
  const receipt = await tx.wait();

  let parsedEvent = null;

  // Parse logs using ethers v6 API
  for (const log of receipt.logs) {
    try {
      const event = contract.interface.parseLog(log);
      if (event?.name === "TripCreated") {
        parsedEvent = event;
        break;
      }
    } catch { /* ignore failed parsing */ }
  }

  return {
    txHash: receipt.hash,
    tripId: parsedEvent ? Number(parsedEvent.args.tripId) : null,
  };
}

export async function updateStatusOnChain(tripId, statusEnum) {
  if (!contract) throw new Error("Blockchain not initialized");

  const tx = await contract.updateStatus(tripId, statusEnum);
  const receipt = await tx.wait();

  return receipt.hash;
}
