import { Price, Token } from '@uniswap/sdk-core'
import JSBI from 'jsbi'
import { Q192 } from '../internalConstants'
import { encodeSqrtRatioX96 } from './encodeSqrtRatioX96'
import { TickMath } from './tickMath'

/**
 * Returns a price object corresponding to the input tick and the base/quote token
 * Inputs must be tokens because the address order is used to interpret the price represented by the tick
 * @param baseToken the base token of the price
 * @param quoteToken the quote token of the price
 * @param tick the tick for which to return the price
 */
export function tickToPrice(baseToken: Token, quoteToken: Token, tick: number): Price<Token, Token> {
  const sqrtRatioX96 = TickMath.getSqrtRatioAtTick(tick)

  const ratioX192 = JSBI.multiply(sqrtRatioX96, sqrtRatioX96)

  return baseToken.sortsBefore(quoteToken)
    ? new Price(baseToken, quoteToken, Q192, ratioX192)
    : new Price(baseToken, quoteToken, ratioX192, Q192)
}


/**
 * Returns the tick that is closest in price to the input price
 * @param price for which to return the closest tick
 * @param threshold the maximum allowed percentage difference between the input price and the tick price
 * 
 * [RAMSES CORE EDIT]
 * Currently, this function is extremely strict, it will round to next possible tick strictly if equal or greater.
 * It makes sense because there is no way to partition a tick into smaller ticks, but it is not ideal for our use case.
 * We will test a more lenient version of this function by using 99% as the threshold.
 * That means, for example, if the sqrtRatioX96 of the price 1% greater than the sqrtRatioX96 of the tick, we will round to the next tick.
 * 
 * For example, 0.9400000002 tick if you pass 0.94, it would give 0.93 tick, in this case, it will round to 0.94 tick.
 * 
 * Warning: the 99% arbitrary is risky, it could affect bigger tick positions despite fixing the stable ones. Needs extra testing.
 */
export function priceToClosestTick(price: Price<Token, Token>, isOneTickPosition: boolean = false): number {
  const threshold = JSBI.BigInt(1); // 99%+ price

  const sorted = price.baseCurrency.sortsBefore(price.quoteCurrency);

  const sqrtRatioX96 = sorted
    ? encodeSqrtRatioX96(price.numerator, price.denominator)
    : encodeSqrtRatioX96(price.denominator, price.numerator);

  let tick = TickMath.getTickAtSqrtRatio(sqrtRatioX96);
  const nextTickPrice = tickToPrice(price.baseCurrency, price.quoteCurrency, tick + 1);

  if (isOneTickPosition) {
    // Calculate the percentage difference between the next tick price and the given price
    const priceDifference = sorted 
      ? nextTickPrice.divide(price).subtract(1).multiply(100)
      : price.divide(nextTickPrice).subtract(1).multiply(100);

    // If the price difference is within the threshold, choose the next tick
    if (Math.abs(Number(priceDifference.toFixed(0))) < Number(threshold.toString())) {
      tick++;
    } else {
      if (sorted) {
        if (!price.lessThan(nextTickPrice)) {
          tick++;
        }
      } else {
        if (!price.greaterThan(nextTickPrice)) {
          tick++;
        }
      }
    }
  } else {
    // Original logic
    if (sorted) {
      if (!price.lessThan(nextTickPrice)) {
        tick++;
      }
    } else {
      if (!price.greaterThan(nextTickPrice)) {
        tick++;
      }
    }
  }

  return tick;
}



