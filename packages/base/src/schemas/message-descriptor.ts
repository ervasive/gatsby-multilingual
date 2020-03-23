import Joi from '@hapi/joi'
import { locationSchema } from '.'

const { string, object } = Joi.types()

/**
 * Validation schema for message descriptor
 */
export const messageDescriptorSchema = object
  .keys({
    id: string.required(),
    defaultMessage: string.required(),
    description: string,
    file: string.required(),
    start: locationSchema,
    end: locationSchema,
  })
  .options({ allowUnknown: true, abortEarly: false })
