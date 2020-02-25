import Joi from '@hapi/joi'

const { string, object } = Joi.types()

/**
 * Validation schema for translations collection
 */
export const translationsSchema = object
  .pattern(string, string)
  .options({ convert: false })
