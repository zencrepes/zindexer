export interface Dependency {
  id: string;
  name: string;
  version: string;
  url?: string;
}

export interface StateNode {
  id: string;
  name: string;
  version: string;
  dependency: Dependency[]
  createdAt: string;
  state: string;
  url: string;
  runTotal: number
  runSuccess: number
  runFailure: number
  runDuration: number
}
