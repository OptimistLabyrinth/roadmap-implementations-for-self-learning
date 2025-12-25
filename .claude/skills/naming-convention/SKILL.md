---
name: naming-convention
description: Apply language-specific naming conventions and best practices. Use when user asks about naming, variable names, function names, class names, file names, or mentions conventions, naming standards, or code style for identifiers.
allowed-tools: Read, Grep, Glob, WebSearch, WebFetch
---

# Naming Convention

## Purpose

Ensure consistent, language-appropriate naming conventions across the codebase following established best practices for each programming language.

## General Principles

1. **Clarity over brevity** - Names should be self-documenting
2. **Consistency** - Follow the same pattern throughout the codebase
3. **Intentional** - Names should reveal intent, not implementation
4. **Searchable** - Avoid single letters except in small scopes

## Language-Specific Conventions

### JavaScript / TypeScript

| Element | Convention | Example |
|---------|------------|---------|
| Variables | camelCase | `userName`, `isActive` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| Functions | camelCase | `calculateTotal()`, `fetchUserData()` |
| Classes | PascalCase | `UserService`, `HttpClient` |
| Interfaces (TS) | PascalCase (no I prefix) | `User`, `ApiResponse` |
| Type Aliases (TS) | PascalCase | `UserId`, `RequestParams` |
| Enums (TS) | PascalCase | `UserRole`, `HttpStatus` |
| Enum Members | PascalCase or SCREAMING_SNAKE | `Admin`, `ADMIN` |
| Files (components) | PascalCase | `UserProfile.tsx` |
| Files (utilities) | camelCase or kebab-case | `formatDate.ts`, `api-client.ts` |
| Folders | kebab-case | `user-management/`, `api-handlers/` |
| React Components | PascalCase | `<UserProfile />` |
| React Hooks | camelCase with `use` prefix | `useAuth()`, `useFetchData()` |
| Event Handlers | camelCase with `handle`/`on` prefix | `handleClick`, `onSubmit` |
| Boolean Variables | camelCase with is/has/can/should | `isLoading`, `hasError`, `canEdit` |
| Private Members | camelCase with `_` prefix or `#` | `_internalState`, `#privateField` |

### Python

| Element | Convention | Example |
|---------|------------|---------|
| Variables | snake_case | `user_name`, `is_active` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| Functions | snake_case | `calculate_total()`, `fetch_user_data()` |
| Classes | PascalCase | `UserService`, `HttpClient` |
| Methods | snake_case | `get_user()`, `process_data()` |
| Private Members | snake_case with `_` prefix | `_internal_state` |
| "Very Private" | snake_case with `__` prefix | `__private_method` |
| Modules | snake_case | `user_service.py`, `http_client.py` |
| Packages | lowercase (no underscore preferred) | `mypackage/`, `utils/` |
| Type Variables | PascalCase | `T`, `KeyType`, `ValueType` |
| Exceptions | PascalCase with `Error` suffix | `ValidationError`, `NotFoundError` |

### Java

| Element | Convention | Example |
|---------|------------|---------|
| Variables | camelCase | `userName`, `isActive` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| Methods | camelCase | `calculateTotal()`, `fetchUserData()` |
| Classes | PascalCase | `UserService`, `HttpClient` |
| Interfaces | PascalCase (adjective-like) | `Comparable`, `Serializable`, `UserRepository` |
| Abstract Classes | PascalCase with `Abstract` prefix | `AbstractHandler`, `AbstractService` |
| Enums | PascalCase | `UserRole`, `HttpStatus` |
| Enum Constants | SCREAMING_SNAKE_CASE | `ADMIN`, `NOT_FOUND` |
| Packages | lowercase, reverse domain | `com.example.userservice` |
| Type Parameters | Single uppercase letter | `T`, `E`, `K`, `V` |
| Exceptions | PascalCase with `Exception` suffix | `ValidationException` |

### Kotlin

