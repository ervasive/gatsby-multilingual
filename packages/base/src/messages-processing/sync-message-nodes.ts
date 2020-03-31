import path from 'path'
import { Actions, NodePluginArgs } from 'gatsby'
import { MESSAGE_NODE_TYPENAME, EXTRACTED_MESSAGES_DIR } from '../constants'
import { MessageNodeInput, MessageNode } from '../types'

/**
 * Updates message nodes in gatsby store
 *
 * @param filepath - Filepath
 * @param nodes - Array of message nodes to create and/or keep from deletion
 * @param helpers - Miscellaneous helpers provided by gatsby
 */
export const syncMessageNodes = (
  filepath: string,
  nodes: MessageNodeInput[],
  {
    actions,
    getNodesByType,
  }: { actions: Actions; getNodesByType: NodePluginArgs['getNodesByType'] },
): void => {
  const messagesNodes: MessageNode[] = getNodesByType(MESSAGE_NODE_TYPENAME)
  const idsOfNodesToKeep: string[] = []

  nodes.forEach(node => {
    actions.createNode(node)
    idsOfNodesToKeep.push(node.id)
  })

  messagesNodes
    .filter(({ id, file }) => {
      const messageFilepath = file
        ? path.join(EXTRACTED_MESSAGES_DIR, file.replace('.js', '.json'))
        : ''

      return filepath === messageFilepath && !idsOfNodesToKeep.includes(id)
    })
    .map(node => actions.deleteNode({ node }))
}
