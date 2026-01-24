# Changelog

All notable changes to ClaudeKit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `ck update` command for syncing existing projects with latest kit files
- Command metadata service for reading frontmatter from command files
- Argument hints to all command descriptions for better CLI visibility
- Preserve list mechanism to protect local customizations during updates

### Changed
- Kit metadata schema now uses `.passthrough()` for forward compatibility
- Command descriptions now include emoji prefix (👉👉👉) for better visibility
- Path resolver now supports both CLI and project kit paths

### Fixed
- Kit path resolution to work correctly with linked CLI installations

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
