import { Node, NodeInput, PluginOptions } from 'gatsby'

/**
 * A bit strictier version of ExtractedMessageDescriptor (from babel-plugin-intl) type
 */
export interface Message {
  id: string
  defaultMessage: string
  file: string
  description?: string
}

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
 * Translations collection
 */
export interface Translations {
  [id: string]: string
}

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

/**
 * Plugin options
 */
export interface Options extends PluginOptions {
  defaultLanguage: string
  availableLanguages: string[]
  includeDefaultLanguageInURL: boolean
}
