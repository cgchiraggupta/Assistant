use std::process::{Command, Child};
use std::sync::Mutex;
use tauri::Manager;

struct ServerProcess(Mutex<Option<Child>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_macos_permissions::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // Start the WebSocket server
      let server_process = start_websocket_server();
      app.manage(ServerProcess(Mutex::new(server_process)));

      Ok(())
    })
    .on_window_event(|window, event| {
      if let tauri::WindowEvent::CloseRequested { .. } = event {
        // Clean up server process when window closes
        if let Some(server) = window.app_handle().try_state::<ServerProcess>() {
          if let Ok(mut process) = server.0.lock() {
            if let Some(mut child) = process.take() {
              let _ = child.kill();
            }
          }
        }
      }
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

fn start_websocket_server() -> Option<Child> {
  use std::path::PathBuf;
  use std::env;
  
  // Get the absolute path to the server directory
  let server_path: PathBuf = if cfg!(debug_assertions) {
    // In development, get the absolute path from the current working directory
    // The src-tauri directory is in client/src-tauri, so we go up 2 levels then into server
    if let Ok(current_dir) = env::current_dir() {
      // If we're in client/src-tauri, go to client, then up to root, then into server
      if current_dir.ends_with("src-tauri") {
        current_dir.parent()
          .and_then(|p| p.parent())
          .map(|p| p.join("server"))
          .unwrap_or_else(|| PathBuf::from("../../server"))
      } else {
        // Fallback: try relative path
        PathBuf::from("../../server")
      }
    } else {
      PathBuf::from("../../server")
    }
  } else {
    // In production, the server is bundled with the app
    if let Ok(exe_path) = env::current_exe() {
      if let Some(exe_dir) = exe_path.parent() {
        exe_dir.join("server")
      } else {
        PathBuf::from("server")
      }
    } else {
      PathBuf::from("server")
    }
  };

  // Check if the server directory exists
  if !server_path.exists() {
    eprintln!("⚠️  Server directory not found at: {:?}", server_path);
    eprintln!("   Make sure the server directory exists at the project root.");
    return None;
  }

  // Check if index.js exists
  let index_js = server_path.join("index.js");
  if !index_js.exists() {
    eprintln!("⚠️  Server index.js not found at: {:?}", index_js);
    return None;
  }

  // Kill any existing process on port 4000 to prevent conflicts
  #[cfg(target_os = "macos")]
  {
    use std::process::Command as Cmd;
    if let Ok(output) = Cmd::new("lsof").args(&["-ti", ":4000"]).output() {
      if !output.stdout.is_empty() {
        let pid_str = String::from_utf8_lossy(&output.stdout);
        let pid = pid_str.trim();
        if !pid.is_empty() {
          let _ = Cmd::new("kill").args(&["-9", pid]).output();
        }
      }
    }
  }

  // Start the Node.js server
  let result = Command::new("node")
    .arg("index.js")
    .current_dir(&server_path)
    .stdout(std::process::Stdio::piped())
    .stderr(std::process::Stdio::piped())
    .spawn();

  match result {
    Ok(child) => {
      println!("✅ WebSocket server started successfully from: {:?}", server_path);
      Some(child)
    }
    Err(e) => {
      eprintln!("❌ Failed to start WebSocket server from {:?}: {}", server_path, e);
      eprintln!("   Make sure:");
      eprintln!("   1. Node.js is installed (run: node --version)");
      eprintln!("   2. Server directory exists: {:?}", server_path);
      eprintln!("   3. .env file has a valid OpenAI API key");
      None
    }
  }
}
