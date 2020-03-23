import { LOCATION_TYPENAME, MESSAGE_NODE_TYPENAME } from '../constants'

export const messageTypedef = `
  type ${MESSAGE_NODE_TYPENAME} implements Node {
    messageId: String!
    value: String!
    description: String
    file: String!
    start: ${LOCATION_TYPENAME}
    end: ${LOCATION_TYPENAME}
  }
`
