# Phase 0: Project Setup Reference

Quick reference for initializing TDD projects by language.

## TypeScript / Node.js

```bash
npm init -y
npm install -D typescript @types/node tsx vitest
```

**tsconfig.json:**
```json
{"compilerOptions":{"target":"ES2022","module":"NodeNext","moduleResolution":"NodeNext","outDir":"dist","rootDir":"src","strict":true,"esModuleInterop":true,"skipLibCheck":true},"include":["src/**/*"]}
```

**package.json scripts:**
```json
{"scripts":{"dev":"tsx watch src/index.ts","build":"tsc","test":"vitest","test:run":"vitest run"}}
```

**Test:** `npm test` | Watch: `npm test`

---

## Python

```bash
mkdir src tests && touch src/__init__.py tests/__init__.py
python -m venv .venv && source .venv/bin/activate
pip install pytest pytest-cov
```

**Test:** `pytest` | Watch: `ptw` (install pytest-watch)

---

## Go

```bash
go mod init github.com/username/project-name
```

**Test:** `go test ./...` | Verbose: `go test ./... -v`

---

## Rust

```bash
cargo new project-name && cd project-name
```

**Test:** `cargo test` | Watch: `cargo watch -x test`

---

## Java (Gradle)

```bash
gradle init --type java-application --dsl kotlin
```

**build.gradle.kts:**
```kotlin
plugins { java; application }
repositories { mavenCentral() }
dependencies { testImplementation("org.junit.jupiter:junit-jupiter:5.10.0") }
tasks.test { useJUnitPlatform() }
```

**Test:** `./gradlew test` | Watch: `./gradlew test --continuous`

---

## Kotlin (Gradle)

```bash
gradle init --type kotlin-application --dsl kotlin
```

**build.gradle.kts:**
```kotlin
plugins { kotlin("jvm") version "1.9.22"; application }
repositories { mavenCentral() }
dependencies { testImplementation(kotlin("test")) }
tasks.test { useJUnitPlatform() }
```

**Test:** `./gradlew test` | Watch: `./gradlew test --continuous`

---

## Java (Maven)

```bash
mvn archetype:generate -DgroupId=com.example -DartifactId=project-name -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
```

Add to pom.xml dependencies:
```xml
<dependency><groupId>org.junit.jupiter</groupId><artifactId>junit-jupiter</artifactId><version>5.10.0</version><scope>test</scope></dependency>
```

**Test:** `mvn test` | Specific: `mvn test -Dtest=ClassName`

---

## Ruby

```bash
bundle init
echo "gem 'rspec', group: :test" >> Gemfile
bundle install && bundle exec rspec --init
```

**Test:** `rspec` | Watch: `guard`
