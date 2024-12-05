use std::{cmp::min, vec};

use futures::{future::join_all, FutureExt};
use kuchikiki::{traits::*, NodeRef};

use super::Chapter;

const NOVELFULL_URL: &str = "https://novelfull.com";

pub async fn download_novel(url: &str, batch_size: usize) -> Result<Vec<Chapter>, String> {
    let total_pages = get_total_pages(&url).await;

    let mut chapters: Vec<super::Chapter> = vec![];
    for page_num in 1..=total_pages {
        // Get all the chapters on the current page
        let mut page_chapters = get_page_chapter_urls(&url, page_num).await;

        let mut batch_index: usize = 0;
        while (batch_index * batch_size) < page_chapters.len() {
            // TODO: REPLACE
            let batch_start = batch_index * batch_size;
            let batch_end = min((batch_index + 1) * batch_size, page_chapters.len());
            let chapters_batch = &mut page_chapters[batch_start..batch_end];
            // let chapters_batch = &mut page_chapters[..=0];
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
            // break; //TODO: REMOVE
        }
        // break; //TODO: REMOVE
    }

    // println!("!!!chapters: {:?}", chapters);
    Ok(chapters)
}

async fn get_total_pages(url: &str) -> usize {
    let novel_html = super::fetch_html(url).await.unwrap();
    let document = kuchikiki::parse_html().one(novel_html);

    let mut total_pages = 1;

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

async fn get_page_chapter_urls(url: &str, page: usize) -> Vec<super::Chapter> {
    let page_html = super::fetch_html(&format!("{}?page={}", url, page))
        .await
        .unwrap();
    let document = kuchikiki::parse_html().one(page_html);

    let mut page_chapters: Vec<super::Chapter> = vec![];
    document
        .select("#list-chapter .row ul.list-chapter > li")
        .unwrap()
        .for_each(|chapterEl| {
            let chapterLinkEl = chapterEl.as_node().select("a").unwrap().next().unwrap();
            let title = chapterLinkEl.text_contents().trim().to_string();
            let url = chapterLinkEl
                .attributes
                .borrow()
                .get("href")
                .unwrap()
                .to_string();
            let chapter = super::Chapter {
                title,
                url: format!("{}{}", NOVELFULL_URL, url),
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
