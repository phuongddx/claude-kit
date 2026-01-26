# iOS Build & Simulator Management

## Purpose
Build systems, simulator management, Xcode workflows, and XcodeBuildMCP integration patterns.

## When Active
- Building iOS projects
- Managing simulators
- Xcode configuration issues
- Code signing problems
- Running tests via xcodebuild

## Xcode Project Structure

### Workspace vs Project
```
MyApp.xcworkspace       # Workspace (preferred for SPM dependencies)
├── MyApp.xcodeproj     # Project
└── Pods/               # CocoaPods (if used)

MyApp.xcodeproj         # Standalone project (simple apps)
```

### Schemes
```bash
# List available schemes
xcodebuild -list -project MyApp.xcodeproj
xcodebuild -list -workspace MyApp.xcworkspace

# Typical schemes:
# - MyApp (main app)
# - MyAppTests (unit tests)
# - MyAppUITests (UI tests)
```

## Build Commands

### Basic Build
```bash
# Build for simulator
xcodebuild -workspace MyApp.xcworkspace \
  -scheme MyApp \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 16 Pro'

# Build for device
xcodebuild -workspace MyApp.xcworkspace \
  -scheme MyApp \
  -sdk iphoneos \
  -configuration Release
```

### Build with Specific Configuration
```bash
# Debug configuration (default)
xcodebuild -scheme MyApp -configuration Debug

# Release configuration
xcodebuild -scheme MyApp -configuration Release
```

## Simulator Management

### xcrun simctl Commands

#### List Simulators
```bash
# List all available devices
xcrun simctl list devices available

# List only iPhone devices
xcrun simctl list devices available | grep "iPhone"

# List booted simulators
xcrun simctl list devices booted
```

#### Boot/Shutdown Simulator
```bash
# Boot simulator
xcrun simctl boot "iPhone 16 Pro"

# Shutdown simulator
xcrun simctl shutdown "iPhone 16 Pro"

# Shutdown all simulators
xcrun simctl shutdown all
```

#### Install/Launch App
```bash
# Install app on simulator
xcrun simctl install booted MyApp.app

# Launch app by bundle ID
xcrun simctl launch booted com.myapp.bundle

# Terminate app
xcrun simctl terminate booted com.myapp.bundle
```

#### Open Simulator
```bash
# Open Simulator app
open -a Simulator

# Open specific device
open -a Simulator --args -CurrentDeviceUDID <UDID>
```

#### Simulator Screenshots
```bash
# Take screenshot
xcrun simctl io booted screenshot screenshot.png

# Record video
xcrun simctl io booted recordVideo video.mp4
```

## XcodeBuildMCP Integration

### MCP Tool Patterns

When XcodeBuildMCP is available, use these patterns for autonomous Xcode operations:

#### Project Discovery
```swift
// Discover all projects in workspace
mcp__xcodebuildmcp__discover_projs({
  workspaceRoot: '.'
})

// List schemes for a project
mcp__xcodebuildmcp__list_schemes({
  projectPath: 'MyApp.xcodeproj'
})

// Show build settings
mcp__xcodebuildmcp__show_build_settings({
  projectPath: 'MyApp.xcodeproj',
  scheme: 'MyApp'
})

// Get app bundle ID
mcp__xcodebuildmcp__get_app_bundle_id({
  projectPath: 'MyApp.xcodeproj',
  scheme: 'MyApp'
})
```

#### Build for Simulator
```swift
// Build for simulator
mcp__xcodebuildmcp__build_sim({
  projectPath: 'MyApp.xcodeproj',
  scheme: 'MyApp',
  simulatorId: 'iPhone-16-Pro-UUID',
  configuration: 'Debug'
})

// Build and run for simulator
mcp__xcodebuildmcp__build_run_sim({
  projectPath: 'MyApp.xcodeproj',
  scheme: 'MyApp',
  simulatorId: 'iPhone-16-Pro-UUID'
})
```

