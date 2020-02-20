import Joi from '@hapi/joi'
import { transformerSchema } from '.'

const { number, string, array, object } = Joi.types()

/**
 * Validation schema for the plugin's options
 */
export const optionsSchema = object.keys({
  path: string.required(),
  priority: number.integer(),
  transformers: array.items(transformerSchema),
  plugins: array,
})
