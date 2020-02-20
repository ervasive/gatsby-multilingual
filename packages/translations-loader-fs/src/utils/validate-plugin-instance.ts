import path from 'path'
import { Result, Unit } from 'true-myth'
import { PluginOptions } from 'gatsby'
import { GatsbyStorePlugin } from '@gatsby-plugin-multilingual/base'
import { optionsSchema } from '../schemas'
import { PLUGIN_NAME } from '../constants'
import { Options } from '../types'

/**
 * Validate plugin requirements.
 *
 * Make sure that plugin options are valid, and no more than one plugin instance
 * watches any registered translation files directory.
 *
 * @param plugins - Array of gatsby store plugins
 * @param options - Provided (potentially invalid) plugin options
 * @returns OK or Error result based on passed or failed plugin requirements
 */
export const validatePluginInstance = (
  plugins: GatsbyStorePlugin[],
  options?: PluginOptions,
): Result<Unit, string> => {
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

  const validOptions = value as Options
  const absolutePath = path.resolve(validOptions.path)

  // Validate that no other plugin instance "watches" provided directory path
  const pluginInstances = plugins.filter(
    ({ name, pluginOptions }) =>
      name === PLUGIN_NAME &&
      path.resolve(pluginOptions.path as string) === absolutePath,
  )

  if (pluginInstances.length > 1) {
    return Result.err(
      `[${PLUGIN_NAME}] more than one plugin instance uses the same ` +
        `translations directory path: "${absolutePath}"`,
    )
  }

  return Result.ok()
}
