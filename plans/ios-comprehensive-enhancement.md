# iOS Comprehensive Enhancement Plan

**Created:** 2025-01-25
**Status:** Draft
**Priority:** High
**Complexity:** Medium-High

---

## Overview

This plan combines two complementary iOS enhancements:

1. **iOS-Specific Commands** - Add 4 core iOS commands and restructure iOS agents into a unified architecture
2. **XcodeBuildMCP Integration** - Integrate XcodeBuildMCP server for autonomous Xcode operations

## Architecture Changes

### Before (Current)
```
3 Separate iOS Agents:
├── ios-developer.md  (implementation)
├── ios-tester.md     (testing)
└── ios-debugger.md   (debugging + simulator)

No iOS-specific commands
No MCP integration
```

### After (Proposed)
```
1 Unified iOS Agent + 3 Specialized Skills + MCP Integration:
├── ios-developer.md (unified agent with MCP tools)
└── .claude/skills/ios-development/
    ├── development.md  (implementation patterns)
    ├── build.md        (build systems + simulator)
    └── tester.md       (testing patterns)

4 iOS-Specific Commands:
├── /ios:cook    - Implement iOS features
├── /ios:test    - Run iOS tests
├── /ios:debug   - Debug iOS issues
└── /ios:sim     - Simulator management

XcodeBuildMCP Integration:
├── 83 MCP tools for autonomous Xcode operations
└── MCP server configuration in settings.json
```

---

## Phase 1: Restructure iOS Agent & Skills

### Step 1: Create iOS Development Skills

Create `/cli/.claude/skills/ios-development/` directory with 3 skill files:

#### 1.1 `development.md` Skill
**Purpose:** Core iOS development patterns and implementation

**Content:**
- Swift 6 concurrency (async/await, Sendable, Actors)
- SwiftUI vs UIKit strategy
- Architecture patterns (MVVM, TCA)
- State management (@Observable, property wrappers)
- NavigationStack implementation
- Networking with URLSession
- Persistence (SwiftData, Core Data)
- Common UI components (List, Grid, Sheet, Form)
- Code examples and patterns

#### 1.2 `build.md` Skill
**Purpose:** Build systems, simulator management, and Xcode workflows

**Content:**
- Xcode project configuration
- Build settings and schemes
- Swift Package Manager
- Dependency management (SPM, CocoaPods)
- Asset catalogs and resources
- Code signing and provisioning
- Build optimization
- **Simulator management** (xcrun simctl + XcodeBuildMCP)
- Common build errors and fixes
- **MCP tool patterns** (discover_projs, list_schemes, build_sim, etc.)

#### 1.3 `tester.md` Skill
**Purpose:** Testing strategies and test implementation

**Content:**
- XCTest patterns (unit tests)
- XCUITest patterns (UI tests)
- Mock dependencies setup
- Given-When-Then structure
- Async/await testing
- Coverage goals and reporting
- Test organization
- Accessibility identifiers for UI testing
- **MCP test automation** (test_sim, test_device)

### Step 2: Create Unified ios-developer Agent with MCP

**File:** `/cli/.claude/agents/ios-developer.md` (replace existing)

