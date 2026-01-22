# iOS Development Skill

## Purpose
Expert guidance for modern iOS development (2025-2026) covering SwiftUI, UIKit, Swift 6 concurrency, architecture patterns, networking, testing, and performance optimization. Enables building production-ready iOS apps with current best practices.

## When Active
- User asks about iOS development, SwiftUI, UIKit, or Swift programming
- Questions about iOS architecture, state management, or design patterns
- Topics related to iOS testing, performance, or networking
- Requesting code examples for iOS features or components
- Discussing iOS APIs, frameworks, or development tools

## Expertise

### Modern iOS Stack (iOS 18+, Swift 6)

**SwiftUI vs UIKit Strategy**
- **Default to SwiftUI** for new features and apps (iOS 17+)
- **Use UIKit** when: specific UI components unavailable in SwiftUI, complex gesture handling, legacy integration
- **Hybrid approach**: UIHostingController for SwiftUI in UIKit, UIViewRepresentable for UIKit in SwiftUI
- Progressive adoption: add SwiftUI features to UIKit codebase incrementally

**Swift 6 Language Features**
```swift
// Swift 6 Concurrency - Sendable protocol
actor NetworkManager {
    private var cache: [String: Data] = [:]

    func fetch(_ url: URL) async throws -> Data {
        if let cached = cache[url.absoluteString] {
            return cached
        }
        let data = try await URLSession.shared.data(from: url).0
        cache[url.absoluteString] = data
        return data
    }
}

// MainActor for UI updates
@MainActor
class ViewModel: ObservableObject {
    @Published var data: String = ""

    func loadData() async {
        // Automatically on main thread
        data = await fetchFromAPI()
    }
}

// Task Groups for concurrent operations
func fetchMultipleData() async throws -> [Data] {
    try await withThrowingTaskGroup(of: Data.self) { group in
        group.addTask { try await self.fetch(url1) }
        group.addTask { try await self.fetch(url2) }
        group.addTask { try await self.fetch(url3) }

        var results: [Data] = []
        for try await data in group {
            results.append(data)
        }
        return results
    }
}
```

**iOS 18+ Features**
- NavigationStack/NavigationSplitView for data-driven navigation
- @Observable macro (iOS 17+) replacing ObservableObject
- SwiftData for persistence (iOS 17+)
- Enhanced widgets and Live Activities
- Sheet presentations with improved detents
- Grid layouts with LazyGrid

### Architecture Patterns

**SwiftUI Architecture Decision Tree**
```
Simple app (<10 views) → No architecture needed
Medium app (10-50 views) → MVVM or Redux-like (TCA)
Large app (50+ views) → TCA or MVVM with Coordinators
Team-based → TCA for consistency and testability
```

**MVVM for SwiftUI (Simplified)**
```swift
// ViewModel with @Observable (iOS 17+)
@Observable
class ProductsViewModel {
    var products: [Product] = []
    var isLoading = false
    var errorMessage: String?

    private let productService: ProductService

    init(productService: ProductService = .shared) {
        self.productService = productService
    }

    func loadProducts() async {
        isLoading = true
        defer { isLoading = false }

        do {
            products = try await productService.fetchProducts()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

// View consumption
struct ProductsView: View {
    @State private var viewModel = ProductsViewModel()

    var body: some View {
        List(viewModel.products) { product in
            Text(product.name)
        }
        .task {
            await viewModel.loadProducts()
        }
    }
}
```

**The Composable Architecture (TCA) Pattern**
```swift
import ComposableArchitecture

@Reducer
struct CounterFeature {
    @ObservableState
    struct State: Equatable {
        var count = 0
    }

    enum Action: BindableAction {
        case binding(BindingAction<State>)
        case decrementButtonTapped
        case incrementButtonTapped
    }

    var body: some ReducerOf<Self> {
        BindingReducer()
        Reduce { state, action in
            switch action {
            case .binding:
                return .none
            case .decrementButtonTapped:
                state.count -= 1
                return .none
            case .incrementButtonTapped:
                state.count += 1
                return .none
            }
        }
    }
}

struct CounterView: View {
    @Bindable var store: StoreOf<CounterFeature>

    var body: some View {
        VStack {
            Text("\(store.state.count)")
            Button("Increment") { store.send(.incrementButtonTapped) }
            Button("Decrement") { store.send(.decrementButtonTapped) }
        }
    }
}
```

