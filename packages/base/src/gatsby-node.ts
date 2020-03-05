import { emptyDir, ensureDir } from 'fs-extra'
import {
  GatsbyNode,
  CreateSchemaCustomizationArgs,
  SourceNodesArgs,
} from 'gatsby'
import { watch } from 'chokidar'
import { messageTypedef, translationTypedef } from './graphql-types'
import { validatePluginInstance } from './utils'
import { translationNodeSchema, messageNodeSchema } from './schemas'
import { syncMessageNodes, processMesagesFile } from './messages-processing'
import {
  PLUGIN_NAME,
  CACHE_DIR,
  EXTRACTED_MESSAGES_DIR,
  MESSAGE_NODE_TYPENAME,
  TRANSLATION_NODE_TYPENAME,
} from './constants'
import { GatsbyStorePlugin, ManagedMessagesStore } from './types'

/**
 * Add additional types to Gatsby’s GraphQL schema
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
  // We have to disable babel-loader caching so babel-plugin-intl could run
  // messages extraction reliably in case EXTRACTED_MESSAGES_DIR gets deleted by
  // "gatsby clean" for example.
  // TODO: investigate the cons of this approach or find a better one
  actions.setBabelOptions({
    options: {
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
export const onPreBootstrap: GatsbyNode['onPreBootstrap'] = async (
  { store, reporter },
  pluginOptions,
) => {
  validatePluginInstance(
    store.getState().flattenedPlugins as GatsbyStorePlugin[],
    pluginOptions,
  ).mapErr(reporter.panic)

  // Make sure we have a clean state for each run
  await emptyDir(CACHE_DIR)
}

/**
 * Manage gatsby nodes for messages extracted from the source code by
 * "babel-plugin-intl"
 */
export const sourceNodes: GatsbyNode['sourceNodes'] = async ({
  actions,
  reporter,
  getNode,
  createNodeId,
  createContentDigest,
}: SourceNodesArgs) => {
  // We want to keep track which messages were extracted from which file to
  // be able to sync gatsby store on files updates
  const managedNodes: ManagedMessagesStore = new Map()

  await ensureDir(EXTRACTED_MESSAGES_DIR)

  // TODO: should we handle "ready" state?
  watch(EXTRACTED_MESSAGES_DIR)
    .on('add', filename => {
      processMesagesFile(filename, managedNodes, {
        actions,
        reporter,
        getNode,
        createNodeId,
        createContentDigest,
      })
    })
    .on('change', filename => {
      processMesagesFile(filename, managedNodes, {
        actions,
        reporter,
        getNode,
        createNodeId,
        createContentDigest,
      })
    })
    .on('unlink', filename => {
      syncMessageNodes(filename, managedNodes, [], { actions, getNode })
    })
}

/**
 * Validate message and translation nodes added to the store
 */
export const onCreateNode: GatsbyNode['onCreateNode'] = async ({
  node,
  reporter,
}) => {
  console.log('node created', node)
  if (node.internal.type === MESSAGE_NODE_TYPENAME) {
    const { error } = messageNodeSchema.required().validate(node)

    if (error) {
      reporter.panicOnBuild(
        [
          `[${PLUGIN_NAME}] Invalid message node found:`,
          JSON.stringify(node, null, 2),
          `Validation errors:`,
          error.details.map(({ message }) => `- ${message}`).join('\n'),
        ].join('\n'),
      )
    }
  }

  if (node.internal.type === TRANSLATION_NODE_TYPENAME) {
    const { error } = translationNodeSchema.required().validate(node)

    if (error) {
      reporter.panicOnBuild(
        [
          `[${PLUGIN_NAME}] Invalid translation node found:`,
          JSON.stringify(node, null, 2),
          `Validation errors:`,
          error.details.map(({ message }) => `- ${message}`).join('\n'),
        ].join('\n'),
      )
    }
  }
}
