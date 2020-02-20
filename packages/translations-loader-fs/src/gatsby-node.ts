import path from 'path'
import { promises as fs } from 'fs'
import { watch } from 'chokidar'
import { GatsbyNode, PluginOptions, SourceNodesArgs } from 'gatsby'
import {
  GatsbyStorePlugin,
  TRANSLATION_NODE_TYPENAME,
  TranslationNodeInput,
  translationTypedef,
} from '@gatsby-plugin-multilingual/base'
import { translationsSchema } from './schemas'
import { validatePluginInstance, getOptions } from './utils'
import { PLUGIN_NAME } from './constants'
import { Translations } from './types'

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
}

/**
 * Manage translation nodes for specified directory
 */
export const sourceNodes: GatsbyNode['sourceNodes'] = async (
  {
    actions,
    reporter,
    createNodeId,
    createContentDigest,
    getNode,
  }: SourceNodesArgs,
  pluginOptions: PluginOptions,
) => {
  const options = getOptions(pluginOptions)
  const pathResolved = path.resolve(options.path)
  const managedNodes: Map<string, string[]> = new Map()

  actions.createTypes(translationTypedef)

  /**
   * Remove previously created translation nodes from gatsby
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
   * Extract translation entries from a file and create a node for each entry
   * @param filepath - Filepath to file to process
   */
  const addNodes = async (filepath: string): Promise<void> => {
    const ext = path.extname(filepath).replace(/^\.+/, '')
    const language = path.parse(filepath).name
    const fileNodesIds: string[] = []

    options.transformers.forEach(async ({ extensions, handler }) => {
      if (!extensions.includes(ext)) {
        return
      }

      try {
        const contents = await fs.readFile(filepath, 'utf8')

        // Ignore empty file
        if (!contents) {
          return
        }

        const data = await handler(contents)

        // Validate converted data
        const { error, value } = translationsSchema.required().validate(data)

        if (error) {
          reporter.panicOnBuild(
            `[${PLUGIN_NAME}] Invalid translations format: ${filepath}`,
          )
        }

        const translations = value as Translations

        // Create a node for each translation
        Object.entries(translations).forEach(([id, value]) => {
          const nodeId = createNodeId(`${filepath}-${id}`)
          const node: TranslationNodeInput = {
            id: nodeId,
            internal: {
              type: TRANSLATION_NODE_TYPENAME,
              contentDigest: createContentDigest(value),
            },
            messageId: id,
            value,
            language,
            priority: options.priority,
          }

          actions.createNode(node)
          fileNodesIds.push(nodeId)
        })

        // Update registered nodes for the filepath
        managedNodes.set(filepath, fileNodesIds)
      } catch (err) {
        reporter.panicOnBuild(
          `[${PLUGIN_NAME}] Invalid translation file (${filepath}): ${err}`,
        )
      }
    })
  }

  // TODO: should we handle "ready" state?
  watch(pathResolved)
    .on('add', addNodes)
    .on('change', filepath => {
      removeNodes(filepath)
      addNodes(filepath)
    })
    .on('unlink', removeNodes)
}
