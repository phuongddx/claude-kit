/** Kit metadata stored in project */
export interface KitMetadata {
  cliVersion: string;
  kitPath: string;
  initializedAt: string;
}

/** File manifest entry */
export interface ManifestEntry {
  path: string;
  size: number;
  hash?: string;
}

/** Kit manifest */
export interface KitManifest {
  version: string;
  files: ManifestEntry[];
}

/** CLI command options */
export interface InitOptions {
  force?: boolean;
}

export interface NewOptions {
  force?: boolean;
}

/** Update command options */
export interface UpdateOptions {
  force?: boolean;
}

/** Git commit command options */
export interface GitCmOptions {
  message?: string;
  all?: boolean;
  noVerify?: boolean;
}

/** Git commit and push command options */
export interface GitCpOptions extends GitCmOptions {
  force?: boolean;
}

/** Git pull request command options */
export interface GitPrOptions {
  base?: string;
  draft?: boolean;
  title?: string;
}

/** Git status result */
export interface GitStatus {
  staged: string[];
  modified: string[];
  untracked: string[];
  branch: string;
}

/** File change info */
export interface FileChange {
  path: string;
  status: 'staged' | 'modified' | 'untracked';
}

/** Change analysis result */
export interface ChangeAnalysis {
  files: FileChange[];
  categories: ChangeCategory[];
}

/** Change category */
export interface ChangeCategory {
  type: 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'test' | 'chore';
  files: FileChange[];
}
