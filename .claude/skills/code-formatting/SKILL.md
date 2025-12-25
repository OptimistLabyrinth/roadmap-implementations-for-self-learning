---
name: code-formatting
description: Setup and enforce code formatting rules. Use when user mentions formatting, code style, linting, prettier, eslint, auto-format, or needs to format files before git operations. Ensures consistent formatting before git add and git push.
---

# Code Formatting

## Purpose

Establish and enforce consistent code formatting across the project. Ensure all files are properly formatted before git operations (add, commit, push).

## Process

### Step 1: Detect Existing Formatting Configuration

First, check for existing formatting tools in the project:

```bash
# Check for common config files
ls -la .prettierrc* .eslintrc* .editorconfig pyproject.toml setup.cfg .rustfmt.toml .clang-format
# Check package.json for formatting scripts
cat package.json | grep -A5 "scripts"
# Check for pre-commit hooks
cat .git/hooks/pre-commit 2>/dev/null || cat .husky/pre-commit 2>/dev/null
```

### Step 2: Setup Formatting (If Missing)

If no formatting configuration exists, ask clarifying questions:

#### For JavaScript/TypeScript Projects:

**Question 1: Formatter Tool**
- (a) Prettier [Recommended] - Opinionated, zero-config
- (b) ESLint only - More configurable, less consistent
- (c) Biome - Fast, all-in-one (newer)

**Question 2: Style Preferences**
- Tabs or Spaces? (a) Spaces [Recommended] (b) Tabs
- Indent Size? (a) 2 spaces [Recommended for JS] (b) 4 spaces
- Semicolons? (a) Yes [Recommended] (b) No
- Quotes? (a) Single [Recommended] (b) Double
- Trailing Commas? (a) ES5 [Recommended] (b) All (c) None
- Line Width? (a) 80 (b) 100 (c) 120 [Recommended]

**Question 3: Integration**
- (a) Pre-commit hook with Husky + lint-staged [Recommended]
- (b) Pre-commit hook with lefthook
- (c) Manual formatting only

#### For Python Projects:

**Question 1: Formatter Tool**
- (a) Black + isort [Recommended] - Most popular, consistent
- (b) Ruff - Fast, all-in-one
- (c) autopep8 + isort - PEP8 compliant
- (d) YAPF - Highly configurable

**Question 2: Style Preferences**
- Line Length? (a) 88 [Black default] (b) 79 [PEP8] (c) 100 (d) 120

**Question 3: Integration**
- (a) Pre-commit with pre-commit framework [Recommended]
- (b) Pre-commit with Husky
- (c) Manual formatting only

#### For Go Projects:

Standard approach - use built-in tools:
- `gofmt` - Standard formatting
- `goimports` - Formatting + import management [Recommended]

**Question: Integration**
- (a) Pre-commit hook [Recommended]
- (b) Editor save hook only
- (c) Manual formatting

#### For JVM Projects (Java/Kotlin):

**Question 1: Formatter Tool**
- (a) Spotless (Gradle/Maven plugin) [Recommended] - Supports multiple formatters, widely adopted
- (b) ktlint (Kotlin only) - Kotlin-specific, Android standard
- (c) google-java-format (Java only) - Google's opinionated formatter
- (d) Palantir Java Format (Java only) - Based on google-java-format with modifications

**Question 2: For Kotlin specifically**
- (a) ktlint via Spotless [Recommended] - Industry standard, used by Android
- (b) ktfmt (by Facebook) - Kotlin formatter similar to google-java-format
- (c) Detekt with formatting rules - Combines linting + formatting

**Question 3: Integration**
- (a) Gradle/Maven plugin with pre-commit [Recommended]
- (b) IDE formatting only
- (c) Manual formatting

### Step 3: Configuration Templates

#### Prettier Configuration (.prettierrc)

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 120,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

#### ESLint Configuration (.eslintrc.js)

```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier', // Must be last to override other configs
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // Add project-specific rules
  },
};
```

#### Python Black Configuration (pyproject.toml)

```toml
[tool.black]
line-length = 88
target-version = ['py39', 'py310', 'py311']
include = '\.pyi?$'
exclude = '''
/(
    \.eggs
  | \.git
  | \.hg
  | \.mypy_cache
  | \.tox
  | \.venv
  | _build
  | buck-out
  | build
  | dist
)/
'''

[tool.isort]
profile = "black"
line_length = 88
```

#### EditorConfig (.editorconfig)

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.py]
indent_size = 4

[*.go]
indent_style = tab

[*.{java,kt,kts}]
indent_size = 4

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab
```

#### Spotless Configuration (build.gradle.kts) - JVM Projects

```kotlin
plugins {
    id("com.diffplug.spotless") version "6.25.0"
}

spotless {
    java {
        target("src/**/*.java")
        googleJavaFormat("1.19.2")
        removeUnusedImports()
        trimTrailingWhitespace()
        endWithNewline()
    }
    kotlin {
        target("src/**/*.kt")
        ktlint("1.1.1")
        trimTrailingWhitespace()
        endWithNewline()
    }
    kotlinGradle {
        target("*.gradle.kts")
        ktlint("1.1.1")
    }
}
```

#### Spotless Configuration (build.gradle) - Groovy DSL

```groovy
plugins {
    id 'com.diffplug.spotless' version '6.25.0'
}

