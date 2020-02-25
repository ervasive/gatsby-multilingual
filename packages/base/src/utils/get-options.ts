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

    // Make sure the default language value is present in available langs
    if (!result.availableLanguages.includes(result.defaultLanguage)) {
      result.availableLanguages.unshift(result.defaultLanguage)
    }

    return result
  },
)
