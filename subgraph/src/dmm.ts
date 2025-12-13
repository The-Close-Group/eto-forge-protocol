import { BigInt, BigDecimal, Address, Bytes } from "@graphprotocol/graph-ts";
import {
  Swap as SwapEvent,
  LiquidityAdded as LiquidityAddedEvent,
  LiquidityRemoved as LiquidityRemovedEvent,
} from "../generated/DynamicMarketMaker/DynamicMarketMaker";
import { Swap, LiquidityEvent, Protocol, User, PriceCandle } from "../generated/schema";

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
  return hourIndex.toString();
}

export function handleSwap(event: SwapEvent): void {
  // Create swap entity
  let swap = new Swap(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  
  swap.txHash = event.transaction.hash;
  swap.blockNumber = event.block.number;
  swap.timestamp = event.block.timestamp;
  swap.user = event.params.user;
  swap.tokenIn = event.params.tokenIn;
  swap.tokenOut = event.params.tokenOut;
  
  // Determine decimals based on token (USDC = 6, MAANG = 18)
  let amountInDecimal = event.params.amountIn.toBigDecimal().div(DECIMALS_18);
  let amountOutDecimal = event.params.amountOut.toBigDecimal().div(DECIMALS_18);
  
  swap.amountIn = amountInDecimal;
  swap.amountOut = amountOutDecimal;
  swap.priceAtSwap = event.params.price.toBigDecimal().div(DECIMALS_18);
  swap.gasUsed = event.transaction.gasLimit;
  swap.gasPrice = event.transaction.gasPrice;
  
  swap.save();

  // Update protocol stats
  let protocol = getOrCreateProtocol();
  protocol.totalSwapCount = protocol.totalSwapCount.plus(BigInt.fromI32(1));
  protocol.totalSwapVolume = protocol.totalSwapVolume.plus(amountInDecimal);
  protocol.currentMAANGPrice = swap.priceAtSwap;
  protocol.lastUpdatedBlock = event.block.number;
  protocol.lastUpdatedTimestamp = event.block.timestamp;
  protocol.save();

  // Update user stats
  let user = getOrCreateUser(event.params.user);
  user.totalSwaps = user.totalSwaps.plus(BigInt.fromI32(1));
  user.totalSwapVolumeUSD = user.totalSwapVolumeUSD.plus(amountInDecimal);
  user.lastSeenBlock = event.block.number;
  user.lastSeenTimestamp = event.block.timestamp;
  if (user.firstSeenBlock.equals(BigInt.zero())) {
    user.firstSeenBlock = event.block.number;
    user.firstSeenTimestamp = event.block.timestamp;
  }
  user.save();

  // Update hourly candle
  let hourId = getHourId(event.block.timestamp);
  let candle = PriceCandle.load(hourId);
  if (!candle) {
    candle = new PriceCandle(hourId);
    let hourStart = event.block.timestamp.toI32() / 3600 * 3600;
    candle.periodStart = BigInt.fromI32(hourStart);
    candle.periodEnd = BigInt.fromI32(hourStart + 3600);
    candle.dmmOpen = swap.priceAtSwap;
    candle.dmmHigh = swap.priceAtSwap;
    candle.dmmLow = swap.priceAtSwap;
    candle.dmmClose = swap.priceAtSwap;
    candle.oracleOpen = BigDecimal.zero();
    candle.oracleHigh = BigDecimal.zero();
    candle.oracleLow = BigDecimal.zero();
    candle.oracleClose = BigDecimal.zero();
    candle.volumeUSD = BigDecimal.zero();
    candle.swapCount = BigInt.zero();
  }
  
  // Update candle
  if (swap.priceAtSwap.gt(candle.dmmHigh)) {
    candle.dmmHigh = swap.priceAtSwap;
  }
  if (swap.priceAtSwap.lt(candle.dmmLow) || candle.dmmLow.equals(BigDecimal.zero())) {
    candle.dmmLow = swap.priceAtSwap;
  }
  candle.dmmClose = swap.priceAtSwap;
  candle.volumeUSD = candle.volumeUSD.plus(amountInDecimal);
  candle.swapCount = candle.swapCount.plus(BigInt.fromI32(1));
  candle.save();
}

export function handleLiquidityAdded(event: LiquidityAddedEvent): void {
  let liquidityEvent = new LiquidityEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  
  liquidityEvent.txHash = event.transaction.hash;
  liquidityEvent.blockNumber = event.block.number;
  liquidityEvent.timestamp = event.block.timestamp;
  liquidityEvent.type = "add";
  liquidityEvent.provider = event.params.provider;
  liquidityEvent.maangAmount = event.params.driAmount.toBigDecimal().div(DECIMALS_18);
  liquidityEvent.usdcAmount = event.params.usdcAmount.toBigDecimal().div(DECIMALS_6);
  liquidityEvent.liquidityTokens = event.params.liquidity.toBigDecimal().div(DECIMALS_18);
  
  liquidityEvent.save();
}

export function handleLiquidityRemoved(event: LiquidityRemovedEvent): void {
  let liquidityEvent = new LiquidityEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  
  liquidityEvent.txHash = event.transaction.hash;
  liquidityEvent.blockNumber = event.block.number;
  liquidityEvent.timestamp = event.block.timestamp;
  liquidityEvent.type = "remove";
  liquidityEvent.provider = event.params.provider;
  liquidityEvent.maangAmount = event.params.driAmount.toBigDecimal().div(DECIMALS_18);
  liquidityEvent.usdcAmount = event.params.usdcAmount.toBigDecimal().div(DECIMALS_6);
  liquidityEvent.liquidityTokens = event.params.liquidity.toBigDecimal().div(DECIMALS_18);
  
  liquidityEvent.save();
}

