export interface Dependency {
  id: string;
  name: string;
  version: string;
  full: string;
  url?: string;
}

export interface StateNode {
  id: string;
  name: string;
  version: string;
  full: string;
  dependencies: Dependency[]
  createdAt: string;
  state: string;
  url: string;
  runTotal: number
  runSuccess: number
  runFailure: number
  runDuration: number
}
