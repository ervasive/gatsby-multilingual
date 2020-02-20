import { Transformer } from '../types'

export const transformJSON: Transformer = {
  extensions: ['json'],
  handler: content => JSON.parse(content),
}
