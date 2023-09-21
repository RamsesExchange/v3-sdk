export const FACTORY_ADDRESS = '0xAA2cd7477c451E703f3B9Ba5663334914763edF8'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

export const POOL_INIT_CODE_HASH = '0x1565b129f2d1790f12d45301b9b084335626f0c92410bc43130763b69971135d'

/**
 * The default factory enabled fee amounts, denominated in hundredths of bips.
 */
export enum FeeAmount {
  STABLE = 50,
  LOWEST = 100,
  COMPLETE = 250,
  LOW = 500,
  MEDIUM = 3000,
  HIGH = 10000
}
