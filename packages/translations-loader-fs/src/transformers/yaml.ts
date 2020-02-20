import { safeLoad } from 'js-yaml'
import { Transformer } from '../types'

export const transformYAML: Transformer = {
  extensions: ['yaml', 'yml'],
  handler: content => safeLoad(content),
}
