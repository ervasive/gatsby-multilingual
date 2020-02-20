import { transformJSON, transformYAML } from './transformers'
import { Options } from './types'

export const PLUGIN_NAME = '@gatsby-plugin-multilingual/translations-loader-fs'

export const DEFAULT_OPTIONS: Options = {
  path: '', // this value is specified only to satisfy the type
  priority: 0,
  transformers: [transformJSON, transformYAML],
  plugins: [],
}
