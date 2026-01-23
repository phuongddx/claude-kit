import { z } from 'zod';

/** Hook definition schema */
const hookDefinitionSchema = z.object({
  type: z.enum(['command', 'prompt']),
  command: z.string().optional(),
  prompt: z.string().optional(),
  timeout: z.number().optional()
}).refine(
  (data) => data.type === 'command' ? !!data.command : !!data.prompt,
  { message: "command is required when type is 'command', prompt is required when type is 'prompt'" }
);

/** Hook entry schema */
const hookEntrySchema = z.object({
  matcher: z.string().optional(),
  hooks: z.array(hookDefinitionSchema)
});

/** Settings hooks schema */
const settingsHooksSchema = z.record(
  z.enum([
    'SessionStart',
    'UserPromptSubmit',
    'PreToolUse',
    'PermissionRequest',
    'PostToolUse',
    'PostToolUseFailure',
    'SubagentStart',
    'SubagentStop',
    'Stop',
    'PreCompact',
    'SessionEnd',
    'Notification',
    'Setup'
  ]),
  z.array(hookEntrySchema)
).optional();

/** Permissions schema */
const permissionsSchema = z.object({
  allow: z.array(z.string()).optional(),
  ask: z.array(z.string()).optional(),
  deny: z.array(z.string()).optional(),
  additionalDirectories: z.array(z.string()).optional(),
  defaultMode: z.enum(['default', 'plan', 'acceptEdits', 'dontAsk', 'bypassPermissions']).optional(),
  disableBypassPermissionsMode: z.enum(['disable', 'default']).optional()
}).optional();

/** Settings.json schema */
export const settingsSchema = z.object({
  hooks: settingsHooksSchema,
  permissions: permissionsSchema,
  apiKeyHelper: z.string().optional(),
  cleanupPeriodDays: z.number().optional(),
  companyAnnouncements: z.array(z.string()).optional(),
  env: z.record(z.string()).optional(),
  attribution: z.object({
    commit: z.string().optional(),
    pr: z.string().optional()
  }).optional(),
  disableAllHooks: z.boolean().optional(),
  allowManagedHooksOnly: z.boolean().optional(),
  model: z.string().optional(),
  otelHeadersHelper: z.string().optional(),
  statusLine: z.object({
    type: z.literal('command'),
    command: z.string()
  }).optional(),
  fileSuggestion: z.object({
    type: z.literal('command'),
    command: z.string()
  }).optional(),
  respectGitignore: z.boolean().optional(),
  outputStyle: z.string().optional(),
  forceLoginMethod: z.enum(['claudeai', 'console']).optional(),
  forceLoginOrgUUID: z.string().optional(),
  enableAllProjectMcpServers: z.boolean().optional(),
  enabledMcpjsonServers: z.array(z.string()).optional(),
  disabledMcpjsonServers: z.array(z.string()).optional(),
  plansDirectory: z.string().optional(),
  showTurnDuration: z.boolean().optional(),
  language: z.string().optional(),
  autoUpdatesChannel: z.enum(['stable', 'latest']).optional(),
  spinnerTipsEnabled: z.boolean().optional(),
  terminalProgressBarEnabled: z.boolean().optional()
}).passthrough();

/** Kit metadata schema */
export const kitMetadataSchema = z.object({
  cliVersion: z.string(),
  kitPath: z.string(),
  initializedAt: z.string()
});

/** Kit manifest schema */
export const kitManifestSchema = z.object({
  version: z.string(),
  files: z.array(
    z.object({
      path: z.string(),
      size: z.number(),
      hash: z.string().optional()
    })
  )
});

/** Type exports */
export type KitMetadataSchema = z.infer<typeof kitMetadataSchema>;
export type KitManifestSchema = z.infer<typeof kitManifestSchema>;
export type SettingsSchema = z.infer<typeof settingsSchema>;
