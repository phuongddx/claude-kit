# Changelog

All notable changes to ClaudeKit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

**Phase 1 - Foundation:**
- Error handling system with structured errors and suggestions
  - Base error classes with error codes
  - Error handlers with actionable suggestions
  - ClaudeKitError base class
- Dynamic command registry for auto-discovery
  - Automatic command discovery from `.claude/commands/`
  - Command metadata extraction from frontmatter
  - Command categorization and listing
- Enhanced file preservation with pattern-based rules
  - Exact file matching
  - Glob pattern support
  - Directory-level preservation
- Unit test infrastructure
  - 26 new unit tests
  - Test utilities and helpers
  - Coverage for core services

**Phase 2 - Update Mechanism:**
- Version tracking with SHA256 file hashing
  - Fast file hashing using hash-wasm
  - File change detection
  - Version history tracking
- Rollback capability with automatic backups
  - Automatic backup before updates
  - One-step rollback to previous version
  - Backup cleanup on successful updates
- Three-way merge conflict resolution
  - Intelligent merge between kit, local, and base versions
  - Conflict detection and marking
  - Manual conflict resolution guidance
- Dry-run mode for safe update preview
  - Preview changes before applying
  - See what files will be added/modified/removed
  - Safe experimentation

**Phase 3 - Skill System:**
- Skill indexer for discovering all available skills
  - Scan `.claude/skills/` directories
  - Extract skill metadata from frontmatter
  - Dependency resolution
  - Circular dependency detection
- Skill activator with context-aware automatic loading
  - Keyword-based activation
  - Project context awareness
  - Dependency resolution

**Phase 4 - Agent Coordination:**
- Agent registry for discovering and managing agents
  - Scan `.claude/agents/` directories
  - Extract agent metadata
  - Agent capability tracking
- Agent coordinator for structured message passing
  - Parallel agent execution
  - Sequential agent execution
  - Inter-agent communication

**Phase 5 - Kit Content:**
- 4 new agents:
  - docs-manager - Documentation generation and updates
  - project-manager - Project structure and organization
  - ui-designer - UI/UX design and component architecture
  - performance-analyst - Performance profiling and optimization
- 7 new commands:
  - fix:hard - Complex bug fixes requiring investigation
  - fix:ci - Fix CI/CD pipeline failures
  - fix:test - Fix failing tests
  - fix:ui - Fix UI bugs and visual issues
  - design:fast - Quick UI design implementation
  - docs:update - Update existing documentation

**Dependencies added:**
- simple-git@3.30.0 - Git operations abstraction
- @commitlint/cli@20.3.1 - Conventional commits validation
- hash-wasm@4.12.0 - Fast file hashing
- minimatch@10.1.1 - Glob pattern matching
- diff@8.0.3 - Three-way merge support

### Changed
- Kit metadata schema now uses `.passthrough()` for forward compatibility
- Enhanced metadata with update history tracking
- Command descriptions now include emoji prefix (👉👉👉) for better visibility
- Path resolver now supports both CLI and project kit paths
- Preserve list enhanced with pattern-based rules

### Fixed
- Kit path resolution to work correctly with linked CLI installations

### Test Coverage
- 52 tests passing (26 unit + 26 integration tests)
- Test coverage for:
  - Command registry
  - Preserve list
  - Skill indexer
  - Version tracker
  - Update workflow

## [0.2.0] - 2025-01-XX

### Added
- Initial AI agents (planner, fullstack-developer, researcher, tester, debugger)
- Core commands (/bootstrap, /cook, /plan, /test, /debug, /ask)
- Fix commands (/fix:fast)
- Git commands (/git:cm)
- 11 domain skills (frontend, backend, iOS, Next.js, shadcn-ui, etc.)
- 3 workflow templates (feature-development, bug-fixing, project-init)

### Changed
- CLI now reads command metadata from `.claude/commands/` files
- Improved path resolution for kit templates

## [0.1.0] - 2025-01-XX

### Added
- Initial `ck` CLI tool
- `ck new` command for creating new projects
- `ck init` command for initializing existing projects
- Default kit template with basic structure
- Metadata tracking for kit versions
- Settings.json and settings.local.json configuration

---

## Types of Changes

- **Added** - New features
- **Changed** - Changes to existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security vulnerability fixes
