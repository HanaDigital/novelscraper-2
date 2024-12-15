mod source;

#[tauri::command(rename_all = "snake_case")]
async fn download_novel(
    source_id: &str,
    source_url: &str,
    novel_url: &str,
    batch_size: usize,
) -> Result<Vec<source::Chapter>, String> {
    source::download_novel(source_id, source_url, novel_url, batch_size).await
}

#[tauri::command]
async fn fetch_html(url: &str) -> Result<String, String> {
    source::fetch_html(url).await
}

#[tauri::command]
async fn fetch_image(url: &str) -> Result<Vec<u8>, String> {
    source::fetch_image(url).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_persisted_scope::init())
        .invoke_handler(tauri::generate_handler![
            fetch_html,
            fetch_image,
            download_novel
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
