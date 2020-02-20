import Joi from '@hapi/joi'

const { string, object, array } = Joi.types()

/**
 * Validation shcema for content transformer of a translations file
 */
export const transformerSchema = object.keys({
  extensions: array.items(string.required()).required(),
  handler: Joi.function().required(),
})