| Element | Convention | Example |
|---------|------------|---------|
| Variables | camelCase | `userName`, `isActive` |
| Constants (compile-time) | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| Constants (top-level/object) | camelCase or SCREAMING_SNAKE | `defaultTimeout`, `DEFAULT_TIMEOUT` |
| Functions | camelCase | `calculateTotal()`, `fetchUserData()` |
| Classes | PascalCase | `UserService`, `HttpClient` |
| Interfaces | PascalCase (no I prefix) | `UserRepository`, `Clickable` |
| Objects | PascalCase | `UserRepository`, `NetworkModule` |
| Enums | PascalCase | `UserRole`, `HttpStatus` |
| Enum Entries | SCREAMING_SNAKE_CASE or PascalCase | `ADMIN`, `Admin` |
| Sealed Classes | PascalCase | `Result`, `UiState` |
| Sealed Subclasses | PascalCase | `Success`, `Error`, `Loading` |
| Type Parameters | Single uppercase or PascalCase | `T`, `E`, `Key`, `Value` |
| Packages | lowercase, no underscores | `com.example.userservice` |
| Files (class) | PascalCase matching class | `UserService.kt` |
| Files (top-level functions) | camelCase or descriptive | `stringUtils.kt`, `NetworkExtensions.kt` |
| Extension Functions | camelCase | `toFormattedString()`, `isValidEmail()` |
| Properties (backing field) | _camelCase | `_state`, `_users` |
| Coroutine Scopes | camelCase with scope suffix | `viewModelScope`, `lifecycleScope` |
| Flow/StateFlow | camelCase | `userFlow`, `uiState` |
| Companion Object Properties | SCREAMING_SNAKE_CASE for constants | `companion object { const val TAG = "MyClass" }` |
| DSL Builders | camelCase | `buildString`, `apply`, `also` |
| Annotations | PascalCase | `@Serializable`, `@Composable` |

#### Kotlin-Specific Patterns

```kotlin
// Sealed class hierarchy
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val exception: Throwable) : Result<Nothing>()
    object Loading : Result<Nothing>()
}

// StateFlow with backing property
class MyViewModel : ViewModel() {
    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()
}

// Extension function
fun String.isValidEmail(): Boolean =
    this.matches(Regex("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"))

// Object declaration (singleton)
object NetworkModule {
    const val BASE_URL = "https://api.example.com"
    fun provideHttpClient(): HttpClient = HttpClient()
}

// Companion object
class User {
    companion object {
        const val TABLE_NAME = "users"
        fun fromJson(json: String): User = TODO()
    }
}
```

### Go

| Element | Convention | Example |
|---------|------------|---------|
| Variables (exported) | PascalCase | `UserName`, `IsActive` |
| Variables (unexported) | camelCase | `userName`, `isActive` |
| Constants | PascalCase or camelCase | `MaxRetryCount`, `apiBaseURL` |
| Functions (exported) | PascalCase | `CalculateTotal()`, `FetchUserData()` |
| Functions (unexported) | camelCase | `calculateTotal()`, `fetchUserData()` |
| Types (exported) | PascalCase | `UserService`, `HttpClient` |
| Types (unexported) | camelCase | `userService`, `httpClient` |
| Interfaces | PascalCase, often `-er` suffix | `Reader`, `Writer`, `UserRepository` |
| Packages | lowercase, short, single word | `user`, `http`, `config` |
| Files | snake_case | `user_service.go`, `http_client.go` |
| Test Files | `*_test.go` | `user_service_test.go` |
| Acronyms | ALL CAPS when exported | `HTTPClient`, `URLParser`, `ID` |

### Rust

| Element | Convention | Example |
|---------|------------|---------|
| Variables | snake_case | `user_name`, `is_active` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| Functions | snake_case | `calculate_total()`, `fetch_user_data()` |
| Structs | PascalCase | `UserService`, `HttpClient` |
| Enums | PascalCase | `UserRole`, `HttpStatus` |
| Enum Variants | PascalCase | `Admin`, `NotFound` |
| Traits | PascalCase | `Display`, `Iterator`, `UserRepository` |
| Modules | snake_case | `user_service`, `http_client` |
| Crates | snake_case or kebab-case | `my_crate`, `my-crate` |
| Type Parameters | PascalCase, often single letter | `T`, `E`, `Item`, `Key` |
| Lifetimes | lowercase, short | `'a`, `'b`, `'static` |
| Macros | snake_case! | `println!`, `vec!` |

### C# / .NET

| Element | Convention | Example |
|---------|------------|---------|
| Variables (local) | camelCase | `userName`, `isActive` |
| Variables (private field) | _camelCase | `_userName`, `_isActive` |
| Constants | PascalCase | `MaxRetryCount`, `ApiBaseUrl` |
| Properties | PascalCase | `UserName`, `IsActive` |
| Methods | PascalCase | `CalculateTotal()`, `FetchUserData()` |
| Classes | PascalCase | `UserService`, `HttpClient` |
| Interfaces | IPascalCase | `IUserRepository`, `IHttpClient` |
| Enums | PascalCase | `UserRole`, `HttpStatus` |
| Enum Members | PascalCase | `Admin`, `NotFound` |
| Namespaces | PascalCase | `MyCompany.UserService` |
| Events | PascalCase | `UserCreated`, `DataLoaded` |
| Type Parameters | TPascalCase | `TKey`, `TValue`, `TEntity` |

