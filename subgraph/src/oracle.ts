import { BigInt, BigDecimal } from "@graphprotocol/graph-ts";
import { PriceUpdated as PriceUpdatedEvent } from "../generated/OracleAggregator/OracleAggregator";
import { OraclePriceUpdate, PriceCandle, Protocol } from "../generated/schema";

const PROTOCOL_ID = "eto-protocol";
const DECIMALS_18 = BigDecimal.fromString("1000000000000000000");

function getHourId(timestamp: BigInt): string {
  let hourIndex = timestamp.toI32() / 3600;
  return hourIndex.toString();
}

export function handlePriceUpdated(event: PriceUpdatedEvent): void {
  let priceUpdate = new OraclePriceUpdate(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  
  priceUpdate.txHash = event.transaction.hash;
  priceUpdate.blockNumber = event.block.number;
  priceUpdate.timestamp = event.block.timestamp;
  priceUpdate.price = event.params.price.toBigDecimal().div(DECIMALS_18);
  priceUpdate.source = "oracle-aggregator";
  
  priceUpdate.save();

  // Update protocol current price
  let protocol = Protocol.load(PROTOCOL_ID);
  if (protocol) {
    protocol.currentMAANGPrice = priceUpdate.price;
    protocol.lastUpdatedBlock = event.block.number;
    protocol.lastUpdatedTimestamp = event.block.timestamp;
    protocol.save();
  }

  // Update hourly candle
  let hourId = getHourId(event.block.timestamp);
  let candle = PriceCandle.load(hourId);
  if (!candle) {
    candle = new PriceCandle(hourId);
    let hourStart = event.block.timestamp.toI32() / 3600 * 3600;
    candle.periodStart = BigInt.fromI32(hourStart);
    candle.periodEnd = BigInt.fromI32(hourStart + 3600);
    candle.oracleOpen = priceUpdate.price;
    candle.oracleHigh = priceUpdate.price;
    candle.oracleLow = priceUpdate.price;
    candle.oracleClose = priceUpdate.price;
    candle.dmmOpen = BigDecimal.zero();
    candle.dmmHigh = BigDecimal.zero();
    candle.dmmLow = BigDecimal.zero();
    candle.dmmClose = BigDecimal.zero();
    candle.volumeUSD = BigDecimal.zero();
    candle.swapCount = BigInt.zero();
  }
  
  // Update oracle OHLC
  if (priceUpdate.price.gt(candle.oracleHigh)) {
    candle.oracleHigh = priceUpdate.price;
  }
  if (priceUpdate.price.lt(candle.oracleLow) || candle.oracleLow.equals(BigDecimal.zero())) {
    candle.oracleLow = priceUpdate.price;
  }
  candle.oracleClose = priceUpdate.price;
  candle.save();
}

