import { invoke } from "@tauri-apps/api/core";
import { NovelSource, NovelSourceProps, NovelT } from "./types";
import * as cheerio from 'cheerio';
import { novelFullSearchHTML } from "./test-data";

export class NovelFull extends NovelSource {

	constructor({ id, name, tags, logo, url }: NovelSourceProps) {
		super({ id, name, tags, logo, url });
	}

	async searchNovels(query: string): Promise<NovelT[]> {
		const encodedQuery = encodeURIComponent(query);
		const url = `${this.url}/search?keyword=${encodedQuery}`;
		// const response = await invoke<string>('fetch_html', { url });
		const response = novelFullSearchHTML;
		if (!response) throw new Error('Failed to fetch novels');
		return this.getNovelsFromSearchPage(response);
	}

	private async getNovelsFromSearchPage(html: string): Promise<NovelT[]> {
		const $ = cheerio.load(html);
		const novels: NovelT[] = [];
		$("#list-page .col-truyen-main .row").each((i, elem) => {
			const titleElem = $(elem).find("h3.truyen-title a")
			const title = titleElem.text().trim();
			let url = titleElem.attr("href") ?? "";
			if (url) url = `${this.url}${url}`;

			const author = $(elem).find(".author").text().trim() ?? "Unknown";
			const thumbnailURL = $(elem).find("img").attr("src");

			const novel: NovelT = {
				id: url,
				source: this,
				url,
				title,
				authors: [author],
				genres: [],
				alternativeTitles: [],
				thumbnailURL,
			};
			novels.push(novel);
		});
		return novels;
	}
}
