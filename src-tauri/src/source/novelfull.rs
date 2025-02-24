use super::{Chapter, DownloadData, NovelData};
use futures::future::join_all;
use kuchikiki::traits::*;
use regex::Regex;
use std::time::Duration;
use std::{cmp::min, thread, vec};
use tauri::{AppHandle, Emitter};

pub async fn download_novel_chapters(
    app: &AppHandle,
    novel_data: NovelData,
) -> Result<Vec<Chapter>, String> {
    let total_pages = get_total_pages(&novel_data.novel_url).await;

    let mut chapters: Vec<super::Chapter> = vec![];
    for page_num in 1..=total_pages {
        // Get all the chapters on the current page
        let mut page_chapters =
            get_page_chapter_urls(&novel_data.source_url, &novel_data.novel_url, page_num).await;

        let mut batch_index: usize = 0;
        while (batch_index * novel_data.batch_size) < page_chapters.len() {
            thread::sleep(Duration::from_secs(novel_data.batch_delay as u64));
            let mut batch_start = batch_index * novel_data.batch_size;
            let batch_end = min(
                (batch_index + 1) * novel_data.batch_size,
                page_chapters.len(),
            );
            if novel_data.start_downloading_from_index >= batch_end {
                batch_index += 1;
                continue;
            }
            if novel_data.start_downloading_from_index > batch_start {
                batch_start = novel_data.start_downloading_from_index;
            }

            let chapters_batch = &mut page_chapters[batch_start..batch_end];
            let chapter_html_futures = chapters_batch
                .iter()
                .map(|chapter| super::fetch_html(&chapter.url));

            let chapter_html_vec = join_all(chapter_html_futures).await;
            for i in 0..chapter_html_vec.len() {
                let chapter_html = chapter_html_vec[i].as_ref().unwrap();
                get_chapter_content(&mut chapters_batch[i], chapter_html);
                chapters.push(chapters_batch[i].clone());
            }

            batch_index += 1;

            app.emit(
                "download-status",
                DownloadData {
                    novel_id: novel_data.novel_id.clone(),
                    status: super::DownloadStatus::Downloading,
                    downloaded_chapters_count: novel_data.start_downloading_from_index
                        + chapters.len(),
                    downloaded_chapters: Some(chapters_batch.to_vec()),
                },
            )
            .unwrap();
        }
    }

    Ok(chapters)
}

async fn get_total_pages(novel_url: &str) -> usize {
    let novel_html = super::fetch_html(novel_url).await.unwrap();
    let document = kuchikiki::parse_html().one(novel_html);

    let total_pages;

    let last_page_node = match document.select("#list-chapter ul.pagination > li.last a") {
        Ok(mut nodes) => nodes.next(),
        Err(_) => None,
    };

    match last_page_node {
        Some(node) => {
            let last_page_url = node.attributes.borrow().get("href").unwrap().to_string();
            let total_page = last_page_url
                .split("=")
                .last()
                .expect("Couldn't get last split at '='")
                .parse::<usize>()
                .unwrap_or(1);
            total_pages = total_page;
        }
        None => {
            total_pages = 1;
        }
    };

    return total_pages;
}

async fn get_page_chapter_urls(
    source_url: &str,
    novel_url: &str,
    page: usize,
) -> Vec<super::Chapter> {
    let page_html = super::fetch_html(&format!("{}?page={}", novel_url, page))
        .await
        .unwrap();
    let document = kuchikiki::parse_html().one(page_html);

    let mut page_chapters: Vec<super::Chapter> = vec![];
    document
        .select("#list-chapter .row ul.list-chapter > li")
        .unwrap()
        .for_each(|chapter_elem| {
            let chapter_link_elem = chapter_elem.as_node().select("a").unwrap().next().unwrap();
            let title = chapter_link_elem.text_contents().trim().to_string();
            let url = chapter_link_elem
                .attributes
                .borrow()
                .get("href")
                .unwrap()
                .to_string();
            let chapter = super::Chapter {
                title,
                url: format!("{}{}", source_url, url),
                content: None,
            };
            page_chapters.push(chapter);
        });

    return page_chapters;
}

fn get_chapter_content(chapter: &mut super::Chapter, chapter_html: &str) {
    let document = kuchikiki::parse_html().one(chapter_html);
    let chapter_content_node = document.select_first("#chapter-content").unwrap();
    let mut chapter_content_html = chapter_content_node.as_node().to_string();

    let class_re = Regex::new(r#"class=".*?""#).unwrap();
    chapter_content_html = class_re.replace_all(&chapter_content_html, "").to_string();
    let id_re = Regex::new(r#"id=".*?""#).unwrap();
    chapter_content_html = id_re.replace_all(&chapter_content_html, "").to_string();
    let style_re = Regex::new(r#"style=".*?""#).unwrap();
    chapter_content_html = style_re.replace_all(&chapter_content_html, "").to_string();
    let data_re = Regex::new(r#"data-.*?=".*?""#).unwrap();
    chapter_content_html = data_re.replace_all(&chapter_content_html, "").to_string();
    let comment_re = Regex::new(r#"<!--.*?-->"#).unwrap();
    chapter_content_html = comment_re
        .replace_all(&chapter_content_html, "")
        .to_string();
    let iframe_re = Regex::new(r#"<iframe.*?</iframe>"#).unwrap();
    chapter_content_html = iframe_re.replace_all(&chapter_content_html, "").to_string();
    let script_re = Regex::new(r#"<script.*?</script>"#).unwrap();
    chapter_content_html = script_re.replace_all(&chapter_content_html, "").to_string();
    let error_re = Regex::new(r#"<div align="left"[\s\S]*?If you find any errors \( Ads popup, ads redirect, broken links, non-standard content, etc.. \)[\s\S]*?<\/div>"#).unwrap();
    chapter_content_html = error_re.replace_all(&chapter_content_html, "").to_string();

    // Remove empty paragraphs
    chapter_content_html = chapter_content_html.replace("<p></p>", "");

    chapter.content = Some(chapter_content_html);
}
