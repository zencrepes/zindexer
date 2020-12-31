export interface Dependency {
  id: string;
  name: string;
  version: string;
  full: string;
  url?: string;
}

export interface RunNode {
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
  runSuccessRate: number
  runFailure: number
  runFailureRate: number
  runDuration: number
}
