use tauri::{AppHandle, Emitter};

mod source;

#[tauri::command(rename_all = "snake_case")]
async fn download_novel_chapters(
    app: AppHandle,
    novel_id: &str,
    novel_url: &str,
    source_id: &str,
    source_url: &str,
    batch_size: usize,
    batch_delay: usize,
    start_downloading_from_index: usize,
) -> Result<Vec<source::Chapter>, String> {
    match source::download_novel_chapters(
        &app,
        source::NovelData {
            novel_id: novel_id.to_string(),
            novel_url: novel_url.to_string(),
            source_id: source_id.to_string(),
            source_url: source_url.to_string(),
            batch_size,
            batch_delay,
            start_downloading_from_index,
        },
    )
    .await
    {
        Ok(chapters) => {
            app.emit(
                "download-status",
                source::DownloadData {
                    novel_id: novel_id.to_string(),
                    status: source::DownloadStatus::Completed,
                    downloaded_chapters: chapters.len(),
                },
            )
            .unwrap();
            Ok(chapters)
        }
        Err(e) => {
            app.emit(
                "download-status",
                source::DownloadData {
                    novel_id: novel_id.to_string(),
                    status: source::DownloadStatus::Error,
                    downloaded_chapters: 0,
                },
            )
            .unwrap();
            Err(e)
        }
    }
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
            download_novel_chapters
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
