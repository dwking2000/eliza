import { ElizaClient, type ApiClientConfig } from '@elizaos/api-client';

// Detect if running in Tauri
function isTauri(): boolean {
  return '__TAURI__' in window || window.location.protocol === 'tauri:';
}

// Get the appropriate base URL for the API
function getApiBaseUrl(): string {
  // In Tauri, always use localhost:3000 for the Eliza server
  if (isTauri()) {
    return 'http://localhost:3000';
  }

  // In web mode, use the current origin (server + client on same host)
  return window.location.origin;
}

export function createApiClientConfig(): ApiClientConfig {
  const getLocalStorageApiKey = () => `eliza-api-key-${window.location.origin}`;
  const apiKey = localStorage.getItem(getLocalStorageApiKey());

  const config: ApiClientConfig = {
    baseUrl: getApiBaseUrl(),
    timeout: 30000,
    headers: {
      Accept: 'application/json',
    },
  };

  // Only include apiKey if it exists (don't pass undefined)
  if (apiKey) {
    config.apiKey = apiKey;
  }

  return config;
}

// Singleton instance
let elizaClientInstance: ElizaClient | null = null;

export function createElizaClient(): ElizaClient {
  if (!elizaClientInstance) {
    elizaClientInstance = ElizaClient.create(createApiClientConfig());
  }
  return elizaClientInstance;
}

export function getElizaClient(): ElizaClient {
  return createElizaClient();
}

// Function to reset the singleton (useful for API key changes)
export function resetElizaClient(): void {
  elizaClientInstance = null;
}

export function updateApiClientApiKey(newApiKey: string | null): void {
  const getLocalStorageApiKey = () => `eliza-api-key-${window.location.origin}`;

  if (newApiKey) {
    localStorage.setItem(getLocalStorageApiKey(), newApiKey);
  } else {
    localStorage.removeItem(getLocalStorageApiKey());
  }

  // Reset the singleton so it uses the new API key
  resetElizaClient();
}
