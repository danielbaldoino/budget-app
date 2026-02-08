/**
 * Common validation constants used across forms
 */
export const VALIDATION = {
  MIN_INPUT_LENGTH: 3,
  MIN_PASSWORD_LENGTH: 8,
  MAX_INPUT_LENGTH: 255,
  DEFAULT_QUANTITY: 1,
  MIN_QUANTITY: 1,
  QUANTITY_INCREMENT: 10,
} as const

/**
 * Time-based constants in milliseconds
 */
export const TIME = {
  ONE_SECOND: 1000,
  ONE_MINUTE: 1000 * 60,
  FIVE_MINUTES: 1000 * 60 * 5,
  ONE_HOUR: 1000 * 60 * 60,
} as const
