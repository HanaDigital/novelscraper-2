use futures::future::join_all;
use kuchikiki::traits::*;

pub async fn download_novel(url: &str, batch_size: usize) -> Result<Vec<String>, String> {
    let novel_html = super::fetch_html(url).await?;
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

    println!("total page: {}", total_pages);

    let mut chapters: Vec<super::Chapter> = vec![];
    for i in 0..total_pages {
        // Get all the chapters on the current page
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
                    url,
                    content: None,
                };
                page_chapters.push(chapter);
            });

        let mut batch_index: usize = 0;
        while (batch_index * batch_size) < page_chapters.len() {
            let batch_chapters =
                &page_chapters[batch_index * batch_size..(batch_index + 1) * batch_size];

            let mut downloaded_chapters_future = vec![];
            for chapter in batch_chapters {
                downloaded_chapters_future.push(downloaded_chapter(chapter.url.as_str()));
            }

            let downloaded_chapters = join_all(downloaded_chapters_future).await;
            batch_index += 1;
        }
    }

    Ok(vec![])
}

async fn downloaded_chapter(url: &str) -> Result<super::Chapter, String> {
    let chapter_html = super::fetch_html(url).await?;
    let document = kuchikiki::parse_html().one(chapter_html);

    return Err("Ok".to_string());
}
