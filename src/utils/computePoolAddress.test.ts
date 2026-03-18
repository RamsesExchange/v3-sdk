import { Token } from '@uniswap/sdk-core'
import { FeeAmount, TICK_SPACINGS } from '../constants'
import { computePoolAddress } from './computePoolAddress'

describe('#computePoolAddress', () => {
  const factoryAddress = '0x1111111111111111111111111111111111111111'
  it('should correctly compute the pool address', () => {
    const tokenA = new Token(1, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 18, 'USDC', 'USD Coin')
    const tokenB = new Token(1, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'DAI Stablecoin')
    const result = computePoolAddress({
      factoryAddress,
      tickSpacing: TICK_SPACINGS[FeeAmount.LOW],
      tokenA,
      tokenB
    })

    expect(result).toEqual('0xE6843dD76b942866E5d14104BE14dc069b0B4D36')
  })

  it('should give the same address regardless of token order', () => {
    const USDC = new Token(1, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 18, 'USDC', 'USD Coin')
    const DAI = new Token(1, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'DAI Stablecoin')
    let tokenA = USDC
    let tokenB = DAI
    const resultA = computePoolAddress({
      factoryAddress,
      tickSpacing: TICK_SPACINGS[FeeAmount.LOW],
      tokenA,
      tokenB
    })

    tokenA = DAI

    tokenB = USDC
    const resultB = computePoolAddress({
      factoryAddress,
      tickSpacing: TICK_SPACINGS[FeeAmount.LOW],
      tokenA,
      tokenB
    })

    expect(resultA).toEqual(resultB)
  })
})
