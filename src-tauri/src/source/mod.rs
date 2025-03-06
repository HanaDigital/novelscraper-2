pub mod novelbin;
pub mod novelfull;
pub mod types;

use std::collections::HashMap;

use isahc::{prelude::*, Request};
use tauri::AppHandle;
use types::{Chapter, DownloadStatus, NovelData};

pub async fn download_novel_chapters(
    app: &AppHandle,
    novel_data: NovelData,
) -> Result<Vec<Chapter>, String> {
    if novel_data.source_id == "novelfull" {
        return novelfull::download_novel_chapters(app, novel_data).await;
    } else if novel_data.source_id == "novelbin" {
        return novelbin::download_novel_chapters(app, novel_data).await;
    }
    Err(format!("Source {} not found", novel_data.source_id))
}

pub async fn fetch_html(
    url: &str,
    headers: &Option<HashMap<String, String>>,
) -> Result<String, String> {
    let mut req_builder = Request::get(url);
    println!("!!!URL & HEADERS: {}\n{:?}", url, headers);
    if headers.is_some() {
        for (key, value) in headers.as_ref().unwrap() {
            req_builder = req_builder.header(key, value);
        }
    }

    let res_result = req_builder.body(()).unwrap().send();
    let mut res = match res_result {
        Ok(res) => res,
        Err(e) => {
            return Err(e.to_string());
        }
    };
    let text_result = res.text();
    // println!("!!!URL Response: {:?}", text_result);
    match text_result {
        Ok(text) => Ok(text),
        Err(e) => {
            return Err(e.to_string());
        }
    }
}

pub async fn fetch_image(
    url: &str,
    headers: &Option<HashMap<String, String>>,
) -> Result<Vec<u8>, String> {
    let mut req_builder = Request::get(url);
    if headers.is_some() {
        for (key, value) in headers.as_ref().unwrap() {
            req_builder = req_builder.header(key, value);
        }
    }

    let res_result = req_builder.body(()).unwrap().send();
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
