# ClaudeKit Enhancement Plan

**Plan ID:** CK-ENH-001
**Created:** January 24, 2026
**Created by:** Phuong Doan
**Status:** ✅ COMPLETE (All Phases)
**Priority:** High

**Progress:** All 5 phases implemented (2026-01-25)

---

## Executive Summary

This plan outlines enhancements to ClaudeKit based on analysis of:
1. Current implementation gaps (42 missing commands, 28 missing skills)
2. Best practices from AI-assisted development tools community
3. Reference architecture from Open Code CLI integration patterns
4. Dependency and integration opportunities

**Current State:** Solid foundation with 8 agents, 17 commands, 11 skills
**Target State:** Comprehensive toolkit with 17 agents, 75 commands, 38 skills
**Estimated Effort:** 8-10 weeks (4 sprints)

---

## Research Summary

### 1. Best Practices Research (Agent: researcher)

**Key Findings:**
- **Progressive Disclosure is Critical** - Load minimal metadata (10 tokens), expand on demand (200+ tokens)
- **Plugin Architecture Scales Better** - Granular, composable vs monolithic (reference: wshobson/agents with 72 plugins)
- **CLAUDE.md Should Be Minimal** - Best: <60 lines, Good: <300 lines, Avoid: >500 lines
- **Multi-Tool Compatibility is Achievable** - Via portable skills and adapters (syncode pattern)
- **Standardize Frontmatter** - Enables better tooling and discovery

**Actionable Insights:**
- Restructure skills with 3-tier loading (metadata → instructions → resources)
- Implement plugin-based architecture instead of flat directories
- Add `activation_keywords` to skill frontmatter for automatic activation
- Create symlink-friendly structure for multi-tool support

### 2. Codebase Analysis (Agent: Explore)

**Key Findings:**
- **No Dynamic Command Discovery** - Commands manually registered in cli-config.ts
- **Primitive File Preservation** - Only preserves by basename, no pattern matching
- **No Version Tracking** - metadata.json lacks kit version, update history
- **Missing Conflict Resolution** - file-syncer.ts blindly overwrites non-preserved files
- **Test Coverage is Minimal** - Only 4 unit tests, no integration/E2E tests

**Critical Gaps:**
1. Command architecture not scalable for 58+ planned commands
2. Update mechanism lacks rollback, conflict resolution, dry-run
3. Skill activation not implemented (no keyword matching)
4. Agent communication lacks structured message passing

### 3. Dependencies Analysis (Agent: researcher)

**Key Findings:**
- **Current dependencies are appropriate** - No vulnerabilities, well-maintained
- **Git operations can be improved** - Add `simple-git` for cross-platform compatibility
- **File hashing is missing** - Add `hash-wasm` for content-addressable storage
- **File watching capability absent** - Add `chokidar` for hot-reload
- **OpenCode CLI integration opportunity** - Configuration compatibility layer

**Recommended Additions:**
| Package | Purpose | Priority |
|---------|---------|----------|
| `simple-git` | Git operations abstraction | HIGH |
| `@commitlint/cli` | Conventional commits validation | HIGH |
| `hash-wasm` | Fast file hashing | MEDIUM |
| `chokidar` | File watching for hot-reload | MEDIUM |
| `octokit` | GitHub API fallback | MEDIUM |
| `clipboardy` | Clipboard operations | LOW |

---

## Enhancement Phases

### Phase 1: Foundation (2-3 weeks)

**Goal:** Strengthen core architecture for scalability

#### 1.1 Enhanced Error Handling
**File:** `/cli/src/errors/base.ts` (NEW)
```typescript
export class ClaudeKitError extends Error {
  code: string;
  context: Record<string, unknown>;
  recoverable: boolean;
  suggestions: string[];
}
```

**Files to Create:**
- `/cli/src/errors/base.ts`
- `/cli/src/errors/handlers.ts`
- `/cli/src/errors/codes.ts`

