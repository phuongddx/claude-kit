# iOS Development Patterns

## Purpose
Core iOS development patterns for Swift 6, iOS 18+, SwiftUI, UIKit implementation, and architecture patterns.

## When Active
- Implementing iOS features or components
- Questions about SwiftUI, UIKit, or iOS patterns
- iOS architecture discussions
- Writing Swift ViewModels or networking code

## Swift 6 Concurrency

### async/await Patterns
```swift
// Basic async function
func fetchProducts() async throws -> [Product] {
    let url = URL(string: "https://api.example.com/products")!
    let (data, _) = try await URLSession.shared.data(from: url)
    return try JSONDecoder().decode([Product].self, from: data)
}

// MainActor for UI updates
@MainActor
class ProductsViewModel {
    var products: [Product] = []

    func loadProducts() async {
        products = try await fetchProducts()
    }
}
```

### Sendable Protocol
```swift
// Thread-safe data transfer
struct Product: Sendable {
    let id: String
    let name: String
}

// Actor for thread-safe state
actor ProductCache {
    private var cache: [String: Product] = [:]

    func get(_ id: String) -> Product? {
        cache[id]
    }

    func set(_ product: Product) {
        cache[product.id] = product
    }
}
```

### Task Groups
```swift
func fetchMultipleData() async throws -> [Data] {
    try await withThrowingTaskGroup(of: Data.self) { group in
        group.addTask { try await self.fetch(url1) }
        group.addTask { try await self.fetch(url2) }

        var results: [Data] = []
        for try await data in group {
            results.append(data)
        }
        return results
    }
}
```

## SwiftUI vs UIKit Strategy

**Decision Tree:**
- New features → SwiftUI
- Complex custom views → UIKit
- Hybrid → UIHostingController/UIViewRepresentable

### SwiftUI Patterns
```swift
// @Observable (iOS 17+)
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

// View
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

## Architecture Patterns

### MVVM Decision
```
Simple app (<10 views) → No architecture
Medium app (10-50 views) → MVVM with @Observable
Large app (50+ views) → TCA (Composable Architecture)
```

### MVVM Example
```swift
@Observable
class LoginViewModel {
    var email = ""
    var password = ""
    var isLoading = false
    var errorMessage: String?

    private let authService: AuthService

    init(authService: AuthService = .shared) {
        self.authService = authService
    }

    func login() async {
        isLoading = true
        defer { isLoading = false }

        do {
            try await authService.login(email: email, password: password)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

struct LoginView: View {
    @State private var viewModel = LoginViewModel()

    var body: some View {
        Form {
            TextField("Email", text: $viewModel.email)
            SecureField("Password", text: $viewModel.password)
            Button("Login") {
                Task { await viewModel.login() }
            }
        }
    }
}
```

## Navigation

### NavigationStack
```swift
enum Route: Hashable {
    case product(Product)
    case settings
    case profile
}

struct AppView: View {
    @State private var path: [Route] = []

    var body: some View {
        NavigationStack(path: $path) {
            HomeView()
                .navigationDestination(for: Route.self) { route in
                    switch route {
                    case .product(let product):
                        ProductDetailView(product: product)
                    case .settings:
                        SettingsView()
                    case .profile:
                        ProfileView()
                    }
                }
        }
    }
}
```

### Sheet Presentations
```swift
struct ContentView: View {
    @State private var showingSheet = false
    @State private var sheetItem: Product?

    var body: some View {
        VStack {
            Button("Show Sheet") { showingSheet = true }
        }
        .sheet(isPresented: $showingSheet) {
            SheetView()
        }
        .sheet(item: $sheetItem) { product in
            ProductDetailView(product: product)
        }
        .presentationDetents([.medium, .large])
    }
}
```

## Networking

### URLSession with async/await
```swift
struct NetworkClient {
    static let shared = NetworkClient()

    private let decoder: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        return decoder
    }()

    func fetch<T: Decodable>(_ type: T.Type, from url: URL) async throws -> T {
        let (data, response) = try await URLSession.shared.data(from: url)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw NetworkError.invalidResponse
        }

        return try decoder.decode(T.self, from: data)
    }
}

// Usage
struct ProductService {
    func fetchProducts() async throws -> [Product] {
        let url = URL(string: "https://api.example.com/products")!
        return try await NetworkClient.shared.fetch([Product].self, from: url)
    }
}
```

### Environment-Aware Networking
```swift
enum Environment: String {
    case development
    case staging
    case production

