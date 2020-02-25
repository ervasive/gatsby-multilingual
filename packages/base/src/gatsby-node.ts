import { GatsbyNode, CreateSchemaCustomizationArgs } from 'gatsby'
import { TRANSLATION_NODE_TYPENAME } from './constants'
import { messageTypedef, translationTypedef } from './graphql-types'

/**
 * Add additional types Gatsby’s GraphQL schema
 */
export const createSchemaCustomization: GatsbyNode['createSchemaCustomization'] = async ({
  actions,
}: CreateSchemaCustomizationArgs) => {
  actions.createTypes(translationTypedef)
  actions.createTypes(messageTypedef)
}
