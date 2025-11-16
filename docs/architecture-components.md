# ElizaOS - Component Interactions

This diagram shows how Actions, Providers, Evaluators, and Services interact within the ElizaOS runtime.

## Component Type Overview

```mermaid
graph TB
    subgraph "User Input Processing"
        UserMessage[User Message] --> Runtime[Agent Runtime]
    end

    subgraph "Context Gathering"
        Runtime --> ComposeState[Compose State]
        ComposeState --> Providers[Providers]

        subgraph "Provider Types"
            TimeProvider[Time Provider<br/>Current time context]
            FactProvider[Fact Provider<br/>Agent knowledge]
            BoredomProvider[Boredom Provider<br/>Engagement level]
            CustomProvider[Custom Providers<br/>Domain-specific context]
        end

        Providers --> TimeProvider
        Providers --> FactProvider
        Providers --> BoredomProvider
        Providers --> CustomProvider

        ComposeState --> State[State Object<br/>with Provider Data]
    end

    subgraph "Action Processing"
        Runtime --> ProcessActions[Process Actions]
        State --> ProcessActions

        ProcessActions --> ValidateAction[Validate Action]
        ValidateAction --> ExecuteAction[Execute Handler]

        ExecuteAction --> Services[Services Layer]

        subgraph "Service Types"
            WalletService[Wallet Service<br/>Blockchain operations]
            MessageService[Message Service<br/>Platform messaging]
            BrowserService[Browser Service<br/>Web automation]
            CustomService[Custom Services<br/>External integrations]
        end

        Services --> WalletService
        Services --> MessageService
        Services --> BrowserService
        Services --> CustomService

        ExecuteAction --> ActionCallback[Callback to User]
        ExecuteAction --> ActionResult[Action Result]
    end

    subgraph "Post-Processing"
        ActionResult --> Evaluators[Evaluators]

        subgraph "Evaluator Types"
            GoalEvaluator[Goal Evaluator<br/>Track objectives]
            FactEvaluator[Fact Evaluator<br/>Extract knowledge]
            CustomEvaluator[Custom Evaluators<br/>Learning & analysis]
        end

        Evaluators --> GoalEvaluator
        Evaluators --> FactEvaluator
        Evaluators --> CustomEvaluator

        Evaluators --> UpdateMemory[Update Memory]
    end

    UpdateMemory --> Database[(Database)]
    State --> LLM[LLM Generation]
    LLM --> Response[Agent Response]

    style Runtime fill:#4A90E2,stroke:#2E5C8A,stroke-width:3px,color:#fff
    style Providers fill:#50C878,stroke:#3A9B5C,stroke-width:2px,color:#fff
    style Services fill:#FF6B6B,stroke:#CC5555,stroke-width:2px,color:#fff
    style Evaluators fill:#FFB84D,stroke:#CC9333,stroke-width:2px,color:#fff
```

## Interaction Flow Sequence

```mermaid
sequenceDiagram
    participant User
    participant Runtime as Agent Runtime
    participant Provider as Providers
    participant Action as Action Handler
    participant Service as Service
    participant LLM as AI Model
    participant Evaluator as Evaluators
    participant DB as Database

    User->>Runtime: Send Message
    Runtime->>DB: Retrieve Memory
    DB-->>Runtime: Conversation History

    Note over Runtime,Provider: 1. Context Gathering Phase
    Runtime->>Provider: composeState(message)
    loop For each provider
        Provider->>Provider: get(runtime, message, state)
    end
    Provider-->>Runtime: State with Context

    Note over Runtime,LLM: 2. Model Generation Phase
    Runtime->>LLM: generateText(state + prompt)
    LLM-->>Runtime: Generated Response

    Note over Runtime,Service: 3. Action Execution Phase
    Runtime->>Action: processActions(message, state)
    Action->>Action: validate(message)

    alt Action is valid
        Action->>Service: Execute via Service
        Service->>Service: External API Call
        Service-->>Action: Result
        Action->>User: callback(response)
        Action-->>Runtime: ActionResult
    end

    Note over Runtime,DB: 4. Post-Processing Phase
    Runtime->>Evaluator: evaluate(message, state, responses)
    loop For each evaluator
        Evaluator->>Evaluator: handler(runtime, message)
        Evaluator->>DB: Store Learnings
    end

    Runtime->>DB: Save Memories
```