**Frontmatter:**
```yaml
---
name: ios-developer
description: Unified iOS development agent for implementation, testing, debugging, build configuration, and autonomous Xcode operations via XcodeBuildMCP.
color: orange
allowed-tools:
  # Core tools
  - Read
  - Grep
  - Glob
  - Bash
  - Edit
  - Write
  # MCP tools - XcodeBuildMCP server (project discovery)
  - mcp__xcodebuildmcp__discover_projs
  - mcp__xcodebuildmcp__list_schemes
  - mcp__xcodebuildmcp__show_build_settings
  - mcp__xcodebuildmcp__get_app_bundle_id
  # MCP tools - Simulator build and run
  - mcp__xcodebuildmcp__build_sim
  - mcp__xcodebuildmcp__build_run_sim
  - mcp__xcodebuildmcp__boot_sim
  - mcp__xcodebuildmcp__install_app_sim
  - mcp__xcodebuildmcp__launch_app_sim
  - mcp__xcodebuildmcp__stop_app_sim
  - mcp__xcodebuildmcp__list_sims
  - mcp__xcodebuildmcp__open_sim
  - mcp__xcodebuildmcp__get_sim_app_path
  # MCP tools - Testing
  - mcp__xcodebuildmcp__test_sim
  - mcp__xcodebuildmcp__test_device
  - mcp__xcodebuildmcp__test_macos
  # MCP tools - UI automation
  - mcp__xcodebuildmcp__describe_ui
  - mcp__xcodebuildmcp__tap
  - mcp__xcodebuildmcp__swipe
  - mcp__xcodebuildmcp__type_text
  - mcp__xcodebuildmcp__key_press
  - mcp__xcodebuildmcp__screenshot
  # MCP tools - Logging
  - mcp__xcodebuildmcp__start_sim_log_cap
  - mcp__xcodebuildmcp__stop_sim_log_cap
  - mcp__xcodebuildmcp__start_device_log_cap
  - mcp__xcodebuildmcp__stop_device_log_cap
  # MCP tools - Device management (optional)
  - mcp__xcodebuildmcp__list_devices
  - mcp__xcodebuildmcp__build_device
  - mcp__xcodebuildmcp__install_app_device
  - mcp__xcodebuildmcp__launch_app_device
  - mcp__xcodebuildmcp__stop_app_device
  # MCP tools - Utilities
  - mcp__xcodebuildmcp__clean
  - mcp__xcodebuildmcp__doctor
  - mcp__xcodebuildmcp__swift_package_build
  - mcp__xcodebuildmcp__swift_package_test
---
```

**Agent Structure:**
```markdown
You are the iOS development agent. You handle all iOS development tasks including implementation, testing, debugging, build configuration, and autonomous Xcode operations.

## When Active
- User works on iOS project (`.xcodeproj`, `.swift` files)
- User uses iOS-specific commands (/ios:cook, /ios:test, /ios:debug, /ios:sim)
- Questions about SwiftUI, UIKit, or iOS patterns
- Xcode build or test operations needed
- Simulator management requested

## MCP-Enhanced Capabilities

This agent integrates with XcodeBuildMCP for autonomous Xcode operations.

### Prerequisites
- macOS 14.5+ with Xcode 16.x+
- XcodeBuildMCP server installed: `claude mcp add XcodeBuildMCP npx xcodebuildmcp@latest`
- Code signing configured for device deployment (run in Xcode first)

### When MCP Tools Are Available
1. **Project Discovery** - Auto-discover projects and schemes
2. **Build Automation** - Build for simulator, device, or macOS
3. **Simulator Management** - Boot, install, launch, stop apps
4. **Testing** - Run XCTest/XCUITest suites
5. **UI Automation** - Tap, swipe, type, screenshot
6. **Log Capture** - Stream simulator/device logs
7. **Environment Validation** - Run diagnostics

### Fallback Without MCP
If XcodeBuildMCP is unavailable:
1. Use Bash to run xcodebuild commands directly
2. Use simctl for simulator operations
3. Guide user to install XcodeBuildMCP
4. Provide manual workflow instructions

## Your Process

1. **Assess the Task**
   - Implementation? → Reference `skills/ios-development/development.md`
   - Testing? → Reference `skills/ios-development/tester.md`
   - Debugging? → Reference `skills/ios-development/development.md`
   - Build/Simulator? → Reference `skills/ios-development/build.md`

2. **Discover Project (MCP preferred)**
   - Use `mcp__xcodebuildmcp__discover_projs` if available
   - Fallback: Glob for `.xcodeproj`/`.xcworkspace`
   - Use `mcp__xcodebuildmcp__list_schemes` to identify schemes
   - Store project path and scheme for session

3. **Validate Environment**
   - Run `mcp__xcodebuildmcp__doctor` if issues suspected
   - Verify Xcode version compatibility
   - Check simulator availability

4. **Execute Based on Task Type**
   - **Implementation**: models → ViewModels → views → networking → tests → build
   - **Testing**: Use `mcp__xcodebuildmcp__test_sim` → Parse results → Report coverage
   - **Debugging**: Analyze logs → Identify root cause → Suggest fix
   - **Build/Simulator**: Use MCP tools or xcrun simctl → Report results

5. **Report Results**
   - Parse build output for errors
   - Summarize test results
   - Provide next steps for failures

## Key Functions

### Development Functions
- `implementSwiftUIView()` - SwiftUI views with @Observable
- `implementViewModel()` - @Observable ViewModels with async operations
- `setupNetworking()` - URLSession + async/await
- `implementSwiftData()` - SwiftData @Model classes

### Testing Functions
- `writeXCTestSuite()` - XCTest with async support
- `writeXCUITest()` - UI tests with accessibility
- `configureMocks()` - Mock dependencies
- `runTests()` - Use MCP test tools or xcodebuild
- `runCoverage()` - Coverage reporting

### Debugging Functions
- `analyzeCrashLog()` - Parse crash reports
- `debugAsyncIssues()` - Concurrency problems
- `debugUIIssues()` - SwiftUI state issues
- `captureLogs()` - Start log capture via MCP

### Build/Simulator Functions (MCP-enhanced)
- `discoverProject()` - Find Xcode projects
- `buildForSimulator()` - Build using MCP tools
- `manageSimulator()` - Boot, install, launch via MCP
- `runUITests()` - UI automation via MCP tools
- `diagnoseBuildError()` - Build failure analysis

## MCP Workflow Patterns

### Build for Simulator
```swift
// When MCP tools available:
1. mcp__xcodebuildmcp__discover_projs({ workspaceRoot: '.' })
2. mcp__xcodebuildmcp__list_schemes({ workspacePath: 'MyApp.xcworkspace' })
3. mcp__xcodebuildmcp__build_sim({
     workspacePath: 'MyApp.xcworkspace',
     scheme: 'MyApp',
     simulatorId: 'iPhone-16-Pro-UUID',
     configuration: 'Debug'
   })

