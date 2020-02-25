import Joi from '@hapi/joi'

const { string, object } = Joi.types()

/**
 * Validation schema for message descriptor
 */
export const messageDescriptorSchema = object
  .keys({
    id: string.required(),
    defaultMessage: string.required(),
    file: string.required(),
    description: string,
  })
  .options({ allowUnknown: true, abortEarly: false })
