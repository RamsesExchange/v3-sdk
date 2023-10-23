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


export function priceToClosestTick(price: Price<Token, Token>, isOneTickPosition: boolean = false): number {
  const threshold = JSBI.BigInt(1); 
  
  const sorted = price.baseCurrency.sortsBefore(price.quoteCurrency);
  
  const sqrtRatioX96 = sorted
  ? encodeSqrtRatioX96(price.numerator, price.denominator)
  : encodeSqrtRatioX96(price.denominator, price.numerator);
  
  let tick = TickMath.getTickAtSqrtRatio(sqrtRatioX96);
  
  const nextTickPrice = tickToPrice(price.baseCurrency, price.quoteCurrency, tick + 1);
 
  if (isOneTickPosition) {
    // Calculate the percentage difference between the next tick price and the given price
    const priceDifference = sorted 
    ? nextTickPrice.divide(price).subtract(1).multiply(10000)
    : price.divide(nextTickPrice).subtract(1).multiply(10000);
    // console.log('tick', tick, 'nextTickPrice', nextTickPrice.toSignificant(10), 'price', price.toSignificant(10), 'priceDifference', priceDifference.toFixed(10), 'threshold', threshold.toString())

    if (Math.abs(Number(priceDifference.toFixed(10))) < Number(threshold.toString()) && priceDifference.toFixed(10) !== '0' && price.toSignificant(10) !== '1') {
      tick++;
    } 
    else if (price.toSignificant(10) === '1') {
        tick = 0;
    }

    else  {
    console.log('hi', tick)
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
  }

  return tick;
}
