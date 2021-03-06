import { TRANSLATION_NODE_TYPENAME } from '../constants'

export const translationTypedef = `
  type ${TRANSLATION_NODE_TYPENAME} implements Node {
    messageId: String!
    value: String!
    language: String!
    priority: Int!
  }
`
