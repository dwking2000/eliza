// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::net::TcpStream;
use std::process::{Child, Command};
use std::sync::{Arc, Mutex};
use tauri::Manager;
use serde::{Deserialize, Serialize};

// Store the server process so we can kill it when the app closes
static SERVER_PROCESS: once_cell::sync::Lazy<Arc<Mutex<Option<Child>>>> =
    once_cell::sync::Lazy::new(|| Arc::new(Mutex::new(None)));

// Store server configuration
static SERVER_CONFIG: once_cell::sync::Lazy<Arc<Mutex<ServerConfig>>> =
    once_cell::sync::Lazy::new(|| Arc::new(Mutex::new(ServerConfig::default())));

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ServerConfig {
    url: String,
    auto_start: bool,
}

impl Default for ServerConfig {
    fn default() -> Self {
        Self {
            url: "http://localhost:3000".to_string(),
            auto_start: true,
        }
    }
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_server_url() -> String {
    let config = SERVER_CONFIG.lock().unwrap();
    config.url.clone()
}

#[tauri::command]
fn set_server_url(url: String) -> Result<(), String> {
    let mut config = SERVER_CONFIG.lock().unwrap();
    config.url = url;
    Ok(())
}

#[tauri::command]
fn get_platform() -> String {
    #[cfg(target_os = "android")]
    return "android".to_string();

    #[cfg(target_os = "ios")]
    return "ios".to_string();

    #[cfg(target_os = "windows")]
    return "windows".to_string();

    #[cfg(target_os = "macos")]
    return "macos".to_string();

    #[cfg(target_os = "linux")]
    return "linux".to_string();

    #[cfg(not(any(target_os = "android", target_os = "ios", target_os = "windows", target_os = "macos", target_os = "linux")))]
    return "unknown".to_string();
}

#[tauri::command]
fn is_mobile() -> bool {
    #[cfg(any(target_os = "android", target_os = "ios"))]
    return true;

    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    return false;
}

// Check if the server is running by attempting to connect to the port
fn is_server_running() -> bool {
    match TcpStream::connect("127.0.0.1:3000") {
        Ok(_) => true,
        Err(_) => false,
    }
}

// Shutdown server when app exits (desktop only)
#[cfg(desktop)]
fn shutdown_server() {
    println!("Shutting down Eliza server...");
    let mut guard = SERVER_PROCESS.lock().unwrap();
    if let Some(ref mut child) = *guard {
        if let Err(e) = child.kill() {
            eprintln!("Failed to kill Eliza server: {}", e);
        } else {
            println!("Eliza server shut down successfully");
        }
    }
    *guard = None;
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Register cleanup for when app exits
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_server_url,
            set_server_url,
            get_platform,
            is_mobile
        ])
        .setup(|app| {
            // Only try to start server on desktop platforms
            #[cfg(desktop)]
            {
                if !is_server_running() {
                    println!("Starting Eliza server...");
                    match Command::new("elizaos")
                        .arg("start")
                        .spawn() {
                            Ok(child) => {
                                // Store the process so we can kill it when the app closes
                                let mut server_guard = SERVER_PROCESS.lock().unwrap();
                                *server_guard = Some(child);
                                println!("Eliza server process started");
                            },
                            Err(e) => {
                                eprintln!("Failed to start Eliza server: {}", e);
                                eprintln!("You may need to start the server manually or configure a remote server URL");
                            }
                        };
                } else {
                    println!("Eliza server is already running");
                }
            }

            #[cfg(mobile)]
            {
                println!("Running on mobile platform - server must be configured manually");
            }

            // Add event listener for app exit (desktop only)
            let _app_handle = app.handle();

            #[cfg(desktop)]
            {
                if let Some(main_window) = app.get_webview_window("main") {
                    main_window.on_window_event(move |event| {
                        if let tauri::WindowEvent::CloseRequested { .. } = event {
                            shutdown_server();
                        }
                    });
                }
            }

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|_app_handle, event| {
        #[cfg(desktop)]
        {
            if let tauri::RunEvent::Exit = event {
                shutdown_server();
            }
        }

        #[cfg(mobile)]
        {
            // No server to shutdown on mobile
            let _ = event;
        }
    });
}
