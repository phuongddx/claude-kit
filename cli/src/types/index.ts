/** File version information */
export interface FileVersion {
  path: string;
  hash: string;
  version: string;
  modifiedAt: string;
}

/** Update history entry */
export interface UpdateHistoryEntry {
  timestamp: string;
  fromVersion: string;
  toVersion: string;
  filesChanged: number;
}

/** Kit metadata stored in project */
export interface KitMetadata {
  cliVersion: string;
  kitVersion?: string;
  kitPath: string;
  initializedAt: string;
  lastUpdatedAt?: string;
  updateHistory?: UpdateHistoryEntry[];
  fileVersions?: Record<string, FileVersion>;
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
  dryRun?: boolean;
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

/** Statusline command options */
export interface StatuslineOptions {
  skipDeps?: boolean;
  updateSettings?: boolean;
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

// ============================================================================
// ERROR TYPES
// ============================================================================

/** Base error context */
export interface ErrorContext {
  [key: string]: unknown;
}

/** Error suggestion */
export type ErrorSuggestion = string;

// ============================================================================
// COMMAND TYPES (Dynamic Command Registry)
// ============================================================================

/** Command metadata from frontmatter */
export interface CommandMetadata {
  title: string;
  description: string;
  agent?: string;
  argumentHint?: string;
  category?: string;
  aliases?: string[];
  examples?: string[];
  tags?: string[];
}

/** Discovered command file */
export interface CommandFile {
  path: string;
  name: string;
  category: string;
  metadata: CommandMetadata;
}

/** Command validation result */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// UPDATE/PRESERVATION TYPES
// ============================================================================

/** File preservation rule type */
export type PreserveRuleType = 'exact' | 'glob' | 'directory';

/** File preservation strategy */
export type PreserveStrategy = 'keep' | 'merge';

/** File preservation rule */
export interface PreserveRule {
  type: PreserveRuleType;
  pattern: string;
  strategy: PreserveStrategy;
}

/** File change detection result */
export interface FileChangeDetection {
  added: string[];
  modified: string[];
  deleted: string[];
  unchanged: string[];
}

// ============================================================================
// MERGE/CONFLICT TYPES
// ============================================================================

/** Merge result */
export interface MergeResult {
  success: boolean;
  result?: string;
  conflicts?: Conflict[];
}

/** File conflict */
export interface Conflict {
  path: string;
  base: string;
  local: string;
  remote: string;
}

// ============================================================================
// AGENT TYPES
// ============================================================================

/** Agent message type */
export type AgentMessageType = 'request' | 'response' | 'notification';

/** Agent message */
export interface AgentMessage {
  from: string;
  to: string;
  type: AgentMessageType;
  payload: unknown;
  timestamp: string;
  id: string;
}

/** Agent capability */
export interface AgentCapability {
  name: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  resources: ResourceRequirement;
}

/** Resource requirement */
export interface ResourceRequirement {
  maxTokens?: number;
  timeout?: number;
  model?: string;
}

/** Agent handle for spawned agents */
export interface AgentHandle {
  id: string;
  type: string;
  status: 'idle' | 'busy' | 'error';
}

/** Agent result */
export interface AgentResult {
  agentId: string;
  agentType?: string;
  success: boolean;
  output: unknown;
  error?: string;
  /** Formatted output with agent signature (optional) */
  formattedOutput?: string;
}

// ============================================================================
// AGENT SIGNATURE TYPES
// ============================================================================

/** Agent signature configuration */
export interface AgentSignatureConfig {
  name: string;
  prefix: string;
  emoji?: string;
  color?: string;
}

/** Signature formatting options */
export interface AgentSignatureOptions {
  useColors: boolean;
  useEmoji: boolean;
  isTTY: boolean;
}

/** Signature style preset */
export type AgentSignatureStyle = 'text' | 'emoji' | 'color' | 'full';

// ============================================================================
// SKILL TYPES
// ============================================================================

/** Skill activation rule */
export interface SkillActivationRule {
  keywords: string[];
  filePatterns: string[];
  dependencies: string[];
}

/** Skill metadata */
export interface SkillMetadata {
  name: string;
  description: string;
  activation_keywords: string[];
  tier?: 'beginner' | 'intermediate' | 'advanced';
  color?: string;
}

/** Skill file */
export interface SkillFile {
  path: string;
  name: string;
  metadata: SkillMetadata;
  content: string;
}
