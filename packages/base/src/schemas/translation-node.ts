import Joi from '@hapi/joi'
import { TRANSLATION_NODE_TYPENAME } from '../constants'

const { number, string, object } = Joi.types()

/**
 * Validation schema for translation node
 */
export const translationNodeSchema = object
  .keys({
    messageId: string.required(),
    value: string.required(),
    locale: string.required(),
    priority: number.required(),
    internal: object
      .keys({
        type: string.valid(TRANSLATION_NODE_TYPENAME),
      })
      .options({ allowUnknown: true }),
  })
  .options({ allowUnknown: true, abortEarly: false })
