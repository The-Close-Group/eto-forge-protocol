import { BigInt, BigDecimal, Address } from "@graphprotocol/graph-ts";
import {
  VaultDeposit as VaultDepositEvent,
  DripCommitted as DripCommittedEvent,
  DripExecuted as DripExecutedEvent,
} from "../generated/SmaangVault/SmaangVault";
import { Deposit, Withdrawal, DripEvent, VaultSnapshot, Protocol, User } from "../generated/schema";

const PROTOCOL_ID = "eto-protocol";
const DECIMALS_18 = BigDecimal.fromString("1000000000000000000");
const DECIMALS_6 = BigDecimal.fromString("1000000");

function getOrCreateProtocol(): Protocol {
  let protocol = Protocol.load(PROTOCOL_ID);
  if (!protocol) {
    protocol = new Protocol(PROTOCOL_ID);
    protocol.totalSwapVolume = BigDecimal.zero();
    protocol.totalSwapCount = BigInt.zero();
    protocol.totalDeposits = BigDecimal.zero();
    protocol.totalWithdrawals = BigDecimal.zero();
    protocol.totalValueLocked = BigDecimal.zero();
    protocol.currentMAANGPrice = BigDecimal.zero();
    protocol.lastUpdatedBlock = BigInt.zero();
    protocol.lastUpdatedTimestamp = BigInt.zero();
  }
  return protocol;
}

function getOrCreateUser(address: Address): User {
  let user = User.load(address.toHexString());
  if (!user) {
    user = new User(address.toHexString());
    user.totalSwaps = BigInt.zero();
    user.totalSwapVolumeUSD = BigDecimal.zero();
    user.totalDeposited = BigDecimal.zero();
    user.totalWithdrawn = BigDecimal.zero();
    user.currentShares = BigDecimal.zero();
    user.firstSeenBlock = BigInt.zero();
    user.lastSeenBlock = BigInt.zero();
    user.firstSeenTimestamp = BigInt.zero();
    user.lastSeenTimestamp = BigInt.zero();
  }
  return user;
}

function getHourId(timestamp: BigInt): string {
  let hourIndex = timestamp.toI32() / 3600;
  return "vault-" + hourIndex.toString();
}

// Handle the deposit event (topic0: 0xcf75a80a22cde0edcefe708f860e644c73eb8921aac7890f3bec010eef965f64)
// Event structure: (address indexed owner, uint256 assets, uint256 shares)
export function handleDeposit(event: VaultDepositEvent): void {
  let deposit = new Deposit(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  
  deposit.txHash = event.transaction.hash;
  deposit.blockNumber = event.block.number;
  deposit.timestamp = event.block.timestamp;
  deposit.sender = event.params.owner; // Using owner as sender since that's what we have
  deposit.owner = event.params.owner;
  deposit.assets = event.params.assets.toBigDecimal().div(DECIMALS_18);
  deposit.shares = event.params.shares.toBigDecimal().div(DECIMALS_18);
  
  deposit.save();

  // Update protocol stats
  let protocol = getOrCreateProtocol();
  protocol.totalDeposits = protocol.totalDeposits.plus(deposit.assets);
  protocol.totalValueLocked = protocol.totalValueLocked.plus(deposit.assets);
  protocol.lastUpdatedBlock = event.block.number;
  protocol.lastUpdatedTimestamp = event.block.timestamp;
  protocol.save();

  // Update user stats
  let user = getOrCreateUser(event.params.owner);
  user.totalDeposited = user.totalDeposited.plus(deposit.assets);
  user.currentShares = user.currentShares.plus(deposit.shares);
  user.lastSeenBlock = event.block.number;
  user.lastSeenTimestamp = event.block.timestamp;
  if (user.firstSeenBlock.equals(BigInt.zero())) {
    user.firstSeenBlock = event.block.number;
    user.firstSeenTimestamp = event.block.timestamp;
  }
  user.save();

  // Update hourly snapshot
  updateVaultSnapshot(event.block.number, event.block.timestamp);
}

// Handle DripCommitted event (topic0: 0xdd90d87ade8de9e2a981cbd9ee8f6104b45abe962b1fe73be270d576ac841cb0)
// Event structure: (bytes32 indexed commitment, address indexed keeper)
export function handleDripCommitted(event: DripCommittedEvent): void {
  let dripEvent = new DripEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  
  dripEvent.txHash = event.transaction.hash;
  dripEvent.blockNumber = event.block.number;
  dripEvent.timestamp = event.block.timestamp;
  dripEvent.type = "commit";
  dripEvent.keeper = event.params.keeper;
  dripEvent.commitment = event.params.commitment;
  // These fields are not in the new event structure, set to zero
  dripEvent.stagedMAANG = BigDecimal.zero();
  dripEvent.stagedUSDC = BigDecimal.zero();
  
  dripEvent.save();
}

// Handle DripExecuted event (topic0: 0x69c32473484beb157bc3edf9bb9485f0c7e70e274354c77ad37acd5e074f744b)
// Event structure: (uint256 dmmMAANG, uint256 dmmUSDC, uint256 psmMAANG, uint256 psmUSDC)
export function handleDripExecuted(event: DripExecutedEvent): void {
  let dripEvent = new DripEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  
  dripEvent.txHash = event.transaction.hash;
  dripEvent.blockNumber = event.block.number;
  dripEvent.timestamp = event.block.timestamp;
  dripEvent.type = "execute";
  // No keeper in this event, use transaction sender
  dripEvent.keeper = event.transaction.from;
  dripEvent.dmmMAANG = event.params.dmmMAANG.toBigDecimal().div(DECIMALS_18);
  dripEvent.dmmUSDC = event.params.dmmUSDC.toBigDecimal().div(DECIMALS_6);
  dripEvent.psmMAANG = event.params.psmMAANG.toBigDecimal().div(DECIMALS_18);
  dripEvent.psmUSDC = event.params.psmUSDC.toBigDecimal().div(DECIMALS_6);
  
  dripEvent.save();

  // Update hourly snapshot
  updateVaultSnapshot(event.block.number, event.block.timestamp);
}

function updateVaultSnapshot(blockNumber: BigInt, timestamp: BigInt): void {
  let hourId = getHourId(timestamp);
  let snapshot = VaultSnapshot.load(hourId);
  
  if (!snapshot) {
    snapshot = new VaultSnapshot(hourId);
    snapshot.timestamp = timestamp;
    snapshot.blockNumber = blockNumber;
    snapshot.totalAssets = BigDecimal.zero();
    snapshot.totalSupply = BigDecimal.zero();
    snapshot.sharePrice = BigDecimal.fromString("1");
    snapshot.totalDeposited = BigDecimal.zero();
    snapshot.totalWithdrawn = BigDecimal.zero();
    snapshot.totalDripsExecuted = BigInt.zero();
  }
  
  // Update from protocol stats
  let protocol = Protocol.load(PROTOCOL_ID);
  if (protocol) {
    snapshot.totalDeposited = protocol.totalDeposits;
    snapshot.totalWithdrawn = protocol.totalWithdrawals;
    snapshot.totalAssets = protocol.totalValueLocked;
  }
  
  snapshot.blockNumber = blockNumber;
  snapshot.save();
}
