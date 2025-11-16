import { expect } from "chai";
import hardhat from "hardhat";
const { ethers } = hardhat;

describe("TripRegistry", function () {
  let TripRegistry;
  let registry;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    TripRegistry = await ethers.getContractFactory("TripRegistry");
    registry = await TripRegistry.deploy();
    // ethers v6 uses waitForDeployment()
    if (typeof registry.waitForDeployment === "function") {
      await registry.waitForDeployment();
    }
  });

  it("starts with zero trips", async function () {
    expect(await registry.totalTrips()).to.equal(0);
  });

  it("allows creating a trip and returns the trip id", async function () {
    const meta = JSON.stringify({ note: "test trip" });
    const tx = await registry.createTrip(meta);
    const receipt = await tx.wait();
    // ethers v6 may not populate `receipt.events`; parse logs with contract interface
    let ev;
    for (const l of receipt.logs) {
      try {
        const parsed = registry.interface.parseLog(l);
        if (parsed.name === "TripCreated") {
          ev = { event: parsed.name, args: parsed.args };
          break;
        }
      } catch (err) {
        // ignore unparseable logs
      }
    }
    expect(ev).to.not.be.undefined;
    const tripId = ev.args.tripId;
    // normalize numeric event args to JS numbers for comparison
    expect(Number(tripId)).to.equal(0);
    expect(Number(await registry.totalTrips())).to.equal(1);
    const trip = await registry.getTrip(0);
    expect(trip.creator).to.equal(owner.address);
    expect(trip.meta).to.equal(meta);
    // status should be 0 (PENDING)
    expect(Number(trip.status)).to.equal(0);
  });

  it("allows creator to update status and rejects non-creator", async function () {
    const meta = JSON.stringify({ note: "owner trip" });
    const createTx = await registry.connect(owner).createTrip(meta);
    await createTx.wait();

    // owner updates status to ACTIVE (enum value 1)
    await expect(registry.connect(owner).updateStatus(0, 1)).to.not.be.reverted;
    const trip = await registry.getTrip(0);
    expect(trip.status).to.equal(1);

    // non-creator cannot update status
    await expect(registry.connect(addr1).updateStatus(0, 2)).to.be.revertedWith("Only creator can update");
  });
});
