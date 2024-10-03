export interface Label {
  name: string;
  description: string;
  color: string;
  exactMatch: boolean;
}

export interface LabelsConfig {
  labels: Label[];
}

export default LabelsConfig;