spotless {
    java {
        target 'src/**/*.java'
        googleJavaFormat('1.19.2')
        removeUnusedImports()
        trimTrailingWhitespace()
        endWithNewline()
    }
    kotlin {
        target 'src/**/*.kt'
        ktlint('1.1.1')
        trimTrailingWhitespace()
        endWithNewline()
    }
}
```

#### ktlint Configuration (.editorconfig for ktlint)

```ini
[*.{kt,kts}]
# ktlint specific settings
ktlint_code_style = android_studio
ktlint_experimental = enabled
max_line_length = 120
indent_size = 4
insert_final_newline = true

# Disable specific rules if needed
ktlint_standard_no-wildcard-imports = disabled
```

### Step 4: Pre-commit Hook Setup

#### Using Husky + lint-staged (JavaScript/TypeScript)

```bash
# Install
npm install -D husky lint-staged

# Initialize Husky
npx husky install

# Add to package.json
# "prepare": "husky install"
```

**.husky/pre-commit:**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

**package.json (lint-staged config):**
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

#### Using pre-commit Framework (Python)

**.pre-commit-config.yaml:**
```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files

  - repo: https://github.com/psf/black
    rev: 23.12.1
    hooks:
      - id: black

  - repo: https://github.com/pycqa/isort
    rev: 5.13.2
    hooks:
      - id: isort

  - repo: https://github.com/charliermarsh/ruff-pre-commit
    rev: v0.1.9
    hooks:
      - id: ruff
        args: [--fix]
```

```bash
# Install
pip install pre-commit
pre-commit install
```

### Step 5: Format Before Git Operations

#### Before git add

```bash
# JavaScript/TypeScript
npx prettier --write .
npx eslint --fix .

# Python
black .
isort .

# Go
goimports -w .

# Or use lint-staged for only changed files
npx lint-staged
```

#### Before git push

Ensure CI also checks formatting:

**.github/workflows/lint.yml:**
```yaml
name: Lint

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Check formatting
        run: npx prettier --check .

      - name: Lint
        run: npx eslint .
```

### Step 6: Manual Formatting Commands

#### JavaScript/TypeScript
```bash
# Check formatting (no changes)
npx prettier --check .
npx eslint .

# Auto-fix
npx prettier --write .
npx eslint --fix .

# Format specific files
npx prettier --write "src/**/*.ts"
```

#### Python
```bash
# Check formatting
black --check .
isort --check-only .
ruff check .

# Auto-fix
black .
isort .
ruff check --fix .

# Format specific files
black src/
```

#### Go
```bash
# Check formatting
gofmt -d .
test -z $(gofmt -l .)

# Auto-fix
gofmt -w .
goimports -w .
```

#### Java/Kotlin (Spotless)
```bash
# Check formatting
./gradlew spotlessCheck

# Auto-fix
./gradlew spotlessApply

# Check specific source set
./gradlew spotlessJavaCheck
./gradlew spotlessKotlinCheck
```

#### Kotlin (ktlint standalone)
```bash
# Install ktlint
curl -sSLO https://github.com/pinterest/ktlint/releases/download/1.1.1/ktlint
chmod a+x ktlint

# Check formatting
./ktlint "src/**/*.kt"

# Auto-fix
./ktlint -F "src/**/*.kt"

# Generate .editorconfig
./ktlint generateEditorConfig
```

## Formatting Checklist

Before each git operation, verify:

```markdown
## Pre-Git Checklist

### Before `git add`
- [ ] Run formatter on all modified files
- [ ] Run linter and fix any issues
- [ ] Verify no unintended changes

### Before `git commit`
- [ ] Pre-commit hooks pass
- [ ] All files in staging area are formatted

### Before `git push`
- [ ] All commits are properly formatted
- [ ] Local lint check passes
- [ ] CI will not fail on formatting
```

## Ignore Files

#### .prettierignore
```
node_modules/
dist/
build/
coverage/
*.min.js
package-lock.json
```

#### .eslintignore
```
node_modules/
dist/
build/
coverage/
*.min.js
```

## Best Practices

1. **Format on save** - Configure your editor to format automatically
2. **Pre-commit hooks** - Never rely on manual formatting alone
3. **CI enforcement** - Fail the build if formatting is wrong
4. **Team alignment** - Use shared config files committed to repo
5. **No formatting in code review** - Automation handles it
6. **Consistent line endings** - Use LF (Unix-style) everywhere
7. **EditorConfig** - Helps editors follow project conventions

## JVM Formatter Comparison

| Tool | Language | Style | Configurability | Adoption |
|------|----------|-------|-----------------|----------|
| Spotless | Java, Kotlin, Groovy | Multiple | High (plugin-based) | Very High |
| ktlint | Kotlin | Android/Official | Medium | Very High (Android standard) |
| ktfmt | Kotlin | Opinionated | Low | Medium (Facebook) |
| google-java-format | Java | Google | Very Low | High |
| Palantir Java Format | Java | Palantir | Low | Medium |
| Detekt | Kotlin | Configurable | High | High (linting + formatting) |

**Recommendation for JVM projects:**
- **Kotlin projects**: Spotless with ktlint [Most widely adopted]
- **Java projects**: Spotless with google-java-format
- **Mixed Java/Kotlin**: Spotless (handles both seamlessly)
- **Android projects**: ktlint (official Android Kotlin style guide)
