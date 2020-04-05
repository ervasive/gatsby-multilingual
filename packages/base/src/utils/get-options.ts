import { defaultsDeep, memoize } from 'lodash'
import { DEFAULT_OPTIONS } from '../constants'
import { Options } from '../types'

/**
 * Returns plugin options with default values for missing keys.
 *
 * @param options - Potentially incomplete plugin options
 * @returns Plugin options with default values for missing keys
 */
export const getOptions = memoize(
  (options?: Partial<Options>): Options => {
    const result: Options = defaultsDeep({}, options, DEFAULT_OPTIONS)

    // Make sure the default locale is present in available locales
    const isDefaultLocaleIncluded = result.availableLocales.find(
      ({ id, displayValue }) =>
        id.toLowerCase() === result.defaultLocale.id.toLowerCase() &&
        displayValue.toLowerCase() ===
          result.defaultLocale.displayValue.toLowerCase(),
    )

    if (!isDefaultLocaleIncluded) {
      result.availableLocales.unshift(result.defaultLocale)
    }

    return result
  },
)
