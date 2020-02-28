import { promises as fs } from 'fs'
import { emptyDir, ensureDir } from 'fs-extra'
import {
  GatsbyNode,
  CreateSchemaCustomizationArgs,
  SourceNodesArgs,
} from 'gatsby'
import { watch } from 'chokidar'
import { messageTypedef, translationTypedef } from './graphql-types'
import { validatePluginInstance } from './utils'
import {
  translationNodeSchema,
  messageNodeSchema,
  messageDescriptorSchema,
} from './schemas'
import {
  PREFIX,
  PLUGIN_NAME,
  CACHE_DIR,
  EXTRACTED_MESSAGES_DIR,
  MESSAGE_NODE_TYPENAME,
  TRANSLATION_NODE_TYPENAME,
} from './constants'
import { GatsbyStorePlugin, MessageNodeInput, Message } from './types'

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
  const managedNodes: Map<string, Set<string>> = new Map()

  /**
   * Delete managed nodes of by provided key (filepath), excluding optional
   * array of ids
   *
   * @param key - Filepath
   * @param idsToKeep - Array of ids to keep from deletion
   */
  const deleteNodes = (key: string, idsToKeep: string[] = []): void => {
    const allIds = new Set(managedNodes.get(key))

    allIds.forEach(id => {
      const node = getNode(id)

      if (node && idsToKeep.indexOf(id) === -1) {
        actions.deleteNode({ node })
      }
    })

    managedNodes.set(key, new Set(idsToKeep))
  }

  /**
   * Add message nodes from a file of extracted message descriptors
   *
   * @param filepath - Path to a file to process
   */
  const processFile = async (filepath: string): Promise<void> => {
    try {
      const contents = await fs.readFile(filepath, 'utf8')

      // Remove all nodes associated with this filepath if the file is empty
      if (!contents) {
        deleteNodes(filepath)
        return
      }

      const data = JSON.parse(contents)

      if (!Array.isArray(data)) {
        reporter.panicOnBuild(
          `[${PLUGIN_NAME}] Invalid messages file "${filepath}": Must be an ` +
            `array of message descriptors`,
        )

        deleteNodes(filepath)
        return
      }

      const messages = data as unknown[]
      const fileNodes: MessageNodeInput[] = []

      messages.forEach(item => {
        const { error, value } = messageDescriptorSchema
          .required()
          .validate(item)

        if (error) {
          reporter.panicOnBuild(
            [
              `[${PLUGIN_NAME}] Invalid message descriptor found in file "${filepath}":`,
              JSON.stringify(item, null, 2),
              `Validation errors:`,
              error.details.map(({ message }) => `- ${message}`).join('\n'),
            ].join('\n'),
          )

          return
        }

        const message = value as Message
        const nodeId = createNodeId(`${PREFIX}-${message.file}-${message.id}`)
        const node: MessageNodeInput = {
          id: nodeId,
          internal: {
            type: MESSAGE_NODE_TYPENAME,
            contentDigest: createContentDigest(
              message.defaultMessage + message.description + message.file,
            ),
          },
          messageId: message.id,
          value: message.defaultMessage,
          file: message.file,
          description: message.description,
        }

        actions.createNode(node)
        fileNodes.push(node)
      })

      deleteNodes(
        filepath,
        fileNodes.map(({ id }) => id),
      )
    } catch (err) {
      reporter.panicOnBuild(
        `[${PLUGIN_NAME}] there was an error processing messages file ` +
          `"${filepath}": ${err}`,
      )

      deleteNodes(filepath)
    }
  }

  await ensureDir(EXTRACTED_MESSAGES_DIR)

  // TODO: should we handle "ready" state?
  watch(EXTRACTED_MESSAGES_DIR)
    .on('add', processFile)
    .on('change', processFile)
    .on('unlink', deleteNodes)
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
