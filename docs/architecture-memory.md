# ElizaOS - Memory & UUID System

This diagram illustrates the agent memory architecture and deterministic UUID system that enables consistent agent perspective across environments.

## Memory Architecture Overview

```mermaid
graph TB
    subgraph "External Platform"
        Discord[Discord Server]
        DiscordChannel[#general Channel]
        DiscordUser[User: Alice]
    end

    subgraph "Agent Perspective Mapping"
        World[World<br/>Discord Server → World UUID<br/>Swizzled with Agent UUID]
        Room[Room<br/>Channel → Room UUID<br/>Swizzled with Agent UUID]
        Entity[Entity<br/>User → Entity UUID<br/>Swizzled with Agent UUID]
    end

    subgraph "Agent A Runtime"
        AgentA[Agent A<br/>UUID: agent-a-uuid]
        WorldA[World UUID A<br/>f(agent-a-uuid + server-id)]
        RoomA[Room UUID A<br/>f(agent-a-uuid + channel-id)]
        EntityA[Entity UUID A<br/>f(agent-a-uuid + user-id)]
        MemoryA[(Agent A Memory)]
    end

    subgraph "Agent B Runtime"
        AgentB[Agent B<br/>UUID: agent-b-uuid]
        WorldB[World UUID B<br/>f(agent-b-uuid + server-id)]
        RoomB[Room UUID B<br/>f(agent-b-uuid + channel-id)]
        EntityB[Entity UUID B<br/>f(agent-b-uuid + user-id)]
        MemoryB[(Agent B Memory)]
    end

    Discord --> World
    DiscordChannel --> Room
    DiscordUser --> Entity

    World --> WorldA
    World --> WorldB
    Room --> RoomA
    Room --> RoomB
    Entity --> EntityA
    Entity --> EntityB

    WorldA --> MemoryA
    RoomA --> MemoryA
    EntityA --> MemoryA

    WorldB --> MemoryB
    RoomB --> MemoryB
    EntityB --> MemoryB

    style AgentA fill:#4A90E2,stroke:#2E5C8A,stroke-width:3px,color:#fff
    style AgentB fill:#7B68EE,stroke:#5A4BAD,stroke-width:3px,color:#fff
    style MemoryA fill:#50C878,stroke:#3A9B5C,stroke-width:2px,color:#fff
    style MemoryB fill:#FFB84D,stroke:#CC9333,stroke-width:2px,color:#fff
```

## Deterministic UUID Generation

```mermaid
graph LR
    subgraph "UUID Swizzling Process"
        Input[External ID<br/>e.g., Discord Channel ID]
        AgentUUID[Agent UUID]
        Hash[Hash Function<br/>SHA-256 / UUID v5]
        DeterministicUUID[Deterministic UUID<br/>Unique per Agent]
    end

    Input --> Hash
    AgentUUID --> Hash
    Hash --> DeterministicUUID

    Note1[Same external ID + Same agent = Same UUID]
    Note2[Same external ID + Different agent = Different UUID]

    style Hash fill:#FF6B6B,stroke:#CC5555,stroke-width:2px,color:#fff
    style DeterministicUUID fill:#50C878,stroke:#3A9B5C,stroke-width:2px,color:#fff
```

## Memory Types and Relationships

```mermaid
erDiagram
    AGENT ||--o{ WORLD : "has perspective on"
    AGENT ||--o{ ROOM : "perceives"
    AGENT ||--o{ ENTITY : "knows about"
    AGENT ||--o{ MEMORY : "stores"

    WORLD ||--o{ ROOM : contains
    ROOM ||--o{ PARTICIPANT : has
    ENTITY ||--o{ PARTICIPANT : participates_as
    ROOM ||--o{ MEMORY : "messages in"

    AGENT {
        UUID id PK
        string name
        Character character
    }

    WORLD {
        UUID id PK "Swizzled with agent UUID"
        string name
        string serverId "External platform ID"
        string source "Platform type"
    }

    ROOM {
        UUID id PK "Swizzled with agent UUID"
        string name
        UUID worldId FK
        string channelId "External channel ID"
        ChannelType type
    }

    ENTITY {
        UUID id PK "Swizzled with agent UUID"
        string name
        string userId "External user ID"
    }

    PARTICIPANT {
        UUID id PK
        UUID entityId FK
        UUID roomId FK
    }

    MEMORY {
        UUID id PK
        UUID roomId FK
        UUID entityId FK "Author"
        UUID agentId FK
        Content content
        MemoryMetadata metadata
        Embedding embedding
        timestamp createdAt
    }
```

