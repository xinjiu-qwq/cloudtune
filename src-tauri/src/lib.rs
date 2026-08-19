use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;
use std::sync::{Arc, Mutex};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Shared handle to the sidecar process. An Arc<Mutex> captured by
    // closures is used instead of Tauri managed state: window events can
    // fire before setup() registers state, and state() would panic there.
    let sidecar_child: Arc<Mutex<Option<CommandChild>>> = Arc::new(Mutex::new(None));

    let child_for_exit = Arc::clone(&sidecar_child);

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(move |app| {
            let shell = app.shell();
            // Base name matches externalBin in tauri.conf.json; Tauri
            // appends the target triple suffix automatically.
            let sidecar = shell
                .sidecar("api-enhanced")
                .expect("failed to create api-enhanced sidecar command");

            match sidecar.spawn() {
                Ok((_rx, child)) => {
                    *sidecar_child.lock().unwrap() = Some(child);
                    println!("[CloudTune] API sidecar spawned on localhost:3000");
                }
                Err(e) => {
                    eprintln!("[CloudTune] Failed to spawn API sidecar: {e}");
                }
            }
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(move |_app_handle, event| {
            // Kill the API process when the app exits so no orphan
            // server keeps port 3000 occupied.
            if let tauri::RunEvent::Exit = event {
                if let Some(child) = child_for_exit.lock().unwrap().take() {
                    let _ = child.kill();
                    println!("[CloudTune] API sidecar terminated");
                }
            }
        });
}
