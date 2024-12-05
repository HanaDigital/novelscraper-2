mod source;

#[tauri::command]
async fn download_novel(
    source: &str,
    url: &str,
    batch_size: usize,
) -> Result<Vec<source::Chapter>, String> {
    source::download_novel(source, url, batch_size).await
}

#[tauri::command]
async fn fetch_html(url: &str) -> Result<String, String> {
    source::fetch_html(url).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_persisted_scope::init())
        .invoke_handler(tauri::generate_handler![fetch_html, download_novel])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
