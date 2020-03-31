import { promises as fs } from 'fs'
import { Result } from 'true-myth'
import { NodePluginArgs } from 'gatsby'
import { messageDescriptorSchema } from '../schemas'
import { Message, MessageNodeInput } from '../types'
import { PLUGIN_NAME, PREFIX, MESSAGE_NODE_TYPENAME } from '../constants'

/**
 * Get and validate message descriptors from a file, convert extracted
 * descriptors into gatsby message nodes
 *
 * @param filepath - Path to a file to process
 * @param helpers - Miscellaneous helpers provided by gatsby
 * @returns A promise which resolves to Result with "MessageNodeInput[]" on
 *          success or "string" on failure
 */
export const processMesagesFile = async (
  filepath: string,
  {
    createNodeId,
    createContentDigest,
  }: {
    createNodeId: NodePluginArgs['createNodeId']
    createContentDigest: NodePluginArgs['createContentDigest']
  },
): Promise<Result<MessageNodeInput[], string>> => {
  try {
    const contents = await fs.readFile(filepath, 'utf8')

    // Skip processing if the file is empty
    if (!contents) {
      return Result.ok([])
    }

    const data = JSON.parse(contents)

    if (!Array.isArray(data)) {
      return Result.err(
        `[${PLUGIN_NAME}] Invalid messages file "${filepath}": must contain ` +
          `an array of message descriptors`,
      )
    }

    const items = data as unknown[]
    const nodes: MessageNodeInput[] = []
    let containsInvalidDesciptors = false

    items.forEach(item => {
      const { error, value } = messageDescriptorSchema.required().validate(item)

      if (error || containsInvalidDesciptors) {
        containsInvalidDesciptors = true
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

      nodes.push(node)
    })

    if (containsInvalidDesciptors) {
      return Result.err(
        `[${PLUGIN_NAME}] Messages file "${filepath}" contains invalid ` +
          `message descriptors`,
      )
    }

    return Result.ok(nodes)
  } catch (err) {
    return Result.err(
      `[${PLUGIN_NAME}] Invalid messages file "${filepath}": ${err.message}`,
    )
  }
}
