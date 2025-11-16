# ElizaOS - High-Level Architecture

This diagram provides an overview of the ElizaOS system architecture, showing how the main components interact.

```mermaid
graph TB
    subgraph "External Interactions"
        User[👤 User/Developer]
        ExtPlatforms[External Platforms<br/>Discord, Twitter, Telegram]
        LLM[AI Model Providers<br/>OpenAI, Anthropic, etc.]
    end

    subgraph "ElizaOS Core System"
        CLI[CLI/API Entry Point]
        Runtime[Agent Runtime]

        subgraph "Plugin Architecture"
            Plugins[Plugins]
            Actions[Actions]
            Providers[Providers]
            Evaluators[Evaluators]
            Services[Services]
        end

        subgraph "Data Layer"
            Database[Database Adapter<br/>PostgreSQL/PGLite]
            Memory[Memory System]
        end

        Character[Character/Agent Config]
    end

    User -->|Commands/Interactions| CLI
    CLI -->|Initialize| Runtime
    Runtime -->|Uses| Character
    Runtime -->|Registers| Plugins
    Runtime -->|Manages| Memory
    Runtime -->|Persists| Database

    Plugins -->|Contain| Actions
    Plugins -->|Contain| Providers
    Plugins -->|Contain| Evaluators
    Plugins -->|Contain| Services

    Actions -->|Execute via| Services
    Providers -->|Supply Context| Runtime
    Evaluators -->|Post-process| Runtime
    Services -->|Integrate| ExtPlatforms

    Runtime -->|Generate via| LLM
    Runtime -->|Send Messages| ExtPlatforms
    ExtPlatforms -->|Receive Messages| Runtime

    style Runtime fill:#4A90E2,stroke:#2E5C8A,stroke-width:3px,color:#fff
    style Plugins fill:#7B68EE,stroke:#5A4BAD,stroke-width:2px,color:#fff
    style Database fill:#50C878,stroke:#3A9B5C,stroke-width:2px,color:#fff
    style LLM fill:#FF6B6B,stroke:#CC5555,stroke-width:2px,color:#fff
```

## Key Components

### Agent Runtime
The central orchestrator that manages all agent operations, including:
- Plugin registration and lifecycle
- State composition and management
- Model interaction and text generation
- Action processing and evaluation
- Memory persistence and retrieval

### Plugins
Modular extensions that provide:
- **Actions**: User-facing commands and interactions
- **Providers**: Read-only context suppliers (time, facts, etc.)
- **Evaluators**: Post-interaction learning and analysis
- **Services**: Stateful integrations with external systems

### Data Layer
- **Database Adapter**: Interface for PostgreSQL or PGLite storage
- **Memory System**: Deterministic UUID-based memory with room/world mapping

### Character Configuration
JSON-based agent personality, knowledge, and behavior definition

## Related Diagrams

- [Monorepo Structure](./architecture-monorepo.md) - Package organization
- [Runtime & Plugin Architecture](./architecture-runtime-plugins.md) - Detailed plugin system
- [Component Interactions](./architecture-components.md) - Actions, Providers, Evaluators, Services
- [Memory & UUID System](./architecture-memory.md) - Agent memory architecture
- [Architecture Overview](./architecture-overview.md) - Index of all diagrams
