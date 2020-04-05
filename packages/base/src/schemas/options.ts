import Joi from '@hapi/joi'
import { localeSchema } from '.'

const { boolean, array, object } = Joi.types()

/**
 * Validation schema for the plugin's options
 */
export const optionsSchema = object.keys({
  defaultLocale: localeSchema,
  availableLocales: array.items(localeSchema),
  includeDefaultLanguageInURL: boolean,
  plugins: array,
})
