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