#### Simulator Management
```swift
// List available simulators
mcp__xcodebuildmcp__list_sims()

// Boot simulator
mcp__xcodebuildmcp__boot_sim({
  simulatorId: 'iPhone-16-Pro-UUID'
})

// Open Simulator app
mcp__xcodebuildmcp__open_sim({
  simulatorId: 'iPhone-16-Pro-UUID'
})

// Install app on simulator
mcp__xcodebuildmcp__install_app_sim({
  simulatorId: 'iPhone-16-Pro-UUID',
  appPath: '/path/to/MyApp.app'
})

// Launch app on simulator
mcp__xcodebuildmcp__launch_app_sim({
  simulatorId: 'iPhone-16-Pro-UUID',
  bundleId: 'com.myapp.bundle'
})

// Stop app on simulator
mcp__xcodebuildmcp__stop_app_sim({
  simulatorId: 'iPhone-16-Pro-UUID',
  bundleId: 'com.myapp.bundle'
})

// Get app container path
mcp__xcodebuildmcp__get_sim_app_path({
  simulatorId: 'iPhone-16-Pro-UUID',
  bundleId: 'com.myapp.bundle'
})
```

#### UI Automation
```swift
// IMPORTANT: Always use describe_ui first - NEVER guess coordinates

// Describe UI hierarchy
mcp__xcodebuildmcp__describe_ui({
  simulatorId: 'iPhone-16-Pro-UUID'
})

// Tap at coordinates
mcp__xcodebuildmcp__tap({
  simulatorId: 'iPhone-16-Pro-UUID',
  x: 100,
  y: 200
})

// Swipe gesture
mcp__xcodebuildmcp__swipe({
  simulatorId: 'iPhone-16-Pro-UUID',
  startX: 150,
  startY: 300,
  endX: 150,
  endY: 100,
  duration: 200
})

// Type text
mcp__xcodebuildmcp__type_text({
  simulatorId: 'iPhone-16-Pro-UUID',
  text: 'Hello World'
})

// Press key
mcp__xcodebuildmcp__key_press({
  simulatorId: 'iPhone-16-Pro-UUID',
  key: 'return'
})

// Take screenshot
mcp__xcodebuildmcp__screenshot({
  simulatorId: 'iPhone-16-Pro-UUID',
  outputPath: '/path/to/screenshot.png'
})
```

#### Log Capture
```swift
// Start log capture
let sessionId = mcp__xcodebuildmcp__start_sim_log_cap({
  simulatorId: 'iPhone-16-Pro-UUID',
  bundleId: 'com.myapp.bundle'
})

// Perform actions...

// Stop log capture and get logs
let logs = mcp__xcodebuildmcp__stop_sim_log_cap({
  sessionId: sessionId
})
```

#### Testing
```swift
// Run tests on simulator
mcp__xcodebuildmcp__test_sim({
  projectPath: 'MyApp.xcodeproj',
  scheme: 'MyApp',
  simulatorId: 'iPhone-16-Pro-UUID'
})

// Run specific tests
mcp__xcodebuildmcp__test_sim({
  projectPath: 'MyApp.xcodeproj',
  scheme: 'MyApp',
  simulatorId: 'iPhone-16-Pro-UUID',
  onlyTesting: ['MyAppTests/ProductTests']
})

// Run tests on device
mcp__xcodebuildmcp__test_device({
  projectPath: 'MyApp.xcodeproj',
  scheme: 'MyApp',
  deviceId: 'device-udid'
})
```

#### Utilities
```swift
// Clean build folder
mcp__xcodebuildmcp__clean({
  projectPath: 'MyApp.xcodeproj',
  scheme: 'MyApp'
})

// Run diagnostics
mcp__xcodebuildmcp__doctor()

// Build Swift Package
mcp__xcodebuildmcp__swift_package_build({
  packagePath: '/path/to/package'
})

// Test Swift Package
mcp__xcodebuildmcp__swift_package_test({
  packagePath: '/path/to/package'
})
```

## Build Settings

### Common Build Settings
```bash
# Show all build settings
xcodebuild -scheme MyApp -showBuildSettings

# Show specific setting
xcodebuild -scheme MyApp -showBuildSettings | grep SWIFT_VERSION

# Common settings:
# - SWIFT_VERSION: Swift compiler version
# - IPHONEOS_DEPLOYMENT_TARGET: Minimum iOS version
# - DEVELOPMENT_TEAM: Team ID for code signing
# - BUNDLE_IDENTIFIER: App bundle ID
# - PRODUCT_BUNDLE_IDENTIFIER: Same as above
```

### Configuration Files