// Fallback without MCP:
Bash: xcodebuild -workspace MyApp.xcworkspace -scheme MyApp \
      -sdk iphonesimulator -destination 'platform=iOS Simulator,name=iPhone 16 Pro'
```

### Run Tests
```swift
// MCP approach:
mcp__xcodebuildmcp__test_sim({
  projectPath: 'MyApp.xcodeproj',
  scheme: 'MyApp',
  simulatorId: 'UUID',
  onlyTesting: ['MyAppTests/ProductTests']
})

// Fallback:
Bash: xcodebuild test -project MyApp.xcodeproj -scheme MyApp \
      -destination 'platform=iOS Simulator,name=iPhone 16 Pro'
```

### UI Automation
```swift
// IMPORTANT: Always use describe_ui first - NEVER guess coordinates
1. mcp__xcodebuildmcp__describe_ui({ simulatorId: 'UUID' })
2. Parse UI hierarchy for element coordinates
3. mcp__xcodebuildmcp__tap({ simulatorId: 'UUID', x: 100, y: 200 })
4. mcp__xcodebuildmcp__type_text({ simulatorId: 'UUID', text: 'Hello' })
5. mcp__xcodebuildmcp__screenshot({ simulatorId: 'UUID' })
```

### Log Capture
```swift
1. sessionId = mcp__xcodebuildmcp__start_sim_log_cap({
     simulatorId: 'UUID',
     bundleId: 'com.myapp'
   })
2. // Perform actions
3. logs = mcp__xcodebuildmcp__stop_sim_log_cap({ sessionId })
```

## Code Patterns

**ViewModel with @Observable (iOS 17+)**
```swift
@Observable
class ProductsViewModel {
    var products: [Product] = []
    var isLoading = false

    func loadProducts() async {
        isLoading = true
        defer { isLoading = false }
        products = try await productService.fetchProducts()
    }
}
```

**SwiftUI View**
```swift
struct ProductsView: View {
    @State private var viewModel = ProductsViewModel()

