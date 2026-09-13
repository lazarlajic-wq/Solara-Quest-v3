/**
 * Central Solaris market-fee rule (spec section 29). The fee is removed from
 * the economy, never redistributed. Rounding: round the fee to the nearest
 * whole Solaris (Math.round), payout is price minus that rounded fee, so
 * fee + payout always equals price exactly.
 */
export const MARKET_FEE_RATE = 0.05;

/** Fixed NPC/system sell value for legendary and mythical items or pets (spec section 30). */
export const LEGENDARY_SYSTEM_VALUE = 1;

export interface MarketFeeBreakdown {
  price: number;
  fee: number;
  payout: number;
}

export function computeMarketFee(price: number): MarketFeeBreakdown {
  if (!Number.isFinite(price) || price < 0) {
    throw new Error(`Invalid market price: ${price}`);
  }
  const fee = Math.round(price * MARKET_FEE_RATE);
  const payout = price - fee;
  return { price, fee, payout };
}
