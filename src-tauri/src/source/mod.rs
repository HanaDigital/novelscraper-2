pub mod novelfull;

use isahc::prelude::*;

// pub struct Novel {
//     pub id: String,
//     pub source: String,
//     pub url: String,
//     pub title: String,
//     pub authors: Vec<String>,
//     pub genres: Vec<String>,
//     pub alternative_titles: Vec<String>,
//     pub description: Option<String>,
//     pub cover_url: Option<String>,
//     pub thumbnail_url: Option<String>,
//     pub latest_chapter_title: Option<String>,
//     pub total_chapters: Option<u32>,
//     pub status: Option<String>,
//     pub rating: Option<String>,
//     pub downloaded_chapters: u32,
//     pub is_downloaded: bool,
//     pub is_in_library: bool,
//     pub is_favorite: bool,
//     pub is_metadata_loaded: bool,
// }

#[derive(Clone, Debug, serde::Serialize)]
pub struct Chapter {
    pub title: String,
    pub url: String,
    pub content: Option<String>,
}

pub async fn download_novel(
    source: &str,
    url: &str,
    batch_size: usize,
) -> Result<Vec<Chapter>, String> {
    if source == "novelfull" {
        return novelfull::download_novel(url, batch_size).await;
    }
    Err(format!("Source {} not found", source))
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