    var body: some View {
        List(viewModel.products) { product in
            Text(product.name)
        }
        .task { await viewModel.loadProducts() }
    }
}
```

**Networking with async/await**
```swift
func fetch<T: Decodable>(_ type: T.Type, from url: URL) async throws -> T {
    let (data, response) = try await URLSession.shared.data(from: url)
    guard let httpResponse = response as? HTTPURLResponse,
          (200...299).contains(httpResponse.statusCode) else {
        throw NetworkError.invalidResponse
    }
    return try decoder.decode(T.self, from: data)
}
```

## Architecture Decision
```
Simple app (<10 views) → No architecture
Medium app (10-50 views) → MVVM with @Observable
Large app (50+ views) → TCA (Composable Architecture)
```

## Rules
- Default to SwiftUI for new code
- Use @Observable (iOS 17+) instead of ObservableObject
- Use async/await, not completion handlers
- Use MainActor for UI updates
- Write XCTest for new code
- **MCP Rule 1:** ALWAYS use `describe_ui` before UI interactions - never guess coordinates
- **MCP Rule 2:** Prefer `_ws` tools for projects with dependencies
- **MCP Rule 3:** Use simulator for faster iteration, device only for final validation
- **MCP Rule 4:** Run `doctor` when encountering unexpected errors
- **MCP Rule 5:** Cache project discovery results to avoid repeated scans
- Don't add backward compatibility

## Completion Report

```markdown
## iOS Task Complete

### Type: [Implementation/Testing/Debugging/Build/Simulator]

### Project
- Workspace/Project: `MyApp.xcworkspace`
- Scheme: `MyApp`
- Configuration: Debug

### Changes Made
- Files created/modified

### Build Result
- Status: ✅ Success / ❌ Failed
- Errors: [if any]

### Tests
- Tests passing: ✓
- Coverage: X%
- Failed: [if any]

### Verification
- [ ] Compiles without errors
- [ ] Tests passing
- [ ] No console warnings

### Next Steps
- [ ] Remaining tasks
```
```

### Step 3: Remove Old Agents

**Delete these files:**
- `/cli/.claude/agents/ios-tester.md`
- `/cli/.claude/agents/ios-debugger.md`

**Keep and replace:**
- `/cli/.claude/agents/ios-developer.md` (replace with unified MCP-enhanced version)

---

## Phase 2: Create iOS Commands

### Command Specifications

#### 1. `/ios:cook` - Implement iOS Features
**File:** `kits/default/.claude/commands/ios/cook.md`
**Agent:** `ios-developer`
**Skill Focus:** `development`

**Frontmatter:**
```yaml
---
title: iOS Cook
description: Implement iOS features from plans or descriptions with Swift 6, iOS 18+, SwiftUI support
agent: ios-developer
argument-hint: 👉👉👉 [plan file or feature description]
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - Edit
  - Write
  - TaskCreate
  - mcp__xcodebuildmcp__discover_projs
  - mcp__xcodebuildmcp__list_schemes
  - mcp__xcodebuildmcp__build_sim
  - mcp__xcodebuildmcp__test_sim
  - mcp__xcodebuildmcp__doctor
---
```

**Description:**
Implement iOS features from plans or descriptions. Supports Swift 6, iOS 18+, SwiftUI, and UIKit patterns.

**Usage:**
```
/ios:cook [plan file or description]
/ios:cook plans/240122-auth.md
/ios:cook add user profile screen with SwiftUI
```

**Process:**
1. Parse plan or feature description
2. Reference `development.md` skill for patterns
3. Determine architecture (MVVM vs TCA based on complexity)
4. Implement SwiftUI views with proper state management
5. Create ViewModels with @Observable macro
6. Set up networking (async/await) if needed
7. Write XCTest alongside code
8. Build and verify compilation (use MCP tools if available)

**Completion Report:**
- Files created/modified
- Architecture decision (MVVM/TCA/none)
- SwiftUI views implemented
- XCTest coverage status
- Build verification result

---

#### 2. `/ios:test` - Run iOS Tests
**File:** `kits/default/.claude/commands/ios/test.md`
**Agent:** `ios-developer`
**Skill Focus:** `tester`

**Frontmatter:**
```yaml
---
title: iOS Test
description: Run iOS unit tests and UI tests using xcodebuild or XcodeBuildMCP
agent: ios-developer
argument-hint: 👉👉👉 [--unit | --ui | --coverage | test-target]
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - mcp__xcodebuildmcp__discover_projs
  - mcp__xcodebuildmcp__list_schemes
  - mcp__xcodebuildmcp__test_sim
  - mcp__xcodebuildmcp__test_device
  - mcp__xcodebuildmcp__start_sim_log_cap
  - mcp__xcodebuildmcp__stop_sim_log_cap
  - mcp__xcodebuildmcp__doctor
---
```

