# iOS Testing Strategies

## Purpose
Testing strategies for iOS apps including XCTest, XCUITest, mocking, and XcodeBuildMCP test automation.

## When Active
- Writing iOS tests
- Running test suites
- Analyzing test coverage
- Debugging test failures

## Test Types

### XCTest (Unit Tests)
Tests individual functions, classes, and methods in isolation.

### XCUITest (UI Tests)
Tests user interactions and flows through the app interface.

## XCTest Patterns

### Basic Unit Test
```swift
import XCTest
@testable import YourApp

final class ProductsViewModelTests: XCTestCase {
    var viewModel: ProductsViewModel!
    var mockService: MockProductService!

    override func setUp() {
        super.setUp()
        mockService = MockProductService()
        viewModel = ProductsViewModel(productService: mockService)
    }

    override func tearDown() {
        viewModel = nil
        mockService = nil
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
```

### Mock Dependencies
```swift
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

class MockNetworkClient: NetworkClient {
    var dataToReturn: Data?
    var errorToThrow: Error?

    override func fetch<T: Decodable>(_ type: T.Type, from url: URL) async throws -> T {
        if let error = errorToThrow {
            throw error
        }
        let data = dataToReturn ?? Data()
        return try JSONDecoder().decode(T.self, from: data)
    }
}
```

### Given-When-Then Structure
```swift
func testLoginWithValidCredentials_Success() async throws {
    // Given
    let viewModel = LoginViewModel(authService: MockAuthService())
    viewModel.email = "test@example.com"
    viewModel.password = "password123"

    // When
    await viewModel.login()

    // Then
    XCTAssertTrue(viewModel.isLoggedIn)
    XCTAssertNil(viewModel.errorMessage)
}
```

### Async Testing
```swift
func testAsyncOperation() async throws {
    // Given
    let viewModel = ProductsViewModel()

    // When
    await viewModel.loadProducts()

    // Then (automatically waits for async completion)
    XCTAssertFalse(viewModel.products.isEmpty)
}

func testAsyncThrows() async throws {
    // Given
    let service = ProductService()
    let invalidURL = URL(string: "invalid")!

    // When/Then
    XCTAssertThrowsError(
        try await service.fetch(from: invalidURL)
    )
}
```

### Performance Testing
```swift
func testPerformanceOfProductParsing() {
    let jsonData = largeProductJSONData

    measure {
        // Measure time to decode products
        _ = try? JSONDecoder().decode([Product].self, from: jsonData)
    }
}
```

## XCUITest Patterns

