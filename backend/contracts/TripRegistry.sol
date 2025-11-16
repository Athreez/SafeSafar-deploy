// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TripRegistry {
    enum Status { PENDING, ACTIVE, COMPLETED }

    struct Trip {
        address creator;
        uint256 timestamp;
        string meta;      // JSON metadata or IPFS hash
        Status status;
    }

    Trip[] public trips;

    event TripCreated(uint256 indexed tripId, address indexed creator, string meta);
    event TripStatusUpdated(uint256 indexed tripId, Status status);

    function createTrip(string calldata meta) external returns (uint256) {
        uint256 id = trips.length;
        trips.push(Trip({
            creator: msg.sender,
            timestamp: block.timestamp,
            meta: meta,
            status: Status.PENDING
        }));

        emit TripCreated(id, msg.sender, meta);
        return id;
    }

    function updateStatus(uint256 tripId, Status newStatus) external {
        require(tripId < trips.length, "Invalid tripId");
        // optionally: restrict who can change status (owner, admin, or everyone)
        // For now let the trip creator or owner update it:
        require(msg.sender == trips[tripId].creator, "Only creator can update");

        trips[tripId].status = newStatus;
        emit TripStatusUpdated(tripId, newStatus);
    }

    function getTrip(uint256 tripId) external view returns (Trip memory) {
        require(tripId < trips.length, "Invalid tripId");
        return trips[tripId];
    }

    function totalTrips() external view returns (uint256) {
        return trips.length;
    }
}
