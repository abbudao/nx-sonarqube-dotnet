export interface ScanExecutorSchema {
  hostUrl: string;
  projectKey: string;
  branches?: boolean;
  exclusions?: string;
  projectName?: string;
  projectVersion?: string;
  qualityGate?: boolean;
  qualityGateTimeout?: string;
  skipImplicitDeps?: boolean;
  testInclusions?: string;
  verbose?: boolean;
  extra?: { [option: string]: string };
}