#### 1.2 Dynamic Command Registration
**File:** `/cli/src/cli/command-registry.ts` (NEW)
```typescript
export class CommandRegistry {
  discoverCommands(kitPath: string): Command[];
  registerCommand(cli: CAC, command: Command): void;
  validateCommand(command: Command): ValidationResult;
}
```

**Benefits:**
- Auto-discover commands from `.claude/commands/`
- No manual registration needed
- Scalable to 58+ planned commands

**Files to Modify:**
- `/cli/src/cli/cli-config.ts` - Add dynamic registration
- `/cli/src/types/index.ts` - Add Command types

#### 1.3 Enhanced File Preservation
**File:** `/cli/src/domains/updater/preserve-list.ts` (MODIFY)
```typescript
interface PreserveRule {
  type: 'exact' | 'glob' | 'directory';
  pattern: string;
  strategy: 'keep' | 'merge' | 'backup';
}
```

**Benefits:**
- Pattern-based preservation
- User customization
- Merge strategies

#### 1.4 Unit Test Infrastructure
**Directory:** `/cli/test/unit/` (NEW)
```
cli/test/unit/
├── command-registry.test.ts
├── preserve-list.test.ts
└── error-handlers.test.ts
```

**Target Coverage:** 80%+

---

### Phase 2: Update Mechanism (2 weeks)

**Goal:** Safe, reliable updates with rollback

#### 2.1 Version Tracking System
**File:** `/cli/src/domains/versioning/tracker.ts` (NEW)
```typescript
interface FileVersion {
  path: string;
  hash: string;
  version: string;
  modifiedAt: string;
}

export class VersionTracker {
  detectChanges(kitVersion: string): FileChange[];
  createBackup(): string;
  rollback(backupId: string): void;
}
```

**Files to Create:**
- `/cli/src/domains/versioning/tracker.ts`
- `/cli/src/domains/versioning/rollback.ts`

**Files to Modify:**
- `/cli/src/domains/config/schema.ts` - Add version tracking fields:
  - `kitVersion`
  - `lastUpdatedAt`
  - `updateHistory`
  - `fileVersions`

#### 2.2 Conflict Resolution
**File:** `/cli/src/services/merge-resolver.ts` (NEW)
```typescript
export class MergeResolver {
  threeWayMerge(base: string, local: string, remote: string): MergeResult;
  detectConflict(local: string, remote: string): boolean;
  interactiveResolution(conflict: FileConflict): void;
}
```

**Dependencies:** `simple-git`, `hash-wasm`

#### 2.3 Dry-Run Mode
**File:** `/cli/src/commands/update.ts` (MODIFY)
- Add `--dry-run` flag
- Preview changes without applying
- Show conflicts before updating

#### 2.4 Update Integration Tests
**Directory:** `/cli/test/integration/` (NEW)
```
cli/test/integration/
├── update-workflow.test.ts
├── conflict-resolution.test.ts
└── rollback.test.ts
```

---

### Phase 3: Skill System (2 weeks)

**Goal:** Automatic skill activation with progressive disclosure

#### 3.1 Skill Activation Service
**File:** `/cli/src/services/skill-activator.ts` (NEW)
```typescript
interface SkillActivationRule {
  keywords: string[];
  filePatterns: string[];
  dependencies: string[];
}

export class SkillActivator {
  activate(userInput: string, projectFiles: string[]): Skill[];
  resolveDependencies(skills: Skill[]): Skill[];
}
```

**Files to Create:**
- `/cli/src/services/skill-activator.ts`
- `/cli/src/services/skill-indexer.ts`

#### 3.2 Progressive Disclosure for Skills
**Template Update:** All `SKILL.md` files
```markdown
---
name: frontend-development
description: React patterns, hooks, state management
activation_keywords: react, hook, component, state
tier: intermediate
---

## Quick Reference (Always Loaded)
[Top 10 patterns - 50 lines]

## When This Skill is Active
[Clear activation criteria]

## Deep Dive (Loaded on Demand)
[Detailed documentation - linked or expandable]
```

