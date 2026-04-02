export interface GarakRunConfig {
  entry_type: "start_run setup";
  "plugins.target_type": string;
  "plugins.target_name": string;
  "plugins.probe_spec": string;
  "plugins.detector_spec": string;
  "transient.run_id": string;
  "transient.starttime_iso": string;
  "run.generations": number;
  "_config.version": string;
  [key: string]: unknown;
}

export interface GarakAttempt {
  entry_type: "attempt";
  uuid: string;
  seq: number;
  status: number;
  probe_classname: string;
  goal: string;
  prompt: {
    turns: Array<{
      role: string;
      content: { text: string; lang?: string };
    }>;
  };
  outputs: Array<{ text: string }>;
  detector_results: Record<string, number[]>;
  notes: Record<string, unknown>;
}

export interface GarakEval {
  entry_type: "eval";
  probe: string;
  detector: string;
  passed: number;
  fails: number;
  nones: number;
  total_evaluated: number;
  total_processed: number;
}

export interface GarakHit {
  goal: string;
  prompt: {
    turns: Array<{
      role: string;
      content: { text: string };
    }>;
  };
  output: { text: string };
  triggers: string[];
  score: number;
  run_id: string;
  attempt_id: string;
  attempt_seq: number;
  generator: string;
  probe: string;
  detector: string;
}

export interface RunSummary {
  id: string;
  filename: string;
  targetType: string;
  targetName: string;
  probeSpec: string;
  startTime: string;
  garakVersion: string;
  totalAttempts: number;
  totalEvals: number;
  hasHitlog: boolean;
  hitCount: number;
  fileSize: number;
}

export interface RunDetail extends RunSummary {
  evals: GarakEval[];
  attempts: GarakAttempt[];
  hits: GarakHit[];
  probeBreakdown: ProbeBreakdown[];
}

export interface ProbeBreakdown {
  probe: string;
  detector: string;
  passed: number;
  fails: number;
  total: number;
  passRate: number;
}
