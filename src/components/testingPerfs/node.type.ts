export interface RepositoryOwner {
  id?: string;    // Optional, if provided must match the resource ID (GitHub GraphQL API)
  login: string;  // Name of the organiation (apache)
  url: string;    // Url of the organization (https://github.com/apache)
}

export interface Repository {
  id?: string;              // Optional, if provided must match the resource ID (GitHub GraphQL API)
  name: string;             // Name of the repository (unomi-perf)
  url: string;              // https://github.com/apache/unomi-perf
  databaseId?: string;      // Optional, GitHub databaseID
  owner?: RepositoryOwner   // Organiaztion owning the repository
}

export interface Platform {
  vendor: string;       // AWS
  tenant: string;       // my-aws-tenant
  region: string;       // us-east-2
}

export interface Resource {
  id?: string;           // Unique ID of the resource
  name: string;         // Name/hostname of the resource (elasticsearch, mariaDB, unomi, ...)
  size: string;         // Size of the underlying host, could be instance type such as t2.large, or a string detailing the env (2 vCPU / 4GB RAM)
  image: string;        // Name of the container that was used
  tfsettings: string;   // JSON.stringify() of the tfsettings file
}

export interface Run {
  id?: string;           // Unique ID of the run
  name: string;         // User-friendly name for the run (200 users - 60s RampUp)
  rampUp: number;       // Ramp-up time for the run
  userCount: number;    // Number of users submitted during that rampup
  statistics: {         // Results from JMeter statistics.json file (Total)
    transaction: string;
    sampleCount: number;
    errorCount: number;
    errorPct: number;
    meanResTime: number;
    medianResTime: number;
    minResTime: number;
    maxResTime: number;
    pct1ResTime: number;
    pct2ResTime: number;
    pct3ResTime: number;
    throughput: number;
    receivedKBytesPerSec: number;
    sentKBytesPerSec: number;    
  };   
}

export interface PerfNode {
  id: string;                 // ID of the run, must be unique.
  name: string;               // User friendly name for the execution
  repository: Repository;     // Repository (GitHub) containing the source code for the tests
  startedAt: string;          // When was the execution started (YYYY-MM-DDTHH:mm:ss.sssZ)
  duration: number;           // In seconds, how long did execution take since startedAt
  platform: Platform;         // On which platform was the performance test executed
  resources: Resource[]       // Array of resources used in the environment
  runs: Run[]                 // Array of runs, a run is composed of rampUp and userCount,
  url: string;                // URL back to the run results
}