**Skills to Update:** All 11 existing skills
**New Skills to Add (Priority):**
- `ui-styling/` - Tailwind advanced patterns
- `threejs/` - 3D web experiences
- `devops/` - CI/CD and deployment
- `mcp-builder/` - Build MCP servers

#### 3.3 Skill Dependency Resolution
**File:** `/cli/src/services/skill-activator.ts`
- Build dependency graph
- Resolve transitive dependencies
- Detect circular dependencies

**Example Dependencies:**
- `shadcn-ui` → `frontend-development` + `nextjs`
- `better-auth` → `databases`
- `docker` → `backend` skills

---

### Phase 4: Agent Coordination (2 weeks)

**Goal:** Structured agent communication

#### 4.1 Agent Communication Types
**File:** `/cli/src/types/index.ts` (MODIFY)
```typescript
interface AgentMessage {
  from: string;
  to: string;
  type: 'request' | 'response' | 'notification';
  payload: unknown;
  timestamp: string;
}

interface AgentCapability {
  name: string;
  inputs: Schema;
  outputs: Schema;
  resources: ResourceRequirement;
}
```

#### 4.2 Agent Coordinator Service
**File:** `/cli/src/services/agent-coordinator.ts` (NEW)
```typescript
export class AgentCoordinator {
  spawnAgent(agentType: string, context: Context): AgentHandle;
  sendMessage(message: AgentMessage): Promise<AgentMessage>;
  parallelExecute(agents: string[]): Promise<AgentResult[]>;
}
```

**Files to Create:**
- `/cli/src/services/agent-coordinator.ts`
- `/cli/src/services/agent-registry.ts`

#### 4.3 Add Missing Agents
**Agents to Add:**
- `docs-manager.md` - Documentation generation/updates
- `project-manager.md` - Project structure and organization
- `ui-designer.md` - UI/UX design implementation
- `performance-analyst.md` - Performance optimization

---

### Phase 5: Testing & Polish (2 weeks)

**Goal:** Comprehensive test coverage

#### 5.1 Integration Test Suite
**Directory:** `/cli/test/integration/`
```
cli/test/integration/
├── init-workflow.test.ts
├── new-workflow.test.ts
├── git-workflow.test.ts
└── update-workflow.test.ts
```

#### 5.2 End-to-End Tests
**Directory:** `/cli/test/e2e/` (NEW)
```
cli/test/e2e/
├── full-lifecycle.test.ts
├── multi-update.test.ts
└── conflict-resolution.test.ts
```

**Scenarios:**
- Create project → Initialize → Modify → Update → Rollback
- Git workflow: Code → Commit → Push → PR
- Skill activation across different contexts

#### 5.3 Documentation Generation
**File:** `/cli/src/commands/docs-generate.ts` (NEW)
- Auto-generate command reference
- Auto-generate agent documentation
- Auto-generate skill catalog

#### 5.4 Performance Optimization
- Profile token usage for skill activation
- Optimize file hashing with hash-wasm
- Add caching for command metadata

---

## Files to Create

### CLI Source Code
```
cli/src/
├── cli/
│   └── command-registry.ts          # Dynamic command discovery
├── services/
│   ├── skill-activator.ts           # Skill activation logic
│   ├── skill-indexer.ts             # Skill indexing
│   ├── agent-coordinator.ts         # Agent orchestration
│   ├── agent-registry.ts            # Agent registration
│   ├── merge-resolver.ts            # 3-way merge for updates
│   └── docs-generator.ts            # Documentation generation
├── domains/
│   ├── versioning/
│   │   ├── tracker.ts              # Version tracking
│   │   └── rollback.ts             # Rollback capability
│   └── config/
│       └── manager.ts              # Config management
├── errors/
│   ├── base.ts                     # Base error class
│   ├── handlers.ts                 # Error handlers
│   └── codes.ts                    # Error codes
└── telemetry/
    ├── tracker.ts                  # Usage tracking (optional)
    └── reporter.ts                 # Error reporting (optional)
```

