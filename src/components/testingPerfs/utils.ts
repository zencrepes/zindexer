import {v5 as uuidv5} from 'uuid'

import { PerfNode } from './node.type'

const prepString = (s: string) => {
  return s.replace(/[^0-9a-zA-Z]/g, '').toLowerCase()
}

// This generate an unique id based on the combination the component and its dependencies
// The ID is simply a UUID genreated from the concatenation of all elements
// Note that the dependencies are sorted and all string are cleaned (lower case and stripped from non alphanumerical characters)
export const getId = (perfNode: PerfNode) => {
  const startedAt = perfNode.startedAt !== undefined ? prepString(perfNode.startedAt) : ''
  const region = perfNode.platform !== undefined ? prepString(perfNode.platform.region) : ''
  
  const idStr = prepString(perfNode.name) + prepString(startedAt) + prepString(region)
  const UUID_NAMESPACE = 'c72d8f12-1818-4cb9-bead-44634c441c11'
  return uuidv5(idStr, UUID_NAMESPACE)
}