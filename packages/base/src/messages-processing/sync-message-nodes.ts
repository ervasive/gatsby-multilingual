import { Actions, NodePluginArgs } from 'gatsby'
import { MessageNodeInput, ManagedMessagesStore } from '../types'

/**
 * Sync message nodes with gatsby
 *
 * @param key - Store key id (filepath)
 * @param store - Map of a filename to an array of existing node ids
 * @param nodes - Array of message nodes to create and keep from deletion
 * @param helpers - Miscellaneous helpers provided by gatsby
 */
export const syncMessageNodes = (
  key: string,
  store: ManagedMessagesStore,
  nodes: MessageNodeInput[],
  {
    actions,
    getNode,
  }: { actions: Actions; getNode: NodePluginArgs['getNode'] },
): void => {
  const existingIds = store.get(key) || []
  const newIds: string[] = []

  nodes.forEach(node => {
    actions.createNode(node)
    newIds.push(node.id)
  })

  existingIds.forEach(id => {
    const node = getNode(id)

    if (node && !newIds.includes(id)) {
      actions.deleteNode({ node })
    }
  })

  store.set(key, newIds)
}
