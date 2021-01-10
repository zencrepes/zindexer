export interface Project {
  id: string;
  name: string;
}

export interface Plan {
  id: string;
  shortKey: string;
  name: string;
  project: Project;
  enabled: boolean;
}

export interface RunNode {
  id: string;
  plan: Plan;
  name: string;
  number: number;
  startedAt: string;
  completedAt: string;
  duration: number;
  runTotal: number;
  runSuccess: number;
  runFailure: number;
  runSkipped: number;
  runQuarantined: number;
  successful: boolean;
  withTests: boolean;
  state: string;
}
