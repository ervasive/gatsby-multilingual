import { PluginOptions } from 'gatsby'
import { Translations } from '@gatsby-plugin-multilingual/base'

/**
 * Filetype tranformer
 */
export interface Transformer {
  extensions: string[]
  handler: (content: string) => Translations | Promise<Translations> | never // can potentially throw
}

/**
 * Plugin instance options
 */
export interface Options extends PluginOptions {
  path: string
  priority: number
  transformers: Transformer[]
}