## Component Contracts

### Action Interface
```mermaid
graph LR
    subgraph "Action"
        Name[name: string]
        Description[description: string]
        Validate[validate Function]
        Handler[handler Function]
        Examples[examples?: Array]
    end

    subgraph "Handler Signature"
        Runtime[runtime: IAgentRuntime]
        Message[message: Memory]
        State[state?: State]
        Options[options?: HandlerOptions]
        Callback[callback?: HandlerCallback]
    end

    subgraph "Return Type"
        Result[ActionResult]
        Success[success: boolean]
        Text[text?: string]
        Data[data?: Record]
        Values[values?: Record]
    end

    Handler --> Runtime
    Handler --> Message
    Handler --> State
    Handler --> Options
    Handler --> Callback
    Handler --> Result

    Result --> Success
    Result --> Text
    Result --> Data
    Result --> Values

    style Handler fill:#7B68EE,stroke:#5A4BAD,stroke-width:2px,color:#fff
    style Result fill:#50C878,stroke:#3A9B5C,stroke-width:2px,color:#fff
```

### Provider Interface
```mermaid
graph LR
    subgraph "Provider"
        PName[name: string]
        PDescription[description?: string]
        Dynamic[dynamic?: boolean]
        Position[position?: number]
        Private[private?: boolean]
        Get[get Function]
    end

    subgraph "Get Signature"
        PRuntime[runtime: IAgentRuntime]
        PMessage[message: Memory]
        PState[state: State]
    end

    subgraph "Return Type"
        PResult[ProviderResult]
        PText[text?: string]
        PValues[values?: Record]
        PData[data?: Record]
    end

    Get --> PRuntime
    Get --> PMessage
    Get --> PState
    Get --> PResult

    PResult --> PText
    PResult --> PValues
    PResult --> PData

    style Get fill:#50C878,stroke:#3A9B5C,stroke-width:2px,color:#fff
    style PResult fill:#4A90E2,stroke:#2E5C8A,stroke-width:2px,color:#fff
```

### Service Abstract Class
```mermaid
graph LR
    subgraph "Service"
        ServiceType[static serviceType: string]
        CapDesc[capabilityDescription: string]
        Config[config?: Metadata]
        Start[static start Function]
        Stop[stop Function]
    end

    subgraph "Service Lifecycle"
        Init[Initialize]
        Connect[Connect to External API]
        Ready[Ready for Operations]
        Shutdown[Shutdown]
    end

    Start --> Init
    Init --> Connect
    Connect --> Ready
    Stop --> Shutdown

    style Start fill:#FF6B6B,stroke:#CC5555,stroke-width:2px,color:#fff
    style Ready fill:#50C878,stroke:#3A9B5C,stroke-width:2px,color:#fff
```

### Evaluator Interface
```mermaid
graph LR
    subgraph "Evaluator"
        EName[name: string]
        EDescription[description: string]
        Similes["similes?: string array"]
        AlwaysRun["alwaysRun?: boolean"]
        Examples[examples: Array]
        EValidate[validate Function]
        EHandler[handler Function]
    end

    subgraph "Purpose"
        PostProcess[Post-Interaction<br/>Processing]
        Learning[Extract Learnings]
        Memory[Update Memory]
        Analysis[Analyze Outcomes]
    end

    EHandler --> PostProcess
    PostProcess --> Learning
    PostProcess --> Memory
    PostProcess --> Analysis

    style EHandler fill:#FFB84D,stroke:#CC9333,stroke-width:2px,color:#fff
    style Learning fill:#7B68EE,stroke:#5A4BAD,stroke-width:2px,color:#fff
```

## Critical Distinctions

### ❌ Common Mistakes