## Memory Flow

```mermaid
sequenceDiagram
    participant Platform as External Platform<br/>(Discord/Twitter/etc)
    participant Service as Message Service
    participant Runtime as Agent Runtime
    participant UUID as UUID Swizzler
    participant DB as Database

    Platform->>Service: Message Event
    Note over Platform,Service: channelId: "discord-123"<br/>userId: "user-456"<br/>serverId: "server-789"

    Service->>Runtime: Process Message
    Runtime->>UUID: Generate World UUID
    Note over UUID: Hash(agentId + serverId)
    UUID-->>Runtime: World UUID

    Runtime->>UUID: Generate Room UUID
    Note over UUID: Hash(agentId + channelId)
    UUID-->>Runtime: Room UUID

    Runtime->>UUID: Generate Entity UUID
    Note over UUID: Hash(agentId + userId)
    UUID-->>Runtime: Entity UUID

    Runtime->>DB: ensureWorldExists(world)
    Runtime->>DB: ensureRoomExists(room)
    Runtime->>DB: ensureConnection(entity, room)

    Runtime->>DB: Create Memory
    Note over DB: Stores with agent-specific UUIDs

    DB-->>Runtime: Memory stored
```

## Memory Retrieval and Context

```mermaid
graph TB
    subgraph "Context Composition"
        Message[Incoming Message]
        Runtime[Agent Runtime]
    end

    subgraph "Memory Queries"
        RecentMessages[Get Recent Messages<br/>from Room]
        RelevantMemories[Search Related Memories<br/>via Embeddings]
        EntityHistory[Get Entity Interaction<br/>History]
        WorldContext[Get World Information]
    end

    subgraph "State Building"
        Providers[Run Providers]
        Facts[Extract Facts]
        Goals[Check Goals]
        ComposeState[Compose State]
    end

    subgraph "Final State"
        State[State Object<br/>───────<br/>Recent context<br/>Relevant memories<br/>Entity knowledge<br/>World state<br/>Provider data]
    end

    Message --> Runtime
    Runtime --> RecentMessages
    Runtime --> RelevantMemories
    Runtime --> EntityHistory
    Runtime --> WorldContext

    RecentMessages --> ComposeState
    RelevantMemories --> ComposeState
    EntityHistory --> ComposeState
    WorldContext --> ComposeState

    Runtime --> Providers
    Runtime --> Facts
    Runtime --> Goals

    Providers --> ComposeState
    Facts --> ComposeState
    Goals --> ComposeState

    ComposeState --> State

    style Runtime fill:#4A90E2,stroke:#2E5C8A,stroke-width:3px,color:#fff
    style State fill:#50C878,stroke:#3A9B5C,stroke-width:2px,color:#fff
    style ComposeState fill:#FFB84D,stroke:#CC9333,stroke-width:2px,color:#fff
```

## Environment Abstractions