**Navigation with Navigator Pattern**
```swift
enum Route: Hashable {
    case product(Product)
    case category(Category)
    case settings
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
                    case .category(let category):
                        CategoryView(category: category)
                    case .settings:
                        SettingsView()
                    }
                }
        }
    }
}
```

### State Management

**Property Wrapper Decision Guide**
```swift
// @State - Local view state
@State private var isOn = false

// @Binding - Child needs to modify parent state
@Binding var isEnabled: Bool

// @StateObject - Owns ObservableObject (use in parent)
@StateObject private var viewModel = ProductsViewModel()

// @ObservedObject - Observes object owned elsewhere
@ObservedObject var viewModel: ProductsViewModel

// @Observable (iOS 17+) - Preferred new way
@Observable class ViewModel {
    var items: [Item] = []
}

// @Environment - App-wide dependencies
@Environment(\.colorScheme) var colorScheme
```

**Best Practices**
- Use `@State` for simple local state (toggles, text fields)
- Use `@Observable` (iOS 17+) instead of ObservableObject for complex state
- Use `@StateObject` to own view models in parent views
- Use `@Binding` only when child needs to modify parent state
- Avoid `@ObservedObject` in favor of `@Observable`
- Keep state as low in view hierarchy as possible

### Common UI Components

**NavigationStack Pattern**
```swift
struct MasterDetailView: View {
    @State private var selectedProduct: Product?
    @State private var path: [Product] = []

    var body: some View {
        NavigationStack(path: $path) {
            List(products) { product in
                NavigationLink(value: product) {
                    ProductRow(product: product)
                }
            }
            .navigationDestination(for: Product.self) { product in
                ProductDetailView(product: product)
            }
            .navigationTitle("Products")
        }
    }
}
```

**Sheet Presentations**
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
        .presentationDragIndicator(.visible)
    }
}
```

**List with Lazy Loading**
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
        // Load in batches
        for page in 0..<5 {
            let newItems = await fetchItems(page: page)
            items.append(contentsOf: newItems)
        }
    }
}
```

**Grid Layouts**
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

**Form Validation**
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

### Networking & Data

**Modern URLSession with Async/Await**
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

**Environment-Aware Networking**
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

struct APIConfig {
    var baseURL: String { Environment.current.baseURL }
}
```

**Combine for Reactive Streams**
```swift
import Combine

class SearchViewModel: ObservableObject {
    @Published var searchResults: [Result] = []
    @Published var searchText = ""
    private var cancellables = Set<AnyCancellable>()

    private let searchService: SearchService

    init(searchService: SearchService = .shared) {
        self.searchService = searchService

        $searchText
            .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
            .removeDuplicates()
            .flatMap { query in
                self.searchService.search(query)
                    .catch { _ in Just([]) }
            }
            .assign(to: &$searchResults)
    }
}
```

**Data Persistence Choices**
```swift
// SwiftData (iOS 17+) - Preferred for new apps
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

// AppStorage for simple settings
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

// Core Data for complex schemas or pre-iOS 17 support
// Use NSPersistentContainer with Swift 6 concurrency
```

**Persistence Decision Tree**
```
Simple key-value settings → @AppStorage
Per-view state restoration → @SceneStorage
Complex object graph (iOS 17+) → SwiftData
Large datasets, pre-iOS 17 → Core Data
Simple file storage → FileManager + Codable
```

### Testing

**XCTest Best Practices**
```swift
import XCTest

@testable import YourApp

final class ProductViewModelTests: XCTestCase {
    var viewModel: ProductsViewModel!
    var mockService: MockProductService!

    override func setUp() {
        super.setUp()
        mockService = MockProductService()
        viewModel = ProductsViewModel(productService: mockService)
    }

