import Joi from '@hapi/joi'
import { MESSAGE_NODE_TYPENAME } from '../constants'
import { locationSchema } from '.'

const { string, object } = Joi.types()

/**
 * Validation schema for message node
 */
export const messageNodeSchema = object
  .keys({
    messageId: string.required(),
    value: string.required(),
    description: string,
    file: string,
    start: locationSchema,
    end: locationSchema,
    internal: object
      .keys({
        type: string.valid(MESSAGE_NODE_TYPENAME),
      })
      .options({ allowUnknown: true }),
  })
  .options({ allowUnknown: true, abortEarly: false })
