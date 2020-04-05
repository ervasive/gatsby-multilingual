import Joi from '@hapi/joi'

const { string, object } = Joi.types()

/**
 * Validation schema for locale type
 */
export const localeSchema = object.keys({
  id: string.required(),
  displayValue: string.required(),
})
