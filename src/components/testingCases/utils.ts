import {v5 as uuidv5} from 'uuid'
import {CaseNode} from './node.type'

interface Dependency {
    name: string;
    version: string;
}

const prepString = (s: string) => {
  return s.replace(/[^0-9a-zA-Z]/g, '').toLowerCase()
}

// We want the run ID to be unique as we want to record all runs
export const getCaseId = (testCase: CaseNode) => {
  const idStr = prepString(testCase.id) + prepString(testCase.createdAt)
  const UUID_NAMESPACE = 'c72d8f12-1818-4cb9-bead-44634c441c11'
  return uuidv5(idStr, UUID_NAMESPACE)
}


// This generate an unique id based on the combination the component and its dependencies
// The ID is simply a UUID genreated from the concatenation of all elements
// Note that the dependencies are sorted and all string are cleaned (lower case and stripped from non alphanumerical characters)
export const getId = (dependency: Dependency) => {
  const idStr = prepString(dependency.name) + prepString(dependency.version)
  const UUID_NAMESPACE = 'c72d8f12-1818-4cb9-bead-44634c441c11'
  return uuidv5(idStr, UUID_NAMESPACE)
}