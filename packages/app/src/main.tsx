import React from 'react';
import ReactDOM from 'react-dom/client';
import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

// Component that will connect to the ElizaOS server
function ElizaWrapper() {
  const [status, setStatus] = useState<'starting' | 'running' | 'error' | 'config'>('starting');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isServerAccessible, setIsServerAccessible] = useState(false);
  const [serverUrl, setServerUrl] = useState<string>('http://localhost:3000');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [platform, setPlatform] = useState<string>('unknown');
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Get platform information
  useEffect(() => {
    const getPlatformInfo = async () => {
      try {
        const platformName = await invoke<string>('get_platform');
        const mobileStatus = await invoke<boolean>('is_mobile');
        const url = await invoke<string>('get_server_url');

        setPlatform(platformName);
        setIsMobile(mobileStatus);
        setServerUrl(url);

        // On mobile, prompt for server URL if not set
        if (mobileStatus && url === 'http://localhost:3000') {
          setStatus('config');
        }
      } catch (err) {
        console.error('Failed to get platform info:', err);
      }
    };

    getPlatformInfo();
  }, []);

  // Function to check if server is accessible
  const checkServerAccessibility = async (url: string) => {
    try {
      await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
      });
      return true;
    } catch (e) {
      return false;
    }
  };

  // Handle server URL update
  const handleUrlSubmit = async () => {
    if (!customUrl) return;

    try {
      // Ensure URL has protocol
      let url = customUrl;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      await invoke('set_server_url', { url });
      setServerUrl(url);
      setStatus('starting');
      setRetryCount((prev) => prev + 1);
    } catch (err) {
      console.error('Failed to set server URL:', err);
      setError('Failed to set server URL');
    }
  };

  // Check server connectivity
  useEffect(() => {
    if (status !== 'starting') return;

    const checkServer = async () => {
      try {
        setStatus('running');

        // Start polling to check if the server is accessible
        const checkInterval = setInterval(async () => {
          const isAccessible = await checkServerAccessibility(serverUrl);
          if (isAccessible) {
            setIsServerAccessible(true);
            clearInterval(checkInterval);
          }
        }, 1000);

        // Clear interval after 60 seconds to prevent infinite polling
        setTimeout(() => {
          clearInterval(checkInterval);
          if (!isServerAccessible) {
            setStatus('error');
            setError(
              isMobile
                ? 'Could not connect to server. Please check the server URL and ensure the ElizaOS server is running and accessible.'
                : 'ElizaOS server is not responding. Please ensure it is running or configure a custom server URL.'
            );
          }
        }, 60000);
      } catch (err: unknown) {
        console.error('Failed to connect to server:', err);
        setStatus('error');
        setError(
          `Failed to connect to server: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    };

    checkServer();
  }, [retryCount, status, serverUrl, isMobile, isServerAccessible]);

  // Retry handler
  const handleRetry = () => {
    setStatus('starting');
    setError(null);
    setIsServerAccessible(false);
    setRetryCount((prev) => prev + 1);
  };

  // Show server configuration screen
  if (status === 'config') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '20px',
          textAlign: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <h2>Configure ElizaOS Server</h2>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Enter the URL of your ElizaOS server
        </p>
        <input
          type="text"
          placeholder="https://your-server.com"
          value={customUrl}
          onChange={(e) => setCustomUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
          style={{
            width: '300px',
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            marginBottom: '10px',
          }}
        />
        <button
          type="button"
          onClick={handleUrlSubmit}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0078d7',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Connect
        </button>
      </div>
    );
  }

  // If the server is running and accessible, show the iframe
  if (status === 'running' && isServerAccessible) {
    return (
      <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0 }}>
        <iframe
          src={serverUrl}
          title="ElizaOS Client"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
        />
      </div>
    );
  }

  // Show loading or error message
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '20px',
        textAlign: 'center',
        fontFamily: 'sans-serif',
      }}
    >
      {status === 'error' ? (
        <>
          <h2 style={{ color: 'red' }}>Connection Error</h2>
          <p style={{ maxWidth: '500px', marginBottom: '20px' }}>{error}</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={handleRetry}
              style={{
                padding: '10px 20px',
                backgroundColor: '#0078d7',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => setStatus('config')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#5c5c5c',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              Configure Server
            </button>
          </div>
          <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            Platform: {platform} {isMobile ? '(Mobile)' : '(Desktop)'}
          </p>
        </>
      ) : (
        <>
          <h2>Connecting to ElizaOS...</h2>
          <p>
            {isMobile
              ? 'Connecting to remote server...'
              : 'Please wait while we start the backend services.'}
          </p>
          <div
            style={{
              marginTop: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: '2px solid #ccc',
                borderTopColor: '#0078d7',
                animation: 'spin 1s linear infinite',
              }}
            />
            <style>
              {`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
          <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            Server URL: {serverUrl}
          </p>
        </>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ElizaWrapper />
  </React.StrictMode>
);
