import Joi from '@hapi/joi'

const { number, object } = Joi.types()

/**
 * Validation schema for location object
 */
export const locationSchema = object.keys({
  line: number.required(),
  column: number.required(),
})
