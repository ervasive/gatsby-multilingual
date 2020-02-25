import { GatsbyNode, CreateSchemaCustomizationArgs } from 'gatsby'
import { messageTypedef, translationTypedef } from './graphql-types'
import { validatePluginInstance } from './utils'
import { GatsbyStorePlugin } from './types'

/**
 * Add additional types Gatsby’s GraphQL schema
 */
export const createSchemaCustomization: GatsbyNode['createSchemaCustomization'] = async ({
  actions,
}: CreateSchemaCustomizationArgs) => {
  actions.createTypes(translationTypedef)
  actions.createTypes(messageTypedef)
}

/**
 * Validate plugin instance and its options
 */
export const onPreBootstrap: GatsbyNode['onPreBootstrap'] = (
  { store, reporter },
  pluginOptions,
) => {
  validatePluginInstance(
    store.getState().flattenedPlugins as GatsbyStorePlugin[],
    pluginOptions,
  ).mapErr(reporter.panic)
}
