# iOS Development Skill

## Purpose
Modern iOS development (Swift 6, iOS 18+, SwiftUI, UIKit) with XcodeBuildMCP integration for autonomous Xcode operations.

## When Active
User mentions iOS, Swift, SwiftUI, UIKit, iPhone app, iPad app, or iOS-specific commands.

## Specialized Sub-Skills

This skill includes 3 specialized sub-skills for different iOS development aspects:

### 1. Development Patterns
Reference: `skills/ios-development/development.md`

- Swift 6 concurrency (async/await, Sendable, Actors)
- SwiftUI vs UIKit strategy
- Architecture patterns (MVVM, TCA)
- State management (@Observable, property wrappers)
- NavigationStack implementation
- Networking with URLSession
- Persistence (SwiftData, Core Data)
- Common UI components (List, Grid, Sheet, Form)
- Debugging patterns

### 2. Build & Simulator Management
Reference: `skills/ios-development/build.md`

- Xcode project configuration
- Build settings and schemes
- Swift Package Manager
- Dependency management (SPM, CocoaPods)
- Asset catalogs and resources
- Code signing and provisioning
- Build optimization
- Simulator management (xcrun simctl + XcodeBuildMCP)
- Common build errors and fixes
- MCP tool patterns (discover_projs, list_schemes, build_sim, etc.)

### 3. Testing Strategies
Reference: `skills/ios-development/tester.md`

- XCTest patterns (unit tests)
- XCUITest patterns (UI tests)
- Mock dependencies setup
- Given-When-Then structure
- Async/await testing
- Coverage goals and reporting
- Test organization
- Accessibility identifiers for UI testing
- MCP test automation (test_sim, test_device)

## XcodeBuildMCP Integration

When XcodeBuildMCP is available, this skill provides autonomous Xcode operations:

### MCP Capabilities
- **Project Discovery**: Auto-discover projects and schemes
- **Build Automation**: Build for simulator, device, or macOS
- **Simulator Management**: Boot, install, launch, stop apps
- **Testing**: Run XCTest/XCUITest suites
- **UI Automation**: Tap, swipe, type, screenshot
- **Log Capture**: Stream simulator/device logs
- **Environment Validation**: Run diagnostics

### Prerequisites
- macOS 14.5+ with Xcode 16.x+
- XcodeBuildMCP server: `claude mcp add XcodeBuildMCP npx xcodebuildmcp@latest`

## Expertise

### Swift 6 Concurrency
- async/await patterns
- Sendable protocol
- Actors for thread-safety
- Task cancellation
- Structured concurrency

### SwiftUI vs UIKit
- SwiftUI for new features
- UIKit for complex views
- SwiftUI/UIKit interoperability
- UIViewRepresentable/UIViewControllerRepresentable

### Architecture
- MVVM pattern
- The Composable Architecture (TCA)
- State management with @Observable
- Dependency injection

### Navigation
- NavigationStack (iOS 16+)
- NavigationPath
- Sheet presentations
- Full-screen covers

### Networking
- async URLSession
- Codable for JSON
- Error handling
- Retry logic

### Persistence
- SwiftData (iOS 17+)
- Core Data fallback
- UserDefaults for simple data
- Keychain for secrets

### Testing
- XCTest for unit tests
- XCUITest for UI tests
- Mocking dependencies
- Test doubles

### Performance
- Instruments profiling
- Memory management
- Drawing optimization
- Lazy loading

## Patterns

### @Observable (iOS 17+)
```swift
@Observable
class ProductsViewModel {
    var products: [Product] = []
    var isLoading = false

    func loadProducts() async {
        isLoading = true
        defer { isLoading = false }
        products = try await productService.fetch()
    }
}
```

### NavigationStack
```swift
enum Route: Hashable {
    case product(Product)
    case settings
}

struct AppView: View {
    @State private var path: [Route] = []

    var body: some View {
        NavigationStack(path: $path) {
            HomeView()
                .navigationDestination(for: Route.self) { route in
                    // route handling
                }
        }
    }
}
```

### Actor for Thread-Safety
```swift
actor NetworkManager {
    func fetch(_ url: URL) async throws -> Data {
        // Thread-safe networking
    }
}
```

## MCP Workflow Examples

### Build for Simulator
```swift
// MCP approach:
mcp__xcodebuildmcp__discover_projs({ workspaceRoot: '.' })
mcp__xcodebuildmcp__list_schemes({ workspacePath: 'MyApp.xcworkspace' })
mcp__xcodebuildmcp__build_sim({
  workspacePath: 'MyApp.xcworkspace',
  scheme: 'MyApp',
  simulatorId: 'iPhone-16-Pro-UUID'
})
```

### Run Tests
```swift
mcp__xcodebuildmcp__test_sim({
  projectPath: 'MyApp.xcodeproj',
  scheme: 'MyApp',
  simulatorId: 'UUID'
})
```

### UI Automation
```swift
// IMPORTANT: Always use describe_ui first
mcp__xcodebuildmcp__describe_ui({ simulatorId: 'UUID' })
// Then parse UI hierarchy and interact
mcp__xcodebuildmcp__tap({ simulatorId: 'UUID', x: 100, y: 200 })
```

## Tech Stack
- iOS 18+ SDK, Swift 6.0+
- SwiftUI (primary), UIKit (fallback)
- SwiftData for persistence
- XCTest/XCUITest for testing
- XcodeBuildMCP for automation (optional)
