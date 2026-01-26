---
title: iOS Cook
description: 👉👉👉 - Implement iOS features from plans or descriptions with Swift 6, iOS 18+, SwiftUI support
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

# iOS Cook Command

Implement iOS features from plans or descriptions. Supports Swift 6, iOS 18+, SwiftUI, and UIKit patterns.

## Usage
```
/ios:cook [plan file or description]
/ios:cook plans/240122-auth.md
/ios:cook add user profile screen with SwiftUI
```

## Your Process

1. **Parse Request**
   - Read plan file if provided
   - Understand feature requirements
   - Identify UI framework (SwiftUI default, UIKit when needed)

2. **Reference Development Skill**
   - Use `skills/ios-development/development.md` for patterns
   - Determine architecture (MVVM vs TCA based on complexity)

3. **Discover Project (MCP preferred)**
   - Use `mcp__xcodebuildmcp__discover_projs` if available
   - Fallback: Glob for `.xcodeproj`/`.xcworkspace`
   - Use `mcp__xcodebuildmcp__list_schemes` to identify schemes

4. **Implement in Order**
   - Create models (structs, @Model for SwiftData)
   - Create ViewModels with @Observable
   - Create views (SwiftUI or UIKit)
   - Implement networking with async/await
   - Write XCTest alongside code
   - Build and verify compilation (use MCP tools if available)

5. **Build Verification**
   - Use `mcp__xcodebuildmcp__build_sim` if MCP available
   - Fallback: xcodebuild command via Bash
   - Report any compilation errors

## Rules
- Default to SwiftUI for new code
- Use @Observable (iOS 17+) instead of ObservableObject
- Use async/await, not completion handlers
- Use MainActor for UI updates
- Write XCTest for new code
- Always use `describe_ui` before UI interactions (MCP)
- Run `doctor` when encountering unexpected errors (MCP)

## Completion Report

```markdown
## iOS Implementation Complete

### Files Created: X
- `Path/To/File.swift` - Description

### Architecture
- Pattern: MVVM/TCA/None
- UI Framework: SwiftUI/UIKit

### Tests Written: X
- XCTest files created
- All tests passing: ✓

### Build Verification
- Status: ✅ Success / ❌ Failed
- Errors: [if any]

### Next Steps
- [ ] Test on simulator
- [ ] Test on device
```
