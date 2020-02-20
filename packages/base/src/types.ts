import { Node, NodeInput, PluginOptions } from 'gatsby'
import { ExtractedMessageDescriptor } from 'babel-plugin-react-intl'

/**
 * ExtractedMessageDescriptor alias
 */
export type Message = ExtractedMessageDescriptor

/**
 * Message input node provided to "createNode" gatsby action
 */
export interface MessageNodeInput extends NodeInput {
  messageId: string
  value: string
  description?: string
  file: string
}

/**
 * Message node stored in gatsby store
 */
export type MessageNode = Node & MessageNodeInput

/**
 * Translation input node provided to "createNode" gatsby action
 */
export interface TranslationNodeInput extends NodeInput {
  messageId: string
  value: string
  language: string
  priority: number
}

/**
 * Translation node stored in gatsby store
 */
export type TranslationNode = Node & TranslationNodeInput

/**
 * Plugin from the gatsby store
 */
export interface GatsbyStorePlugin {
  resolve: string
  id: string
  name: string
  version: string
  pluginOptions: PluginOptions
  nodeAPIs: string[]
  browserAPIs: string[]
  ssrAPIs: string[]
  pluginFilepath: string
}
