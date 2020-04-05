import { Result, Unit } from 'true-myth'
import { PluginOptions } from 'gatsby'
import { optionsSchema } from '../schemas'
import { PLUGIN_NAME } from '../constants'
import { GatsbyStorePlugin, Options } from '../types'

/**
 * Validate plugin requirements.
 *
 * Make sure that plugin options are valid, and no more than one plugin instance
 * is registered.
 *
 * @param plugins - Array of gatsby store plugins
 * @param options - Provided (potentially invalid) plugin options
 * @returns OK or Error result based on passed or failed plugin requirements
 */
export const validatePluginInstance = (
  plugins: GatsbyStorePlugin[],
  options?: PluginOptions,
): Result<Unit, string> => {
  // Validate that no more than one plugin instance is registered
  const pluginInstances = plugins.filter(({ name }) => name === PLUGIN_NAME)

  if (pluginInstances.length > 1) {
    return Result.err(
      `[${PLUGIN_NAME}] more than one plugin instance is registered`,
    )
  }

  // Validate provided plugin options
  const { error, value } = optionsSchema.required().validate(options, {
    abortEarly: false,
  })

  if (error) {
    return Result.err(
      `[${PLUGIN_NAME}] is misconfigured:\n${error.details
        .map(({ message }) => `- ${message}`)
        .join('\n')}`,
    )
  }

  // Make sure that every defined locale is unique
  const { defaultLocale, availableLocales } = value as Options

  const isDefaultLocaleIncluded = availableLocales.find(
    ({ id, displayValue }) =>
      id.toLowerCase() === defaultLocale.id.toLowerCase() &&
      displayValue.toLowerCase() === defaultLocale.displayValue.toLowerCase(),
  )

  const locales = isDefaultLocaleIncluded
    ? availableLocales
    : [...availableLocales, defaultLocale]

  interface ReduceAcc {
    ids: string[]
    values: string[]
    error?: string
  }

  const result = locales.reduce<ReduceAcc>(
    (acc, locale) => {
      if (acc.error) {
        return acc
      }

      const newAcc: ReduceAcc = { ids: [...acc.ids], values: [...acc.values] }
      const isIdDuplicated = acc.ids.find(
        (id) => id.toLowerCase() === locale.id.toLowerCase(),
      )
      const isValueDuplicated = acc.values.find(
        (value) => value.toLowerCase() === locale.displayValue.toLowerCase(),
      )

      if (isIdDuplicated || isValueDuplicated) {
        const msgParts = [
          `[${PLUGIN_NAME}] is misconfigured, conflicting locales are found:`,
        ]

        if (isIdDuplicated) {
          msgParts.push(
            `- id "${locale.id}" is found in more than one locale definition`,
          )
        }

        if (isValueDuplicated) {
          msgParts.push(
            `- displayValue "${locale.displayValue}" is found in more than ` +
              `one locale definition`,
          )
        }

        msgParts.push(`NOTE: the comparison is case insensitive`)

        newAcc.error = msgParts.join('\n')
        return newAcc
      }

      newAcc.ids.push(locale.id)
      newAcc.values.push(locale.displayValue)
      return newAcc
    },
    { ids: [], values: [] },
  )

  if (result.error) {
    return Result.err(result.error)
  }

  return Result.ok()
}
