use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;
use std::sync::{Arc, Mutex};
use std::io::Write;
use std::time::{Duration, Instant};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
/// Check whether an api-enhanced instance is already reachable.
fn external_api_ready() -> bool {
    let deadline = Instant::now() + Duration::from_millis(1200);
    while Instant::now() < deadline {
        if let Ok(mut stream) = std::net::TcpStream::connect("127.0.0.1:3000") {
            // Best-effort HTTP probe; a successful connection is enough.
            let probe = b"GET / HTTP/1.0\r\nHost: localhost\r\n\r\n";
            let _ = stream.set_write_timeout(Some(Duration::from_millis(200)));
            let _ = stream.write_all(probe);
            return true;
        }
        std::thread::sleep(Duration::from_millis(100));
    }
    false
}

pub fn run() {
    // Shared handle to the sidecar process. An Arc<Mutex> captured by
    // closures is used instead of Tauri managed state: window events can
    // fire before setup() registers state, and state() would panic there.
    let sidecar_child: Arc<Mutex<Option<CommandChild>>> = Arc::new(Mutex::new(None));

    let child_for_exit = Arc::clone(&sidecar_child);

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(move |app| {
            // Prefer an externally-managed API (e.g. user running `node app.js`);
            // only spawn the bundled sidecar if nothing is listening on :3000.
            let should_spawn = !external_api_ready();
            if should_spawn {
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
            } else {
                println!("[CloudTune] External API detected on localhost:3000; skipping sidecar");
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
