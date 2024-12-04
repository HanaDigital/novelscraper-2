use kuchikiki::traits::*;

pub fn download_novel(url: &str) -> Result<Vec<String>, String> {
    let novel_html = super::fetch_html(url).unwrap();
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

    Ok(vec![])
}
