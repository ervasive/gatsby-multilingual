import { GatsbyNode, CreateSchemaCustomizationArgs } from 'gatsby'
import { messageTypedef, translationTypedef } from './graphql-types'
import { validatePluginInstance } from './utils'
import { EXTRACTED_MESSAGES_DIR } from './constants'
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
 * Add "babel-plugin-intl" to babel configuration
 */
export const onCreateBabelConfig: GatsbyNode['onCreateBabelConfig'] = ({
  actions,
}) => {
  actions.setBabelOptions({
    options: {
      // TODO: find a way to invalidate babel-loader cache on deleted messages dir
      cacheDirectory: false,
    },
  })
  actions.setBabelPlugin({
    name: 'babel-plugin-react-intl',
    options: {
      messagesDir: EXTRACTED_MESSAGES_DIR,
      extractSourceLocation: true,
      extractFromFormatMessageCall: true,
    },
  })
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
