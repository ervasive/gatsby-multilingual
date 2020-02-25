export const PLUGIN_NAME = '@gatsby-plugin-multilingual/base'
export const PREFIX = '__gpml'
export const MESSAGE_NODE_TYPENAME = 'GPMLMessage'
export const TRANSLATION_NODE_TYPENAME = 'GPMLTranslation'

/**
 * Unique name for message nodes
 */
export const MESSAGE_NODE_TYPENAME = 'GPMLMessage'

export const DEFAULT_OPTIONS: Options = {
  defaultLanguage: 'en',
  availableLanguages: ['en'],
  includeDefaultLanguageInURL: false,
  plugins: [],
}
