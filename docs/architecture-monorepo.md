# ElizaOS - Monorepo Structure

This diagram shows the package organization and dependencies within the ElizaOS monorepo.

```mermaid
graph TB
    subgraph "Core Foundation"
        Core["@elizaos/core<br/>(packages/core)<br/>───────────<br/>Runtime, Types,<br/>Agents, Database"]
    end

    subgraph "Application Layer"
        CLI["@elizaos/cli<br/>(packages/cli)<br/>───────────<br/>Command-line Interface<br/>Agent Runtime"]
        Client["packages/client<br/>───────────<br/>React GUI Frontend"]
        App["packages/app<br/>───────────<br/>Tauri Desktop/Mobile"]
        Server["packages/server<br/>───────────<br/>Server Components & API"]
        APIClient["@elizaos/api-client<br/>(packages/api-client)<br/>───────────<br/>Type-safe API Client"]
    end

    subgraph "Plugin Ecosystem"
        Bootstrap["plugin-bootstrap<br/>───────────<br/>Default Handlers,<br/>Actions, Providers"]
        SQL["plugin-sql<br/>───────────<br/>PostgreSQL/PGLite<br/>Database Adapter"]
        PluginStarter["plugin-starter<br/>───────────<br/>Plugin Template"]
    end

    subgraph "Project Templates"
        ProjectStarter["project-starter<br/>───────────<br/>New Project Template"]
        TEEStarter["project-tee-starter<br/>───────────<br/>TEE Project Template"]
    end

    subgraph "Development Tools"
        AutoDoc["packages/autodoc<br/>───────────<br/>Documentation Generator"]
        Docs["packages/docs<br/>───────────<br/>Docusaurus Site"]
        CreateEliza["packages/create-eliza<br/>───────────<br/>Project Scaffolding"]
    end

    %% Core Dependencies (everything depends on core)
    CLI --> Core
    Client --> Core
    App --> Core
    Server --> Core
    APIClient --> Core
    Bootstrap --> Core
    SQL --> Core
    PluginStarter --> Core

    %% Application Dependencies
    App --> Client
    Client --> APIClient
    CLI --> Bootstrap
    CLI --> SQL
    Server --> APIClient

    %% Template Dependencies
    ProjectStarter --> Core
    TEEStarter --> Core
    CreateEliza --> Core

    style Core fill:#4A90E2,stroke:#2E5C8A,stroke-width:4px,color:#fff
    style CLI fill:#7B68EE,stroke:#5A4BAD,stroke-width:2px,color:#fff
    style Bootstrap fill:#50C878,stroke:#3A9B5C,stroke-width:2px,color:#fff
    style SQL fill:#50C878,stroke:#3A9B5C,stroke-width:2px,color:#fff
```

## Package Dependency Rules

### Workspace Dependencies
All internal `@elizaos/` packages **MUST** use `workspace:*` in `package.json`:

```json
{
  "dependencies": {
    "@elizaos/core": "workspace:*",
    "@elizaos/plugin-sql": "workspace:*"
  }
}
```

### Central Dependency Pattern
- **Everything depends on `@elizaos/core`**
- **Core cannot depend on other packages** (no circular dependencies)
- Import pattern: Use `@elizaos/core` in package code

## Package Categories

### Core Foundation
- **`@elizaos/core`**: Foundation runtime, types, agents, database interfaces

### Application Layer
- **`@elizaos/cli`**: Command-line interface and agent runtime
- **`packages/client`**: React GUI frontend
- **`packages/app`**: Tauri-based desktop/mobile application
- **`packages/server`**: Server components and REST API
- **`@elizaos/api-client`**: Type-safe client for ElizaOS server API

### Plugin Ecosystem
- **`plugin-bootstrap`**: Default event handlers, actions, and providers
- **`plugin-sql`**: DatabaseAdapter implementations (PostgreSQL, PGLite)
- **`plugin-starter`**: Template for creating new plugins

### Project Templates
- **`project-starter`**: Template for new ElizaOS projects
- **`project-tee-starter`**: TEE (Trusted Execution Environment) project template

### Development Tools
- **`packages/autodoc`**: Automated documentation generation
- **`packages/docs`**: Official documentation (Docusaurus)
- **`packages/create-eliza`**: Project scaffolding CLI tool

## Build System

### Tools
- **Package Manager**: `bun` (NEVER use npm or pnpm)
- **Monorepo Tool**: Turbo + Lerna
- **TypeScript**: Shared tsconfig across all packages

### Common Commands
```bash
bun install              # Install dependencies
bun run build            # Build all packages
bun run build:core       # Build core package
bun test                 # Run all tests
```

## Related Diagrams

- [High-Level Architecture](./architecture-high-level.md) - System overview
- [Runtime & Plugin Architecture](./architecture-runtime-plugins.md) - Detailed plugin system
- [Component Interactions](./architecture-components.md) - Actions, Providers, Evaluators, Services
- [Memory & UUID System](./architecture-memory.md) - Agent memory architecture
- [Architecture Overview](./architecture-overview.md) - Index of all diagrams
