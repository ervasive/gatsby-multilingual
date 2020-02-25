import { Result, Unit } from 'true-myth'
import { PluginOptions } from 'gatsby'
import { optionsSchema } from '../schemas'
import { PLUGIN_NAME } from '../constants'
import { GatsbyStorePlugin } from '../types'

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
  const { error } = optionsSchema.required().validate(options, {
    abortEarly: false,
  })

  if (error) {
    return Result.err(
      `[${PLUGIN_NAME}] is misconfigured:\n${error.details
        .map(({ message }) => `- ${message}`)
        .join('\n')}`,
    )
  }

  return Result.ok()
}