```mermaid
graph TB
    subgraph "WRONG: Don't Do This"
        WrongProvider[Provider<br/>modifies state]
        WrongAction[Action<br/>directly calls API]
        WrongEvaluator[Evaluator<br/>parses user input]
        WrongService[Service<br/>handles user commands]
    end

    subgraph "RIGHT: Do This Instead"
        RightProvider[Provider<br/>returns read-only context]
        RightAction[Action<br/>delegates to Service]
        RightEvaluator[Evaluator<br/>post-processes results]
        RightService[Service<br/>manages external integrations]
    end

    style WrongProvider fill:#FF4444,stroke:#CC0000,stroke-width:2px,color:#fff
    style WrongAction fill:#FF4444,stroke:#CC0000,stroke-width:2px,color:#fff
    style WrongEvaluator fill:#FF4444,stroke:#CC0000,stroke-width:2px,color:#fff
    style WrongService fill:#FF4444,stroke:#CC0000,stroke-width:2px,color:#fff

    style RightProvider fill:#50C878,stroke:#3A9B5C,stroke-width:2px,color:#fff
    style RightAction fill:#50C878,stroke:#3A9B5C,stroke-width:2px,color:#fff
    style RightEvaluator fill:#50C878,stroke:#3A9B5C,stroke-width:2px,color:#fff
    style RightService fill:#50C878,stroke:#3A9B5C,stroke-width:2px,color:#fff
```

### Correct Architecture Pattern

```
User Input → Action → Service → External API/SDK
                ↓
            Provider → Context for Prompts
                ↓
        Post-Interaction → Evaluator → Learning/Memory
```

### Component Responsibilities

| Component | Purpose | State Management | External APIs |
|-----------|---------|------------------|---------------|
| **Action** | Handle user commands | ❌ Stateless | ❌ Via Services only |
| **Provider** | Supply context | ❌ Read-only | ❌ No API calls |
| **Service** | External integrations | ✅ Stateful | ✅ Direct API access |
| **Evaluator** | Post-processing | ✅ Can update memory | ❌ Analysis only |

## Example: Correct Implementation

### Action Handler Pattern
```typescript
// ✅ CORRECT: Action delegates to Service
handler: async (runtime, message, state, options, callback): Promise<ActionResult> => {
  // 1. Get service
  const walletService = runtime.getService<WalletService>('wallet');

  // 2. Execute via service
  const result = await walletService.transfer(params);

  // 3. Send user feedback via callback
  await callback({
    text: `Transfer successful: ${result.txHash}`,
    action: 'TRANSFER',
  });

  // 4. Return ActionResult for chaining
  return {
    success: true,
    text: 'Transfer completed',
    values: { txHash: result.txHash },
    data: { operation: 'transfer', result },
  };
}
```

### Provider Pattern
```typescript
// ✅ CORRECT: Provider returns read-only context
get: async (runtime, message, state): Promise<ProviderResult> => {
  const currentTime = new Date().toISOString();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return {
    text: `Current time: ${currentTime} (${timezone})`,
    values: {
      timestamp: currentTime,
      timezone: timezone,
    },
    data: {
      unix: Date.now(),
    },
  };
}
```

### Service Pattern
```typescript
// ✅ CORRECT: Service manages external integration
class WalletService extends Service {
  static serviceType = 'wallet';
  private provider: Provider;

  static async start(runtime: IAgentRuntime): Promise<Service> {
    const service = new WalletService(runtime);
    await service.connect();
    return service;
  }

  async transfer(params: TransferParams): Promise<TransferResult> {
    // Direct external API interaction
    const tx = await this.provider.sendTransaction(params);
    return { txHash: tx.hash };
  }
}
```

## Related Diagrams

- [High-Level Architecture](./architecture-high-level.md) - System overview
- [Monorepo Structure](./architecture-monorepo.md) - Package organization
- [Runtime & Plugin Architecture](./architecture-runtime-plugins.md) - Detailed plugin system
- [Memory & UUID System](./architecture-memory.md) - Agent memory architecture
- [Architecture Overview](./architecture-overview.md) - Index of all diagrams
