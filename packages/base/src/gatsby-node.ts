import { GatsbyNode, CreateSchemaCustomizationArgs } from 'gatsby'
import { TRANSLATION_NODE_TYPENAME } from './constants'

export const createSchemaCustomization: GatsbyNode['createSchemaCustomization'] = async ({
  actions,
}: CreateSchemaCustomizationArgs): Promise<void> => {
  actions.createTypes(`
    type ${TRANSLATION_NODE_TYPENAME} implements Node @dontInfer {
      messageId: String!
      language: String!
      value: String!
      priority: Int!
    }
  `)
}