**Description:**
Run iOS unit tests and UI tests using xcodebuild or XcodeBuildMCP. Provides coverage metrics and failure analysis.

**Usage:**
```
/ios:test                           # Run all tests
/ios:test --unit                    # Unit tests only
/ios:test --ui                      # UI tests only
/ios:test MyAppTests                # Specific test target
/ios:test --coverage                # With coverage report
```

**Process:**
1. Reference `tester.md` skill for testing patterns
2. Discover project/workspace (MCP preferred)
3. List available test targets
4. Run tests using `mcp__xcodebuildmcp__test_sim` or xcodebuild
5. Parse test results
6. Calculate coverage metrics
7. Highlight failures with diagnostics

**Completion Report:**
- Tests passed/failed count
- Execution time
- Coverage percentage
- Failed tests with reasons
- Recommendations for fixes

---

#### 3. `/ios:debug` - Debug iOS Issues
**File:** `kits/default/.claude/commands/ios/debug.md`
**Agent:** `ios-developer`
**Skill Focus:** `development`

**Frontmatter:**
```yaml
---
title: iOS Debug
description: Debug iOS crashes, concurrency issues, SwiftUI state problems, and performance issues
agent: ios-developer
argument-hint: 👉👉👉 [issue description or error log]
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - mcp__xcodebuildmcp__discover_projs
  - mcp__xcodebuildmcp__list_schemes
  - mcp__xcodebuildmcp__build_sim
  - mcp__xcodebuildmcp__start_sim_log_cap
  - mcp__xcodebuildmcp__stop_sim_log_cap
  - mcp__xcodebuildmcp__start_device_log_cap
  - mcp__xcodebuildmcp__stop_device_log_cap
  - mcp__xcodebuildmcp__doctor
---
```

**Description:**
Debug iOS crashes, concurrency issues, SwiftUI state problems, and performance issues.

**Usage:**
```
/ios:debug app crashes on launch
/ios:debug SwiftUI view not updating
/ios:debug data race warning
/ios:debug memory leak in UserManager
```

**Process:**
1. Reference `development.md` skill for debugging patterns
2. Analyze issue description
3. Capture logs using MCP tools if available
4. Identify root cause category:
   - Concurrency issues (actors, Sendable, MainActor)
   - SwiftUI state problems (@State, @Binding, @Observable)
   - Memory issues (retain cycles, leaks)
   - Build/signing issues
5. Provide fix recommendations
6. Guide through Instruments usage if needed

**Completion Report:**
- Root cause identified
- Issue category (concurrency/UI/memory/build)
- Fix recommendations
- Log excerpts (if captured)
- Instruments guidance (if applicable)
- Related files to check

---

#### 4. `/ios:sim` - Simulator Management
**File:** `kits/default/.claude/commands/ios/simulator.md`
**Agent:** `ios-developer`
**Skill Focus:** `build`

**Frontmatter:**
```yaml
---
title: iOS Simulator
description: List, boot, shutdown, and manage iOS simulators using XcodeBuildMCP or xcrun simctl
agent: ios-developer
argument-hint: 👉👉👉 [--list | --boot | --shutdown | --install | --launch | --screenshot]
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - mcp__xcodebuildmcp__list_sims
  - mcp__xcodebuildmcp__boot_sim
  - mcp__xcodebuildmcp__open_sim
  - mcp__xcodebuildmcp__install_app_sim
  - mcp__xcodebuildmcp__launch_app_sim
  - mcp__xcodebuildmcp__stop_app_sim
  - mcp__xcodebuildmcp__screenshot
  - mcp__xcodebuildmcp__describe_ui
  - mcp__xcodebuildmcp__doctor
---
```

**Description:**
List, boot, shutdown, and manage iOS simulators using XcodeBuildMCP or xcrun simctl.

**Usage:**
```
/ios:sim --list                    # List available simulators
/ios:sim --boot "iPhone 16 Pro"    # Boot simulator
/ios:sim --shutdown                # Shutdown booted simulator
/ios:sim --install MyApp.app       # Install app
/ios:sim --launch com.myapp.bundle # Launch app
/ios:sim --screenshot              # Take screenshot
```

