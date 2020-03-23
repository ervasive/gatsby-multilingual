import { promises as fs } from 'fs'
import { Actions, Reporter, NodePluginArgs } from 'gatsby'
import { messageDescriptorSchema } from '../schemas'
import { syncMessageNodes } from '.'
import { PREFIX, PLUGIN_NAME, MESSAGE_NODE_TYPENAME } from '../constants'
import { Message, MessageNodeInput, ManagedMessagesStore } from '../types'

/**
 * Get message nodes from a file of extracted message descriptors
 *
 * @param filepath - Path to a file to process
 * @param store - Map of a filename to an array of existing node ids
 * @param helpers - Miscellaneous helpers provided by gatsby
 */
export const processMesagesFile = async (
  filepath: string,
  store: ManagedMessagesStore,
  {
    actions,
    reporter,
    getNode,
    createNodeId,
    createContentDigest,
  }: {
    actions: Actions
    reporter: Reporter
    getNode: NodePluginArgs['getNode']
    createNodeId: NodePluginArgs['createNodeId']
    createContentDigest: NodePluginArgs['createContentDigest']
  },
): Promise<void | never> => {
  try {
    const contents = await fs.readFile(filepath, 'utf8')

    // Remove all nodes associated with this filepath if the file is empty
    if (!contents) {
      syncMessageNodes(filepath, store, [], { actions, getNode })
      return
    }

    const data = JSON.parse(contents)

    if (!Array.isArray(data)) {
      reporter.panicOnBuild(
        `[${PLUGIN_NAME}] Invalid messages file "${filepath}": Must be an ` +
          `array of message descriptors`,
      )

      syncMessageNodes(filepath, store, [], { actions, getNode })
      return
    }

    const messages = data as unknown[]
    const fileNodes: MessageNodeInput[] = []

    messages.forEach(item => {
      const { error, value } = messageDescriptorSchema.required().validate(item)

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
        description: message.description,
        file: message.file,
        start: message.start,
        end: message.end,
      }

      fileNodes.push(node)
    })

    syncMessageNodes(filepath, store, fileNodes, { actions, getNode })
  } catch (err) {
    reporter.panicOnBuild(
      `[${PLUGIN_NAME}] there was an error processing messages file ` +
        `"${filepath}": ${err}`,
    )

    syncMessageNodes(filepath, store, [], { actions, getNode })
  }
}
