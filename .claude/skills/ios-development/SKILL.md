# iOS Development Skill

## Purpose
Modern iOS development (Swift 6, iOS 18+, SwiftUI, UIKit).

## When Active
User mentions iOS, Swift, SwiftUI, UIKit, iPhone app, iPad app.

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

## Tech Stack
- iOS 18+ SDK, Swift 6.0+
- SwiftUI (primary), UIKit (fallback)
- SwiftData for persistence
- XCTest/XCUITest for testing