**Process:**
1. Reference `build.md` skill for simulator patterns
2. Use MCP tools if available (`list_sims`, `boot_sim`, etc.)
3. Fallback to xcrun simctl commands via Bash
4. Perform requested action
5. Report results

**Completion Report:**
- Simulator status
- Device UDID/name
- Action completed
- Bundle ID (if app operation)
- Next steps

---

## Phase 3: MCP Integration Configuration

### Step 1: Create CLI Settings for MCP

**File:** `/cli/.claude/settings.json` (create if not exists)

```json
{
  "permissions": {
    "allow": [
      "mcp__xcodebuildmcp__*"
    ]
  },
  "mcpServers": {
    "XcodeBuildMCP": {
      "command": "npx",
      "args": ["-y", "xcodebuildmcp@latest"],
      "env": {
        "XCODEBUILDMCP_ENABLED_WORKFLOWS": "simulator,device,project-discovery,ui-testing,logging,doctor,swift-package"
      }
    }
  }
}
```

**Note:** The `mcpServers` block can also be in `~/.claude.json` for user-level installation.

### Step 2: Update Kit Template Settings

**File:** `kits/default/.claude/settings.json`

Add MCP permissions to the kit template so new projects have them:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npm run lint -- --fix 2>/dev/null || true",
            "timeout": 30
          }
        ]
      }
    ]
  },
  "permissions": {
    "allow": [
      "Bash(npm run lint:*)",
      "Bash(npm run build)",
      "Bash(npm run test:*)",
      "mcp__xcodebuildmcp__*"
    ]
  }
}
```

---

## Phase 4: Documentation

### Create Integration Guide

**File:** `/docs/06-ios-xcodebuild-integration.md`

```markdown
# iOS Development with ClaudeKit

## Overview

ClaudeKit provides comprehensive iOS development support with:
- Unified `ios-developer` agent for all iOS tasks
- iOS-specific commands for common workflows
- XcodeBuildMCP integration for autonomous Xcode operations

## Installation

### 1. Install XcodeBuildMCP Server

```bash
# Claude Code CLI
claude mcp add XcodeBuildMCP npx xcodebuildmcp@latest

# Or manually in ~/.claude.json
{
  "mcpServers": {
    "XcodeBuildMCP": {
      "command": "npx",
      "args": ["-y", "xcodebuildmcp@latest"]
    }
  }
}
```

### 2. Configure Permissions

Add to `.claude/settings.json`:
```json
{
  "permissions": {
    "allow": ["mcp__xcodebuildmcp__*"]
  }
}
```

## Commands

### `/ios:cook` - Implement Features
```
/ios:cook add user profile screen with SwiftUI
```

### `/ios:test` - Run Tests
```
/ios:test --coverage
```

### `/ios:debug` - Debug Issues
```
/ios:debug app crashes on launch
```

### `/ios:sim` - Manage Simulators
```
/ios:sim --boot "iPhone 16 Pro"
```

## Features

### Development
- Swift 6 concurrency patterns
- SwiftUI + UIKit support
- MVVM and TCA architectures
- SwiftData persistence
- Async/await networking

### Testing
- XCTest unit tests
- XCUITest UI tests
- Coverage reporting
- Mock dependencies

### Build & Simulator
- Project discovery
- Build automation
- Simulator management
- Log capture

### UI Automation
- Element inspection (describe_ui)
- Tap, swipe, type interactions
- Screenshot capture
- Accessibility testing

## Requirements
- macOS 14.5+
- Xcode 16.x+
- Node.js 18.x+ (for XcodeBuildMCP)
```

---

## File Structure After Implementation

```
cli/
└── .claude/
    ├── agents/
    │   └── ios-developer.md          (unified, MCP-enhanced)
    ├── skills/
    │   └── ios-development/
    │       ├── development.md        (implementation patterns)
    │       ├── build.md              (build + simulator + MCP)
    │       └── tester.md             (testing patterns)
    └── settings.json                 (MCP permissions)

kits/default/.claude/
    ├── commands/
    │   └── ios/
    │       ├── cook.md               (ios-developer)
    │       ├── test.md               (ios-developer)
    │       ├── debug.md              (ios-developer)
    │       └── simulator.md          (ios-developer)
    └── skills/
        └── ios-development/
            ├── SKILL.md              (overview)
            ├── development.md
            ├── build.md
            └── tester.md
