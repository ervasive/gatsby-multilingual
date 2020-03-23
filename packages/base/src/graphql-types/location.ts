import { LOCATION_TYPENAME } from '../constants'

export const locationTypedef = `
  type ${LOCATION_TYPENAME} {
    line: Int
    column: Int
  }
`
