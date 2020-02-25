import { promises as fs } from 'fs'
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
  PLUGIN_NAME,
  EXTRACTED_MESSAGES_DIR,
  MESSAGE_NODE_TYPENAME,
  TRANSLATION_NODE_TYPENAME,
} from './constants'
import { GatsbyStorePlugin, Message, MessageNodeInput } from './types'

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
      // TODO: find a way to invalidate babel-loader cache on non-existent
      // messages dir
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

/**
 * Add message nodes extracted from the source code by "babel-plugin-intl"
 */
export const sourceNodes: GatsbyNode['sourceNodes'] = async ({
  actions,
  reporter,
  createNodeId,
  createContentDigest,
  getNode,
}: SourceNodesArgs) => {
  const managedNodes: Map<string, string[]> = new Map()

  /**
   * Remove previously created message nodes from gatsby
   * @param filepath - Filepath to file to process
   */
  const removeNodes = (filepath: string): void => {
    const fileNodesIds = managedNodes.get(filepath)

    if (fileNodesIds) {
      fileNodesIds.forEach(id => {
        const node = getNode(id)

        if (node) {
          actions.deleteNode({ node })
        }
      })

      managedNodes.delete(filepath)
    }
  }

  /**
   * Extract message descriptors from a file and create a node for each message
   * @param filepath - Filepath to file to process
   */
  const addNodes = async (filepath: string): Promise<void> => {
    const fileNodesIds: string[] = []

    try {
      const contents = await fs.readFile(filepath, 'utf8')

      // Ignore empty file
      if (!contents) {
        return
      }

      const data = JSON.parse(contents)

      if (Array.isArray(data)) {
        data.forEach(item => {
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
          const nodeId = createNodeId(`${filepath}-${message.id}`)
          const node: MessageNodeInput = {
            id: nodeId,
            internal: {
              type: MESSAGE_NODE_TYPENAME,
              contentDigest: createContentDigest(message.defaultMessage),
            },
            messageId: message.id,
            value: message.defaultMessage,
            file: message.file,
            description: message.description,
          }

          actions.createNode(node)
          fileNodesIds.push(nodeId)
        })

        // Update registered nodes for the filepath
        managedNodes.set(filepath, fileNodesIds)
      } else {
        reporter.panicOnBuild(
          `[${PLUGIN_NAME}] Invalid messages file "${filepath}": Must be ` +
            `array of message descriptiors`,
        )
      }
    } catch (err) {
      reporter.panicOnBuild(
        `[${PLUGIN_NAME}] something went wrong while processing message ` +
          `file "${filepath}"\n${err}`,
      )
    }
  }

  // TODO: should we handle "ready" state?
  watch(EXTRACTED_MESSAGES_DIR)
    .on('add', addNodes)
    .on('change', filepath => {
      removeNodes(filepath)
      addNodes(filepath)
    })
    .on('unlink', removeNodes)
}

/**
 * Validate message and translation nodes added to the store
 */
export const onCreateNode: GatsbyNode['onCreateNode'] = async ({
  node,
  reporter,
}) => {
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