### Kit Templates
```
kits/default/.claude/
├── agents/
│   ├── docs-manager.md             # Documentation agent
│   ├── project-manager.md          # Project management agent
│   ├── ui-designer.md              # UI/UX design agent
│   └── performance-analyst.md      # Performance agent
├── commands/
│   ├── fix/
│   │   ├── hard.md                 # Complex bug fixes
│   │   ├── ci.md                   # CI/CD fixes
│   │   ├── test.md                 # Test failures
│   │   └── ui.md                   # UI bug fixes
│   ├── design/
│   │   ├── fast.md                 # Quick UI design
│   │   └── screenshot.md           # Screenshot-to-code
│   └── docs/
│       ├── init.md                 # Initialize documentation
│       └── update.md               # Update documentation
└── skills/
    ├── ui-styling/
    │   └── SKILL.md                # Tailwind/CSS patterns
    ├── threejs/
    │   └── SKILL.md                # 3D web graphics
    ├── devops/
    │   └── SKILL.md                # CI/CD deployment
    └── mcp-builder/
        └── SKILL.md                # MCP server development
```

### Tests
```
cli/test/
├── unit/
│   ├── command-registry.test.ts
│   ├── skill-activator.test.ts
│   ├── file-syncer.test.ts
│   ├── merge-resolver.test.ts
│   └── error-handlers.test.ts
├── integration/
│   ├── init-workflow.test.ts
│   ├── new-workflow.test.ts
│   ├── update-workflow.test.ts
│   ├── git-workflow.test.ts
│   └── conflict-resolution.test.ts
└── e2e/
    ├── full-lifecycle.test.ts
    ├── multi-update.test.ts
    └── skill-activation.test.ts
```

## Files to Modify

```
cli/src/
├── cli/cli-config.ts                # Add dynamic registration
├── types/index.ts                   # Add new types
├── domains/updater/
│   ├── index.ts                     # Add rollback support
│   ├── file-syncer.ts              # Add conflict resolution
│   └── preserve-list.ts            # Add pattern matching
├── domains/config/
│   ├── index.ts                     # Add migration support
│   └── schema.ts                    # Add version tracking fields
├── services/
│   └── command-metadata.ts          # Enhanced parsing
└── shared/
    └── git.ts                       # Migrate to simple-git
```

## Dependencies to Add

| Package | Version | Purpose | When |
|---------|---------|---------|------|
| `simple-git` | Latest | Git operations abstraction | Phase 1 |
| `@commitlint/cli` | Latest | Conventional commits validation | Phase 2 |
| `hash-wasm` | Latest | Fast file hashing | Phase 2 |
| `chokidar` | Latest | File watching for hot-reload | Phase 3 |
| `octokit` | Latest | GitHub API fallback | Phase 4 |

**Installation Command:**
```bash
bun add simple-git @commitlint/cli hash-wasm chokidar octokit
bun add -D @types/simple-git
```

## Implementation Steps

### Step 1: Setup Foundation (Week 1)
1. Create error handling system
2. Set up test infrastructure
3. Add `simple-git` dependency
4. Refactor git.ts to use simple-git

### Step 2: Dynamic Commands (Week 1-2)
5. Create command-registry.ts
6. Modify cli-config.ts for dynamic registration
7. Add command validation
8. Write unit tests

### Step 3: Update Mechanism (Week 2-3)
9. Add hash-wasm dependency
10. Create version-tracker.ts
11. Implement file change detection
12. Add merge-resolver.ts
13. Add dry-run mode to update command
14. Write integration tests