### Basic UI Test
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

    func testLoginWithInvalidCredentials_ShowsError() {
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

### Accessibility Identifiers
```swift
// In SwiftUI views
struct LoginView: View {
    @State private var email = ""
    @State private var password = ""

    var body: some View {
        Form {
            TextField("Email", text: $email)
                .accessibilityIdentifier("EmailField")

            SecureField("Password", text: $password)
                .accessibilityIdentifier("PasswordField")

            Button("Login") {
                // Handle login
            }
            .accessibilityIdentifier("LoginButton")
        }
    }
}
```

### UI Test Queries
```swift
// Find elements by identifier
let button = app.buttons["SubmitButton"]

// Find by text
let label = app.staticTexts["Welcome"]

// Find by type
let textFields = app.textFields

// Chain queries
let cell = app.tables.firstMatch.cells.firstMatch

// Wait for existence
XCTAssertTrue(button.waitForExistence(timeout: 5))

// Check if exists
if app.alerts.firstMatch.exists {
    // Handle alert
}
```

### Gestures in UI Tests
```swift
// Tap
app.buttons["Submit"].tap()

// Swipe
app.tables.firstMatch.cells.firstMatch.swipeUp()

// Scroll
app.scrollViews.firstMatch.scrollToElement()

// Long press
app.buttons["Button"].press(forDuration: 1.0)
```

## Test Organization

### Recommended Structure
```
Tests/
├── UnitTests/
│   ├── ViewModels/
│   │   ├── ProductsViewModelTests.swift
│   │   └── LoginViewModelTests.swift
│   ├── Services/
│   │   ├── NetworkClientTests.swift
│   │   └── AuthServiceTests.swift
│   ├── Models/
│   │   └── ProductTests.swift
│   └── Utils/
│       └── ExtensionsTests.swift
├── UITests/
│   ├── Flows/
│   │   ├── LoginFlowUITests.swift
│   │   └── CheckoutFlowUITests.swift
│   └── Components/
│       └── ProductCellUITests.swift
└── Mocks/
    ├── MockAuthService.swift
    ├── MockNetworkClient.swift
    └── TestHelpers.swift
```

## Running Tests

### Command Line
```bash
# Run all tests
xcodebuild test -project MyApp.xcodeproj -scheme MyApp -destination 'platform=iOS Simulator,name=iPhone 16 Pro'

# Run specific test
xcodebuild test -project MyApp.xcodeproj -scheme MyApp -destination 'platform=iOS Simulator,name=iPhone 16 Pro' -only-testing:MyAppTests/ProductsViewModelTests

# Run without building
xcodebuild test -project MyApp.xcodeproj -scheme MyApp -destination 'platform=iOS Simulator,name=iPhone 16 Pro' -testPlan MyAppTestPlan test-without-building
```

### XcodeBuildMCP Test Automation
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

// Run macOS tests
mcp__xcodebuildmcp__test_macos({
  projectPath: 'MyApp.xcodeproj',
  scheme: 'MyApp'
})
```

## Coverage Goals

### Minimum Coverage Targets
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 90%+

### Coverage Reports
```bash
# Generate coverage report
xcodebuild test -scheme MyApp -enableCodeCoverage YES

# View in Xcode
# Product → Test Report → Coverage tab

# Export coverage
xcrun llvm-cov report \
  ~/Library/Developer/Xcode/DerivedData/*/Build/Products/Debug-iphonesimulator/MyApp.app/Contents/MacOS/MyApp \
  -instr-profile=~/Library/Developer/Xcode/DerivedData/*/Logs/Test/*.xcresult \
  --format=html
```

## Test Best Practices

### Unit Test Rules
- Write clear test names: `testFeature_ExpectedBehavior`
- Use Given-When-Then structure
- Mock external dependencies
- Test error cases explicitly
- Test one thing per test
- Use descriptive assertion messages

```swift
func testLoadProducts_WhenNetworkFails_ShowsErrorMessage() async throws {
    // Given
    mockService.shouldThrowError = true
    viewModel = ProductsViewModel(service: mockService)

    // When
    await viewModel.loadProducts()

    // Then
    XCTAssertNotNil(viewModel.errorMessage, "Error message should be set when network fails")
}
```

### UI Test Rules
- Use accessibility identifiers (not UI strings)
- Set `continueAfterFailure = false`
- Test user flows, not implementation
- Use explicit waits
- Avoid hard-coded delays

```swift
// Bad: Hard-coded delay
sleep(5)

// Good: Explicit wait
XCTAssertTrue(label.waitForExistence(timeout: 5))
```

### Mock Rules
- Keep mocks simple
- Override only what's needed
- Use base class/protocol when possible
- Document mock behavior
- Clean up in tearDown

## Common Test Issues

### Async Test Timeout
```
Issue: Test times out waiting for async operation
Fix: Use XCTestExpectation or ensure function is marked async
```

### UI Test Flakiness
```
Issue: Test passes locally but fails in CI
Fix: Use explicit waits, check element exists before interaction
```

### Mock Not Working
```
Issue: Real service being called instead of mock
Fix: Verify dependency injection, check protocol conformance
```

## Rules

- Write tests alongside code
- Aim for 80%+ code coverage
- Mock external dependencies
- Use accessibility identifiers for UI tests
- Test error cases explicitly
- Don't test implementation details
- Set `continueAfterFailure = false` in UI tests
- Use Given-When-Then structure