    override func tearDown() {
        viewModel = nil
        mockService = MockProductService()
        super.tearDown()
    }

    func testLoadProducts_Success() async throws {
        // Given
        let expectedProducts = [
            Product(id: "1", name: "Product 1"),
            Product(id: "2", name: "Product 2")
        ]
        mockService.productsToReturn = expectedProducts

        // When
        await viewModel.loadProducts()

        // Then
        XCTAssertEqual(viewModel.products, expectedProducts)
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.errorMessage)
    }

    func testLoadProducts_Failure() async {
        // Given
        mockService.shouldThrowError = true

        // When
        await viewModel.loadProducts()

        // Then
        XCTAssertTrue(viewModel.products.isEmpty)
        XCTAssertNotNil(viewModel.errorMessage)
        XCTAssertFalse(viewModel.isLoading)
    }
}

// Mock dependency
class MockProductService: ProductService {
    var productsToReturn: [Product] = []
    var shouldThrowError = false

    override func fetchProducts() async throws -> [Product] {
        if shouldThrowError {
            throw NetworkError.fetchFailed
        }
        return productsToReturn
    }
}
```

**XCUITest Patterns**
```swift
final class LoginFlowUITests: XCTestCase {
    var app: XCUIApplication!

    override func setUp() {
        super.setUp()
        continueAfterFailure = false
        app = XCUIApplication()
        app.launchArguments = ["--uitesting"]
        app.launch()
    }

    func testSuccessfulLogin() {
        // Given
        let emailField = app.textFields["EmailField"]
        let passwordField = app.secureTextFields["PasswordField"]
        let loginButton = app.buttons["LoginButton"]

        // When
        emailField.tap()
        emailField.typeText("test@example.com")

        passwordField.tap()
        passwordField.typeText("password123")

        loginButton.tap()

        // Then
        XCTAssertTrue(app.staticTexts["WelcomeLabel"].waitForExistence(timeout: 5))
    }

    func testLoginWithInvalidCredentials() {
        // Given
        let emailField = app.textFields["EmailField"]
        let passwordField = app.secureTextFields["PasswordField"]
        let loginButton = app.buttons["LoginButton"]

        // When
        emailField.tap()
        emailField.typeText("invalid@example.com")

        passwordField.tap()
        passwordField.typeText("wrong")

        loginButton.tap()

        // Then
        XCTAssertTrue(app.alerts["ErrorAlert"].waitForExistence(timeout: 2))
    }
}
```

**Test Organization**
```
Tests/
├── UnitTests/
│   ├── ViewModels/
│   │   ├── ProductsViewModelTests.swift
│   │   └── ProfileViewModelTests.swift
│   ├── Services/
│   │   ├── NetworkClientTests.swift
│   │   └── ProductServiceTests.swift
│   └── Models/
│       └── ProductTests.swift
├── IntegrationTests/
│   └── APIServiceIntegrationTests.swift
└── UITests/
    ├── Flows/
    │   ├── LoginFlowUITests.swift
    │   └── CheckoutFlowUITests.swift
    └── Components/
        └── ProductCellUITests.swift
```

### Performance & Best Practices

**Memory Management**
```swift
// Use weak self to avoid retain cycles
class ViewModel {
    var cancellables = Set<AnyCancellable>()

    func fetchData() {
        service.fetchData()
            .sink { [weak self] value in
                self?.data = value
            }
            .store(in: &cancellables)
    }
}

// Avoid strong reference cycles in closures
Task { [weak self] in
    await self?.loadData()
}

// Use value types (structs) by default
struct Product {
    let id: String
    let name: String
}

