use tauri::{Emitter, Manager};
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandChild;
use std::sync::Mutex;

struct SidecarState {
    child: Option<CommandChild>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(SidecarState { child: None })
        .setup(|app| {
            let shell = app.shell();
            // Sidecar binary name matches the base name in externalBin config
            // Tauri appends the platform triple automatically
            let sidecar = shell.sidecar("api-enhanced")
                .expect("failed to create sidecar command");

            match sidecar.spawn() {
                Ok((_rx, child)) => {
                    let state = app.state::<Mutex<SidecarState>>();
                    state.lock().unwrap().child = Some(child);
                    println!("[CloudTune] API sidecar spawned successfully");
                }
                Err(e) => {
                    eprintln!("[CloudTune] Failed to spawn API sidecar: {}", e);
                }
            }

            // Emit an event so the frontend knows the app is ready
            let _ = app.emit("sidecar-started", ());
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::Destroyed = event {
                let state = window.state::<Mutex<SidecarState>>();
                let mut guard = state.lock().unwrap();
                if let Some(child) = guard.child.take() {
                    let _ = child.kill();
                    println!("[CloudTune] API sidecar terminated");
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
