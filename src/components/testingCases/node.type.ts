
export interface Dependency {
  id: string;
  name: string;
  version: string;
  full: string;
  url?: string;
}

export interface CaseNode {
  id: string;
  name: string;
  suite: string;
  project: string;
  version: string;
  full: string;
  dependencies: Dependency[]
  createdAt: string;
  state: string;
  duration: number;
  url: string;
}
