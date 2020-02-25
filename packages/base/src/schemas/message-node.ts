import Joi from '@hapi/joi'
import { MESSAGE_NODE_TYPENAME } from '../constants'

const { string, object } = Joi.types()

/**
 * Validation schema for message node
 */
export const messageNodeSchema = object
  .keys({
    messageId: string.required(),
    value: string.required(),
    file: string.required(),
    description: string,
    internal: object
      .keys({
        type: string.valid(MESSAGE_NODE_TYPENAME),
      })
      .options({ allowUnknown: true }),
  })
  .options({ allowUnknown: true, abortEarly: false })