**xcconfig files** for custom build settings:
```ini
// Debug.xcconfig
SWIFT_OPTIMIZATION_LEVEL = -Onone
SWIFT_ACTIVE_COMPILATION_CONDITIONS = DEBUG

// Release.xcconfig
SWIFT_OPTIMIZATION_LEVEL = -O
SWIFT_ACTIVE_COMPILATION_CONDITIONS = RELEASE
```

## Code Signing

### Development vs Distribution
```bash
# Development (automatic for simulator)
# Device testing requires development certificate

# Distribution (App Store/TestFlight)
# Requires distribution certificate and provisioning profile
```

### Common Signing Issues
```
Issue: "No signing certificate found"
Fix: Add certificate in Xcode preferences → Accounts → Download Manual Profiles

Issue: "Provisioning profile doesn't include signing certificate"
Fix: Regenerate provisioning profile in Apple Developer Portal

Issue: "Bundle identifier differs from entitlement"
Fix: Match bundle ID in Xcode with Apple Developer Portal
```

## Swift Package Manager

### Package.swift Structure
```swift
// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "MyApp",
    platforms: [.iOS(.v17)],
    dependencies: [
        .package(url: "https://github.com/pointfreeco/swift-composable-architecture", from: "1.10.0")
    ],
    targets: [
        .target(
            name: "MyApp",
            dependencies: [
                .product(name: "ComposableArchitecture", package: "swift-composable-architecture")
            ]
        )
    ]
)
```

### Package Commands
```bash
# Build package
swift build

# Test package
swift test

# Resolve dependencies
swift package resolve

# Update dependencies
swift package update
```

## Dependency Management

### Swift Package Manager (SPM)
- Preferred for modern iOS projects
- Native to Xcode
- No additional setup required

### CocoaPods (Legacy)
```bash
# Install CocoaPods
sudo gem install cocoapods

# Create Podfile
pod init

# Install dependencies
pod install

# Update dependencies
pod update
```

**Sample Podfile:**
```ruby
platform :ios, '17.0'

target 'MyApp' do
  use_frameworks!
  pod 'Alamofire', '~> 5.8'
end
```

## Asset Catalogs

### Asset Organization
```
Assets.xcassets/
├── AppIcon.appiconset/
├── AccentColor.colorset/
├── Colors/
│   ├── Primary.colorset/
│   └── Secondary.colorset/
└── Images/
    ├── Logo.imageset/
    └── Banner.imageset/
```

### Color Assets
```swift
// Use color assets in code
struct ContentView: View {
    var body: some View {
        Text("Hello")
            .foregroundStyle(.primary) // From AccentColor.colorset
    }
}
```

## Build Optimization

### Build Time Optimization
```bash
# Use build cache
defaults write com.apple.dt.Xcode BuildSystemScheduleInherentlyParallelCommandsEnabled -bool YES

# Increase parallel build count
defaults write com.apple.dt.Xcode IBSCooperateWithFrameworkFinderDiagnostics -bool YES

# Use precompiled headers
# Add in Build Settings: Precompile Prefix Header = YES
```

### App Size Optimization
```
1. Enable app thinning
2. Use asset catalogs (not individual images)
3. Remove unused code
4. Use bitcode (deprecated in Xcode 14+)
5. Optimize images (use PNGs for vectors, WebP for photos)
```

## Common Build Errors

### "No such module"
```
Cause: Package not resolved or imported incorrectly
Fix: File → Packages → Reset Package Caches, then clean build
```

### "Command CompileSwift failed"
```
Cause: Syntax error or compiler bug
Fix: Check Swift syntax, clean build folder (Cmd+Shift+K)
```

### "Code signing error"
```
Cause: Certificate or provisioning profile issue
Fix: Add account in Xcode preferences, download certificates
```

### "Provisioning profile doesn't include signing certificate"
```
Cause: Mismatch between certificate and profile
Fix: Regenerate provisioning profile in developer portal
```

## Rules

- Always use `describe_ui` before UI interactions (MCP)
- Prefer `_ws` tools for projects with dependencies (MCP)
- Use simulator for faster iteration, device only for final validation
- Run `doctor` when encountering unexpected errors (MCP)
- Cache project discovery results to avoid repeated scans (MCP)
- Test on multiple iOS versions and device sizes
- Use xcworkspace when using SPM dependencies
- Don't add backward compatibility