### Step 4: Skill System (Week 4-5)
15. Create skill-activator.ts
16. Create skill-indexer.ts
17. Update all 11 skills with progressive disclosure
18. Add 4 priority skills (ui-styling, threejs, devops, mcp-builder)
19. Implement dependency resolution
20. Write unit tests

### Step 5: Agent Coordination (Week 5-6)
21. Add agent communication types
22. Create agent-coordinator.ts
23. Create agent-registry.ts
24. Add 4 new agents (docs-manager, project-manager, ui-designer, performance-analyst)
25. Write unit tests

### Step 6: Additional Commands (Week 6-7)
26. Add fix commands: hard, ci, test, ui
27. Add design commands: fast, screenshot
28. Add docs commands: init, update
29. Write unit tests

### Step 7: Testing (Week 7-8)
30. Write integration test suite
31. Write E2E test scenarios
32. Achieve 80% test coverage
33. Add performance benchmarks

### Step 8: Polish (Week 8)
34. Generate documentation
35. Update CLAUDE.md
36. Update README
37. Create migration guide
38. Release notes

## Testing Strategy

### Unit Tests
- Each service/domain has corresponding test file
- Mock external dependencies (git, file system)
- Focus on business logic

### Integration Tests
- Test multi-component workflows
- Use temporary directories
- Clean up after each test

### E2E Tests
- Full lifecycle: init → modify → update → rollback
- Git workflows: commit → push → PR
- Conflict resolution scenarios

### Test Coverage Target
- Unit tests: 80%+
- Integration tests: 60%+
- E2E tests: Critical paths only

## Success Criteria

### Phase 1 (Foundation) ✅ COMPLETE
- [x] Dynamic command discovery working
- [x] Error handling system in place
- [x] Unit test infrastructure set up
- [x] All existing tests passing

### Phase 2 (Update Mechanism) ✅ COMPLETE
- [x] Version tracking implemented
- [x] Conflict resolution working
- [x] Dry-run mode functional
- [x] Rollback capability tested

### Phase 3 (Skill System) ✅ COMPLETE
- [x] Skill activation automatic
- [x] Progressive disclosure implemented
- [x] 4 new agents added
- [x] Dependency resolution working

### Phase 4 (Agent Coordination) ✅ COMPLETE
- [x] Agent communication structured
- [x] 4 new agents added
- [x] Parallel execution supported

### Phase 5 (Testing & Polish) ✅ COMPLETE
- [x] 52 tests passing (unit + integration)
- [x] Integration tests passing
- [x] New commands added to kit
- [x] Documentation updated

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing projects | High | Thorough testing, migration guide |
| Dependency conflicts | Medium | Pin versions, test in isolation |
| Performance degradation | Medium | Benchmark before/after, optimize hot paths |
| Token usage increase | Low | Progressive disclosure minimizes tokens |
| Skill activation false positives | Medium | Tunable thresholds, user feedback |

## Estimated Complexity

| Phase | Files Created | Files Modified | Lines of Code | Complexity |
|-------|--------------|----------------|---------------|------------|
| 1 | 8 | 6 | ~800 | Medium |
| 2 | 6 | 4 | ~600 | High |
| 3 | 12 | 11 | ~1,200 | High |
| 4 | 8 | 2 | ~800 | Medium |
| 5 | 15 | 3 | ~400 | Low |
| **Total** | **49** | **26** | **~3,800** | **High** |

## Next Steps

1. Review and approve this plan
2. Set up milestone tracking
3. Begin Phase 1: Foundation
4. Weekly progress reviews

## References

- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [wshobson/agents](https://github.com/wshobson/agents) - 72 plugins reference
- [OpenCode GitHub](https://github.com/opencode-ai/opencode)
- [HumanLayer CLAUDE.md Guide](https://www.humanlayer.dev/blog/writing-a-good-claude-md)
- Current ClaudeKit documentation in `/docs/`

---

**Created by:** Phuong Doan
**Last Updated:** January 24, 2026
