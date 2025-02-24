pub mod novelfull;

use isahc::prelude::*;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

#[derive(Clone, Debug, Serialize)]
pub struct NovelData {
    pub novel_id: String,
    pub novel_url: String,
    pub source_id: String,
    pub source_url: String,
    pub batch_size: usize,
    pub batch_delay: usize,
    pub start_downloading_from_index: usize,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Chapter {
    pub title: String,
    pub url: String,
    pub content: Option<String>,
}

pub async fn download_novel_chapters(
    app: &AppHandle,
    novel_data: NovelData,
) -> Result<Vec<Chapter>, String> {
    if novel_data.source_id == "novelfull" {
        return novelfull::download_novel_chapters(app, novel_data).await;
    }
    Err(format!("Source {} not found", novel_data.source_id))
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum DownloadStatus {
    Downloading,
    Paused,
    Completed,
    Cancelled,
    Error,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DownloadData {
    pub novel_id: String,
    pub status: DownloadStatus,
    pub downloaded_chapters_count: usize,
    pub downloaded_chapters: Option<Vec<Chapter>>,
}

pub async fn fetch_html(url: &str) -> Result<String, String> {
    let res_result = isahc::get(url);
    let mut res = match res_result {
        Ok(res) => res,
        Err(e) => {
            return Err(e.to_string());
        }
    };
    let text_result = res.text();
    match text_result {
        Ok(text) => Ok(text),
        Err(e) => {
            return Err(e.to_string());
        }
    }
}

pub async fn fetch_image(url: &str) -> Result<Vec<u8>, String> {
    let res_result = isahc::get(url);
    let mut res = match res_result {
        Ok(res) => res,
        Err(e) => {
            return Err(e.to_string());
        }
    };
    let bytes_result = res.bytes();
    match bytes_result {
        Ok(bytes) => Ok(bytes),
        Err(e) => {
            return Err(e.to_string());
        }
    }
}
