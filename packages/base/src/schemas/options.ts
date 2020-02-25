import Joi from '@hapi/joi'

const { boolean, string, array, object } = Joi.types()

/**
 * Validation schema for the plugin's options
 */
export const optionsSchema = object.keys({
  defaultLanguage: string,
  availableLanguages: array.items(string),
  includeDefaultLanguageInURL: boolean,
  plugins: array,
})