### SQL

| Element | Convention | Example |
|---------|------------|---------|
| Tables | snake_case (plural) | `users`, `order_items` |
| Columns | snake_case | `user_name`, `created_at` |
| Primary Keys | `id` or `table_id` | `id`, `user_id` |
| Foreign Keys | `referenced_table_id` | `user_id`, `order_id` |
| Indexes | `idx_table_column` | `idx_users_email` |
| Constraints | `pk_`, `fk_`, `uq_`, `ck_` prefix | `pk_users`, `fk_orders_user` |
| Stored Procedures | snake_case or PascalCase | `get_user_by_id`, `GetUserById` |
| Keywords | UPPERCASE | `SELECT`, `FROM`, `WHERE` |

## Semantic Naming Patterns

### Boolean Names
Always phrase as true/false question:
- `is*` - State: `isActive`, `isValid`, `isLoading`
- `has*` - Possession: `hasPermission`, `hasError`, `hasChildren`
- `can*` - Capability: `canEdit`, `canDelete`, `canAccess`
- `should*` - Recommendation: `shouldUpdate`, `shouldRender`
- `will*` - Future: `willChange`, `willUpdate`

### Function/Method Names
Use verb + noun pattern:
- `get*` - Retrieve: `getUser`, `getUserById`
- `set*` - Assign: `setName`, `setActive`
- `create*` / `make*` - Construct: `createUser`, `makeRequest`
- `update*` - Modify: `updateProfile`, `updateSettings`
- `delete*` / `remove*` - Destroy: `deleteUser`, `removeItem`
- `fetch*` - Async retrieve: `fetchUserData`, `fetchPosts`
- `handle*` - Event: `handleClick`, `handleSubmit`
- `validate*` - Check: `validateEmail`, `validateForm`
- `parse*` - Transform: `parseJSON`, `parseDate`
- `format*` - Display: `formatCurrency`, `formatDate`
- `convert*` / `to*` - Transform: `convertToJSON`, `toUpperCase`
- `calculate*` / `compute*` - Process: `calculateTotal`, `computeHash`
- `find*` - Search: `findUserByEmail`, `findAll`
- `check*` / `verify*` - Validate: `checkPermission`, `verifyToken`
- `init*` / `setup*` - Initialize: `initApp`, `setupDatabase`

### Collection Names
- Use plural: `users`, `items`, `orderItems`
- For maps/dictionaries: `userById`, `itemsByCategory`
- For counts: `userCount`, `itemTotal`

### Abbreviations and Acronyms
- Avoid abbreviations unless universally understood
- Common acceptable: `id`, `url`, `api`, `http`, `db`, `config`, `auth`, `admin`
- Avoid: `usr`, `cnt`, `mgr`, `num`, `tmp`
- For acronyms in camelCase: `userId`, `apiKey`, `httpClient`
- For acronyms in PascalCase: Follow language convention (`HTTPClient` vs `HttpClient`)

## File and Folder Naming

| Type | Convention | Example |
|------|------------|---------|
| React Component | PascalCase | `UserProfile.tsx` |
| React Hook | camelCase with use | `useAuth.ts` |
| Utility | camelCase or kebab | `formatDate.ts`, `date-utils.ts` |
| Test | Same as source + .test/.spec | `UserProfile.test.tsx` |
| Config | kebab-case | `eslint-config.js`, `jest.config.ts` |
| Folder | kebab-case | `user-management/`, `api-handlers/` |
| Python Module | snake_case | `user_service.py` |
| Go File | snake_case | `user_service.go` |

## Anti-Patterns to Avoid

1. **Hungarian Notation** - Don't prefix with type: `strName`, `intCount`
2. **Meaningless Names** - Avoid: `data`, `info`, `temp`, `result`, `item`
3. **Single Letters** - Only in tiny scopes or common idioms: `i`, `j`, `k`, `x`, `y`
4. **Numbers in Names** - Avoid: `user1`, `data2` (indicates need for array/list)
5. **Negative Booleans** - Avoid: `isNotActive`, `hasNoErrors` (use `isInactive`)
6. **Redundant Context** - In `UserService`, don't use `userGetUser()`, just `get()`
7. **Inconsistent Casing** - Don't mix conventions within same element type

## Enforcement

Consider using these tools to enforce conventions:
- **JavaScript/TypeScript**: ESLint with naming-convention rules
- **Python**: pylint, flake8 with pep8-naming
- **Java**: Checkstyle
- **Kotlin**: Detekt, ktlint
- **Go**: golint (now deprecated, use staticcheck)
- **Rust**: clippy
- **C#**: StyleCop, .editorconfig