    var baseURL: String {
        switch self {
        case .development: return "http://localhost:8080"
        case .staging: return "https://staging-api.example.com"
        case .production: return "https://api.example.com"
        }
    }

    static var current: Environment {
        #if DEBUG
        return .development
        #else
        return .production
        #endif
    }
}
```

## Persistence

### SwiftData (iOS 17+)
```swift
import SwiftData

@Model
final class Item {
    var timestamp: Date
    var title: String

    init(timestamp: Date, title: String) {
        self.timestamp = timestamp
        self.title = title
    }
}

struct AppView: View {
    var body: some View {
        ContentView()
            .modelContainer(for: Item.self)
    }
}
```

### AppStorage for Settings
```swift
struct SettingsView: View {
    @AppStorage("isDarkMode") private var isDarkMode = false
    @AppStorage("username") private var username = ""

    var body: some View {
        Form {
            Toggle("Dark Mode", isOn: $isDarkMode)
            TextField("Username", text: $username)
        }
    }
}
```

## Common UI Components

### List with Lazy Loading
```swift
struct LazyListView: View {
    @State private var items: [Item] = []

    var body: some View {
        List(items) { item in
            Text(item.title)
        }
        .task {
            await loadItems()
        }
    }

    func loadItems() async {
        for page in 0..<5 {
            let newItems = await fetchItems(page: page)
            items.append(contentsOf: newItems)
        }
    }
}
```

### Grid Layouts
```swift
struct GridView: View {
    let columns = [
        GridItem(.adaptive(minimum: 150), spacing: 16)
    ]

    var body: some View {
        ScrollView {
            LazyVGrid(columns: columns, spacing: 16) {
                ForEach(items) { item in
                    ItemCard(item: item)
                }
            }
            .padding()
        }
    }
}
```

### Form Validation
```swift
struct SignupForm: View {
    @State private var email = ""
    @State private var password = ""
    @State private var isValid = false

    var body: some View {
        Form {
            TextField("Email", text: $email)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()

            SecureField("Password", text: $password)

            Button("Sign Up") {
                // Handle signup
            }
            .disabled(!isValid)
        }
        .onChange(of: email) { _, _ in validate() }
        .onChange(of: password) { _, _ in validate() }
    }

    func validate() {
        isValid = !email.isEmpty && password.count >= 8
    }
}
```

## Debugging Patterns

### Common Issues

**SwiftUI State Not Updating**
```swift
// Issue: View not reflecting state changes
// Cause: Not using @Observable or incorrect property wrapper
// Fix: Use @Observable macro (iOS 17+)

@Observable
class ViewModel {
    var items: [Item] = []
}
```

**Retain Cycles**
```swift
// Issue: Memory leak, objects not deallocating
// Cause: Strong reference cycle in closures
// Fix: Use [weak self] in closures

Task { [weak self] in
    await self?.loadData()
}
```

**MainActor Checker Error**
```swift
// Issue: MainActor checker error
// Cause: Updating UI from background thread
// Fix: Mark function with @MainActor or await on main actor

@MainActor
func updateUI() {
    // UI updates here
}
```

## Rules

- Default to SwiftUI for new code
- Use @Observable (iOS 17+) instead of ObservableObject
- Use async/await, not completion handlers
- Use MainActor for UI updates
- Use value types (structs) by default
- Avoid force unwraps - use optional binding
- Use weak self in closures to avoid retain cycles
