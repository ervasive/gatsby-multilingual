import path from 'path'
import { Options } from './types'

export const PLUGIN_NAME = '@gatsby-plugin-multilingual/base'
export const PREFIX = '__gpml'
export const MESSAGE_NODE_TYPENAME = 'GPMLMessage'
export const TRANSLATION_NODE_TYPENAME = 'GPMLTranslation'
export const DEBOUNCE_INTERVAL = 500

export const CACHE_DIR = path.resolve('.cache', PREFIX)
export const PUBLIC_DIR = path.resolve('public', PREFIX)

export const EXTRACTED_MESSAGES_DIR = path.join(CACHE_DIR, 'messages')

export const TRANSLATIONS_FILE = path.join(CACHE_DIR, 'translations.json')

export const DEFAULT_OPTIONS: Options = {
  defaultLanguage: 'en',
  availableLanguages: ['en'],
  includeDefaultLanguageInURL: false,
  plugins: [],
}
