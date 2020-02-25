import path from 'path'
export const PLUGIN_NAME = '@gatsby-plugin-multilingual/base'
export const PREFIX = '__gpml'
export const MESSAGE_NODE_TYPENAME = 'GPMLMessage'
export const TRANSLATION_NODE_TYPENAME = 'GPMLTranslation'

export const CACHE_DIR = path.resolve('.cache', PREFIX)
export const EXTRACTED_MESSAGES_DIR = path.join(CACHE_DIR, 'messages')

export const DEFAULT_OPTIONS: Options = {
  defaultLanguage: 'en',
  availableLanguages: ['en'],
  includeDefaultLanguageInURL: false,
  plugins: [],
}
