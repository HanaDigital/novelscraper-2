use super::{Chapter, DownloadData, NovelData};
use futures::future::join_all;
use kuchikiki::traits::*;
use std::time::Duration;
use std::{cmp::min, thread, vec};
use tauri::{AppHandle, Emitter};

pub async fn download_novel_chapters(
    app: &AppHandle,
    novel_data: NovelData,
) -> Result<Vec<Chapter>, String> {
    app.emit(
        "download-status",
        DownloadData {
            novel_id: novel_data.novel_id.clone(),
            status: super::DownloadStatus::Downloading,
            downloaded_chapters: novel_data.start_downloading_from_index,
        },
    )
    .unwrap();

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
                    downloaded_chapters: novel_data.start_downloading_from_index + chapters.len(),
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

    // Remove styles
    chapter_content_node
        .as_node()
        .as_element()
        .unwrap()
        .attributes
        .borrow_mut()
        .remove("style");

    // Remove iframes
    chapter_content_node
        .as_node()
        .select("iframe")
        .unwrap()
        .for_each(|iframe| iframe.as_node().detach());

    // Remove scripts
    chapter_content_node
        .as_node()
        .select("script")
        .unwrap()
        .for_each(|script| script.as_node().detach());

    // Remove a tags with 'sponsored' in rel attribute
    chapter_content_node
        .as_node()
        .select("a[rel~=\"sponsored\"]")
        .unwrap()
        .for_each(|img| img.as_node().detach());

    let mut chapter_content_html = chapter_content_node.as_node().to_string();

    // Remove empty paragraphs
    chapter_content_html = chapter_content_html.replace("<p></p>", "");

    chapter.content = Some(chapter_content_html);
}
