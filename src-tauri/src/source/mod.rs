pub mod novelfull;

use isahc::prelude::*;

#[derive(Clone, Debug, serde::Serialize)]
pub struct Chapter {
    pub title: String,
    pub url: String,
    pub content: Option<String>,
}

pub async fn download_novel(
    source_id: &str,
    source_url: &str,
    novel_url: &str,
    batch_size: usize,
) -> Result<Vec<Chapter>, String> {
    if source_id == "novelfull" {
        return novelfull::download_novel(source_url, novel_url, batch_size).await;
    }
    Err(format!("Source {} not found", source_id))
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