```

---

## Implementation Steps

### Phase 1: Agent & Skill Restructure (Steps 1-5)

1. **Create skills directories**
   ```bash
   mkdir -p cli/.claude/skills/ios-development
   mkdir -p kits/default/.claude/skills/ios-development
   ```

2. **Create skill files**
   - `cli/.claude/skills/ios-development/development.md`
   - `cli/.claude/skills/ios-development/build.md` (include MCP patterns)
   - `cli/.claude/skills/ios-development/tester.md` (include MCP test tools)
   - Copy to `kits/default/.claude/skills/ios-development/`

3. **Update SKILL.md** (in kits/default/.claude/skills/ios-development/)
   - Create overview that references the 3 sub-skills

4. **Create unified ios-developer agent**
   - Replace `/cli/.claude/agents/ios-developer.md`
   - Merge capabilities from all 3 agents
   - Add MCP tool references in frontmatter
   - Add MCP workflow patterns to content

5. **Remove old agents**
   - Delete `/cli/.claude/agents/ios-tester.md`
   - Delete `/cli/.claude/agents/ios-debugger.md`

### Phase 2: Create Commands (Steps 6-8)

6. **Create ios/ command directory**
   ```bash
   mkdir -p kits/default/.claude/commands/ios
   ```

7. **Create command files**
   - `ios/cook.md` (with MCP tools in frontmatter)
   - `ios/test.md` (with MCP tools in frontmatter)
   - `ios/debug.md` (with MCP tools in frontmatter)
   - `ios/simulator.md` (with MCP tools in frontmatter)

8. **Update settings.json files**
   - Create `/cli/.claude/settings.json` with MCP permissions
   - Update `/kits/default/.claude/settings.json` with MCP permissions

### Phase 3: Documentation (Step 9)

9. **Create documentation**
   - Create `/docs/06-ios-xcodebuild-integration.md`
   - Update CLAUDE.md with new agent structure
   - Update command count in project docs

### Phase 4: Testing (Step 10)

10. **Test implementation**
    - Verify each command works correctly
    - Test skill activation
    - Test unified agent with various iOS tasks
    - Test MCP integration (if XcodeBuildMCP installed)
    - Test fallback without MCP

---

## Files to Create

| File | Purpose |
|------|---------|
| `cli/.claude/skills/ios-development/development.md` | iOS development patterns |
| `cli/.claude/skills/ios-development/build.md` | Build + simulator + MCP patterns |
| `cli/.claude/skills/ios-development/tester.md` | Testing patterns + MCP test tools |
| `kits/default/.claude/skills/ios-development/development.md` | Copy of above |
| `kits/default/.claude/skills/ios-development/build.md` | Copy of above |
| `kits/default/.claude/skills/ios-development/tester.md` | Copy of above |
| `kits/default/.claude/skills/ios-development/SKILL.md` | Overview referencing sub-skills |
| `cli/.claude/agents/ios-developer.md` | Unified MCP-enhanced agent (replace) |
| `kits/default/.claude/commands/ios/cook.md` | iOS cook command |
| `kits/default/.claude/commands/ios/test.md` | iOS test command |
| `kits/default/.claude/commands/ios/debug.md` | iOS debug command |
| `kits/default/.claude/commands/ios/simulator.md` | iOS simulator command |
| `cli/.claude/settings.json` | MCP permissions and config |
| `docs/06-ios-xcodebuild-integration.md` | Integration documentation |

**Total: 15 files to create**

## Files to Modify

| File | Changes |
|------|---------|
| `kits/default/.claude/settings.json` | Add MCP permissions |
| `cli/CLAUDE.md` | Update agent structure documentation |

**Total: 2 files to modify**

## Files to Delete

| File | Reason |
|------|--------|
| `cli/.claude/agents/ios-tester.md` | Merged into unified agent |
| `cli/.claude/agents/ios-debugger.md` | Merged into unified agent |

**Total: 2 files to delete**

---

## XcodeBuildMCP Tools Reference

### Tool Categories

| Category | Tool Count | Key Tools |
|----------|-----------|-----------|
| Project Discovery | 5 | `discover_projs`, `list_schemes`, `show_build_settings` |
| Simulator | 12 | `build_sim`, `build_run_sim`, `boot_sim`, `install_app_sim` |
| Device | 7 | `build_device`, `install_app_device`, `launch_app_device` |
| UI Testing | 11 | `describe_ui`, `tap`, `swipe`, `type_text`, `screenshot` |
| Logging | 4 | `start_sim_log_cap`, `stop_sim_log_cap` |
| Testing | 3 | `test_sim`, `test_device`, `test_macos` |
| Swift Package | 6 | `swift_package_build`, `swift_package_test` |
| Utilities | 2 | `clean`, `doctor` |

### MCP Tool Naming Pattern

```
mcp__xcodebuildmcp__<tool-name>
```

Examples:
- `mcp__xcodebuildmcp__discover_projs`
- `mcp__xcodebuildmcp__build_sim`
- `mcp__xcodebuildmcp__test_sim`
- `mcp__xcodebuildmcp__describe_ui`

---

## Testing Checklist

- [ ] Skills created in both locations
- [ ] Unified agent follows iOS agent structure
- [ ] Agent frontmatter includes all required MCP tools
- [ ] settings.json files have correct permissions
- [ ] MCP server configuration is valid
- [ ] All 4 commands are discoverable and functional
- [ ] Documentation is complete
- [ ] Test with XcodeBuildMCP installed (if available)
- [ ] Test fallback without XcodeBuildMCP
- [ ] Verify old agents are deleted
- [ ] Test skill activation (development, build, tester)
- [ ] Test all 4 commands with various scenarios

---

## Complexity

**Medium-High** - This involves:
- Restructuring 3 agents into 1 unified agent
- Creating 3 new skill files (in 2 locations)
- Extracting and organizing patterns from existing agents
- Creating 4 new command files
- Integrating 83 MCP tools across agent and commands
- Configuring MCP server and permissions
- Progressive enhancement (MCP available vs unavailable)

---

## Migration Notes

### What Changes
- **3 agents → 1 agent** (ios-developer unified with MCP)
- **1 monolithic skill → 3 specialized skills** (development, build, tester)
- **All commands point to single agent** (ios-developer)
- **New: MCP integration** for autonomous Xcode operations

### What Stays The Same
- Command syntax: `/ios:cook`, `/ios:test`, `/ios:debug`, `/ios:sim`
- iOS development patterns (Swift 6, SwiftUI, XCTest)
- Skill activation (context-based, automatic)
- Agent structure (frontmatter, process sections)

### Backward Compatibility
- Any workflows referencing `ios-tester` or `ios-debugger` agents will need updating
- The unified `ios-developer` agent handles all previous capabilities
- MCP tools are optional - agent works with or without XcodeBuildMCP

---

## Dependencies

- **Existing ios-development skill** - Will be enhanced with 3 sub-skills
- **Existing agent structure** - Will be simplified
- **XcodeBuildMCP** - Optional but recommended
  - Installation: `claude mcp add XcodeBuildMCP npx xcodebuildmcp@latest`
  - GitHub: https://github.com/cameroncooke/XcodeBuildMCP
- **xcodebuild CLI** - macOS with Xcode required
- **xcrun simctl CLI** - macOS with Xcode required
- **Node.js 18.x+** - Required for XcodeBuildMCP

---

## References

- [XcodeBuildMCP GitHub](https://github.com/cameroncooke/XcodeBuildMCP)
- [XcodeBuildMCP Tools Reference](https://github.com/cameroncooke/XcodeBuildMCP/blob/master/docs/TOOLS.md)
- [Claude Code MCP Documentation](https://code.claude.com/docs/en/mcp)
- Existing agents: `/cli/.claude/agents/ios-*.md`
- Existing commands: `/kits/default/.claude/commands/core/*.md`

---

## Next Steps

Execute the plan:
```
/cook plans/ios-comprehensive-enhancement.md
```

This will:
1. Create the unified ios-developer agent with MCP integration
2. Create 3 specialized iOS development skills
3. Create 4 iOS-specific commands
4. Configure MCP permissions and server
5. Update documentation
6. Test the implementation
