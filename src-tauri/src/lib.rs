use isahc::prelude::*;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn fetch_html(url: &str) -> String {
    let res_result = isahc::get(url);
    let mut res = match res_result {
        Ok(res) => res,
        Err(e) => {
            println!("Error: {:?}", e);
            return "".to_string();
        }
    };
    let text_result = res.text();
    match text_result {
        Ok(text) => text,
        Err(e) => {
            println!("Error: {:?}", e);
            return "".to_string();
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_persisted_scope::init())
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![fetch_html])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