```mermaid
graph TB
    subgraph "Platform Concepts"
        PlatformServer[Platform Server/Guild]
        PlatformChannel[Platform Channel/Chat]
        PlatformUser[Platform User]
        PlatformMessage[Platform Message]
    end

    subgraph "ElizaOS Abstractions"
        World[World<br/>Represents a server/community]
        Room[Room<br/>Represents a conversation space]
        Entity[Entity<br/>Represents a participant]
        Memory[Memory<br/>Represents a message/interaction]
    end

    subgraph "Mapping Examples"
        Discord[Discord Server → World<br/>Discord Channel → Room<br/>Discord User → Entity]
        Twitter[Twitter Space → World<br/>Twitter Thread → Room<br/>Twitter User → Entity]
        Telegram[Telegram Group → World<br/>Telegram Chat → Room<br/>Telegram User → Entity]
    end

    PlatformServer --> World
    PlatformChannel --> Room
    PlatformUser --> Entity
    PlatformMessage --> Memory

    World --> Discord
    World --> Twitter
    World --> Telegram

    style World fill:#7B68EE,stroke:#5A4BAD,stroke-width:2px,color:#fff
    style Room fill:#4A90E2,stroke:#2E5C8A,stroke-width:2px,color:#fff
    style Entity fill:#50C878,stroke:#3A9B5C,stroke-width:2px,color:#fff
    style Memory fill:#FFB84D,stroke:#CC9333,stroke-width:2px,color:#fff
```

## Key Principles

### Agent-Centric Perspective
Every agent has its own unique perspective on the world:
- **Same Discord server** → Different World UUID per agent
- **Same channel** → Different Room UUID per agent
- **Same user** → Different Entity UUID per agent

### Deterministic UUIDs
UUIDs are generated deterministically:
```
World UUID = hash(agentUUID + externalServerId)
Room UUID = hash(agentUUID + externalChannelId)
Entity UUID = hash(agentUUID + externalUserId)
```

### Benefits
- **Consistency**: Same external entity always maps to same UUID for an agent
- **Isolation**: Each agent has independent memory perspective
- **Portability**: Agent can move between environments and maintain context
- **Debugging**: Deterministic IDs make debugging easier

### Memory Isolation
- Each agent stores memories with its own UUID namespace
- Agents cannot access each other's memories directly
- Shared external events create separate memories per agent

## Database Adapter Interface

```mermaid
graph LR
    subgraph "IDatabaseAdapter"
        GetMemories[getMemories]
        CreateMemory[createMemory]
        SearchMemories[searchMemoriesByEmbedding]
        GetRooms[getRooms]
        GetEntities[getEntities]
        EnsureConnection[ensureConnection]
    end

    subgraph "Implementations"
        PostgreSQL[PostgreSQL Adapter<br/>Production]
        PGLite[PGLite Adapter<br/>Development/Testing]
    end

    GetMemories --> PostgreSQL
    GetMemories --> PGLite
    CreateMemory --> PostgreSQL
    CreateMemory --> PGLite
    SearchMemories --> PostgreSQL
    SearchMemories --> PGLite

    style PostgreSQL fill:#4A90E2,stroke:#2E5C8A,stroke-width:2px,color:#fff
    style PGLite fill:#50C878,stroke:#3A9B5C,stroke-width:2px,color:#fff
```

## Memory Content Structure

```typescript
interface Memory {
  id: UUID;                    // Message UUID
  roomId: UUID;                // Room UUID (agent-specific)
  entityId: UUID;              // Author Entity UUID (agent-specific)
  agentId: UUID;               // Agent UUID
  content: Content;            // Message content
  metadata: MemoryMetadata;    // Additional data
  embedding?: number[];        // Vector embedding for search
  createdAt: Date;            // Timestamp
}

interface Content {
  text: string;                // Main text content
  action?: string;             // Associated action
  source?: string;             // Origin platform
  url?: string;                // Related URL
  inReplyTo?: UUID;           // Reply reference
  attachments?: Attachment[];  // Files, images, etc.
}
```

## Related Diagrams

- [High-Level Architecture](./architecture-high-level.md) - System overview
- [Monorepo Structure](./architecture-monorepo.md) - Package organization
- [Runtime & Plugin Architecture](./architecture-runtime-plugins.md) - Detailed plugin system
- [Component Interactions](./architecture-components.md) - Actions, Providers, Evaluators, Services
- [Architecture Overview](./architecture-overview.md) - Index of all diagrams