// Use classes only when needed (identity, inheritance)
class ProductManager {
    // ...
}
```

**Instruments Usage**
- Use Time Profiler to identify CPU bottlenecks
- Use Allocations to detect memory leaks and high memory usage
- Use Leaks instrument to find retain cycles
- Use Network profiler to analyze network requests
- Use Core Animation to detect dropped frames

**Performance Checklist**
- [ ] Avoid force unwraps (!) - use optional binding
- [ ] Use lazy loading for large lists (LazyVStack/LazyHStack)
- [ ] Cache expensive computations
- [ ] Use Instruments to profile before optimizing
- [ ] Avoid main thread blocking - move heavy work to background
- [ ] Use proper image sizes and formats
- [ ] Enable app thinning (asset catalogs, bitcode)

**App Lifecycle Best Practices**
```swift
@main
struct AppDelegate: App {
    @State private var dataController = DataController()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, dataController.container.viewContext)
                .onAppear {
                    // Handle app launch
                }
        }
        .onChange(of: scenePhase) { _, phase in
            switch phase {
            case .active:
                // App became active
                handleAppBecameActive()
            case .inactive:
                // App is inactive
                handleAppInactive()
            case .background:
                // App entered background
                handleAppBackground()
            @unknown default:
                break
            }
        }
    }
}
```

### Swift Package Manager & Dependencies

**Popular iOS Libraries (2025)**
- **Networking**: Alamofire (mature), async-network-library (modern)
- **UI Components**: SwiftUIX (extended components)
- **Code Generation**: SwiftGen (type-safe resources)
- **Architecture**: TCA (Composable Architecture)
- **Testing**: Mockingbird, Cuckoo
- **Storage**: SwiftData, Realm, GRDB

**Package.swift Example**
```swift
// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "YourApp",
    platforms: [.iOS(.v17)],
    dependencies: [
        .package(url: "https://github.com/pointfreeco/swift-composable-architecture", from: "1.10.0"),
        .package(url: "https://github.com/SwiftGen/SwiftGenPlugin", from: "6.6.0")
    ],
    targets: [
        .executableTarget(
            name: "YourApp",
            dependencies: [
                .product(name: "ComposableArchitecture", package: "swift-composable-architecture")
            ]
        )
    ]
)
```

## Dependencies

**Required Tools**
- Xcode 16.0+
- iOS 18+ SDK
- Swift 6.0+

**Recommended Tools**
- SwiftLint for code linting
- SwiftFormat for code formatting
- Periphery for unused code detection
- XcodeGen for project generation
- CocoaPods or SPM for dependency management

**Testing Tools**
- XCTest (built-in)
- XCUITest (built-in)
- Maestro for E2E testing
- Mockingbird for mocking

## References

**Apple Documentation**
- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui)
- [iOS & iPadOS 18 Release Notes](https://developer.apple.com/documentation/ios-ipados-release-notes/ios-ipados-18-release-notes)
- [Swift Concurrency](https://docs.swift.org/swift-book/LanguageGuide/Concurrency.html)
- [SwiftData Documentation](https://developer.apple.com/documentation/swiftdata)

**Community Resources**
- [Swift by Sundell](https://www.swiftbysundell.com/) - In-depth Swift/SwiftUI articles
- [Hacking with Swift](https://www.hackingwithswift.com) - Tutorials and examples
- [Point-Free](https://www.pointfree.co) - TCA and advanced Swift patterns
- [Swift Pal](https://swift-pal.com) - Modern SwiftUI guides

**Open Source Repositories**
- [The Composable Architecture](https://github.com/pointfreeco/swift-composable-architecture) - Redux-like architecture
- [SwiftUIX](https://github.com/SwiftUIX/SwiftUIX) - Extended SwiftUI components
- [Alamofire](https://github.com/Alamofire/Alamofire) - Elegant HTTP networking
- [SwiftGen](https://github.com/SwiftGen/SwiftGen) - Code generation for resources

**Key Articles & Guides**
- "SwiftUI in 2025: Forget MVVM" by Thomas Ricouard
- "Swift 6 Concurrency: A Practical Guide" by Gaurav Parmar
- "Mastering NavigationStack in SwiftUI" by Majid Jabrayilov
- "SwiftUI Data Persistence in 2025" by Karan Pal

**Version Requirements**
- Swift 6.0+ for full concurrency support
- iOS 17+ for @Observable and SwiftData
- iOS 18+ for latest SwiftUI features
- Xcode 16.0+ for Swift 6 toolchain
