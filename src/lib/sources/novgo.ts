import * as cheerio from 'cheerio';
import { ChapterT, NovelSource, NovelSourceProps, NovelT } from "./types";
import { invoke } from "@tauri-apps/api/core";
import { hashString } from "../utils";
import { testChapters } from "./test_chapters";

export class Novgo extends NovelSource {

	constructor({ id, name, tags, logo, url }: NovelSourceProps) {
		super({ id, name, tags, logo, url });
	}

	async searchNovels(query: string): Promise<NovelT[]> {
		const encodedQuery = encodeURIComponent(query);
		const url = `${this.url}/?s=${encodedQuery}`;
		const response = await invoke<string>('fetch_html', { url });
		if (!response) throw new Error('Failed to search novels');
		return this.getNovelsFromSearchPage(response);
	}

	async getNovelMetadata(novel: NovelT): Promise<NovelT> {
		return novel;
	}

	async downloadNovel(novel: NovelT, batchSize: number, batchDelay: number, startFromChapterIndex = 0): Promise<ChapterT[]> {
		const chapters = await this.downloadChapters(novel, batchSize, batchDelay, startFromChapterIndex);
		return chapters;
	}

	private async getNovelsFromSearchPage(html: string): Promise<NovelT[]> {
		const $ = cheerio.load(html);
		console.log("!!!HTML:", html);
		const novels: NovelT[] = [];
		$(".c-tabs-item .row").each((i, elem) => {
			console.log("!!!ELEMENT:", elem);
			const titleElem = $(elem).find(".post-title h3 a")
			const title = titleElem.text().trim();
			let url = titleElem.attr("href") ?? "";

			const author = $(elem).find(".post-content mg_author .summary-content").text().trim() ?? "Unknown";
			let thumbnailURL = $(elem).find(".tab-thumb img").attr("src");

			const novel: NovelT = {
				id: hashString(url),
				source: this.id,
				url,
				title,
				authors: [author],
				genres: [],
				alternativeTitles: [],
				thumbnailURL,
				downloadedChapters: 0,
				isDownloaded: false,
				isInLibrary: false,
				isFavorite: false,
				isMetadataLoaded: false
			};
			novels.push(novel);
		});
		return novels;
	}
}
