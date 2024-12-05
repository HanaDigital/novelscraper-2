import * as cheerio from 'cheerio';
import { ChapterT, NovelSource, NovelSourceProps, NovelT } from "./types";
import { invoke } from "@tauri-apps/api/core";
import { novelFullSearchHTML } from "./test-data";
import { hashString } from "../utils";

export class NovelFull extends NovelSource {

	constructor({ id, name, tags, logo, url }: NovelSourceProps) {
		super({ id, name, tags, logo, url });
	}

	async searchNovels(query: string): Promise<NovelT[]> {
		const encodedQuery = encodeURIComponent(query);
		const url = `${this.url}/search?keyword=${encodedQuery}`;
		const response = await invoke<string>('fetch_html', { url });
		// const response = novelFullSearchHTML;
		if (!response) throw new Error('Failed to search novels');
		return this.getNovelsFromSearchPage(response);
	}

	async getNovelMetadata(novel: NovelT): Promise<NovelT> {
		const response = await invoke<string>('fetch_html', { url: novel.url });
		if (!response) throw new Error('Failed to fetch novel');
		const $ = cheerio.load(response);

		// Get novel metadata
		const novelInfoElem = $(".col-info-desc");
		const title = novelInfoElem.find(".desc > h3.title").first().text().trim();
		const rating = novelInfoElem.find(".small").text().trim().replace("Rating: ", "").replace(/from[\S\s]*?(?=\d)/g, "from ");
		const description = novelInfoElem.find(".desc-text").text().trim();
		const latestChapterTitle = novelInfoElem.find(".l-chapter > ul.l-chapters > li").first().text().trim();
		const coverURL = novelInfoElem.find(".info-holder .book img").attr("src");

		const infoHolderElems = $(".info-holder > .info > div");
		const authors = infoHolderElems.eq(0).find("a").map((i, elem) => $(elem).text().trim()).get();
		const alternativeTitles = infoHolderElems.eq(1).text().replace("Alternative names:", "").trim().split(", ");
		const genres = infoHolderElems.eq(2).find("a").map((i, elem) => $(elem).text().trim()).get();
		const status = infoHolderElems.eq(4).find("a").text().trim();

		// Get chapters per page
		const chaptersElem = $("#list-chapter");
		let chaptersPerPage = 0;
		chaptersElem.find("ul.list-chapter").each((i, elem) => {
			chaptersPerPage += $(elem).find("li").length;
		});

		// Get total chapters
		let totalPages = 1;
		let totalChapters = 0;
		const lastPageURL = chaptersElem.find("ul.pagination > li.last").find("a").attr("href");
		if (lastPageURL) {
			totalPages = parseInt(lastPageURL.split("=").pop() ?? "1");
			totalChapters = chaptersPerPage * (totalPages - 1);

			try {
				const lastPageUri = new URL(`${novel.url}?page=${totalPages}`);
				const lastPageRes = await fetch(lastPageUri.toString());
				const lastPageDocument = cheerio.load(await lastPageRes.text());
				lastPageDocument("ul.list-chapter").each((i, elem) => {
					totalChapters += $(elem).find("li").length;
				});
			} catch (e) {
				console.error(e);
			}
		} else {
			totalChapters = chaptersPerPage;
		}

		// Update novel
		novel.title = title ?? novel.title;
		novel.authors = authors ?? novel.authors;
		novel.genres = genres ?? novel.genres;
		novel.alternativeTitles = alternativeTitles ?? novel.alternativeTitles;
		novel.description = description ?? novel.description ?? "No description available.";
		novel.coverURL = coverURL ? `${this.url}${coverURL}` : novel.coverURL;
		novel.rating = rating ?? novel.rating ?? "No rating available.";
		novel.latestChapterTitle = latestChapterTitle ?? novel.latestChapterTitle;
		novel.totalChapters = totalChapters > 0 ? totalChapters : novel.totalChapters;
		novel.status = status ?? novel.status ?? "Unknown";

		return novel;
	}

	async downloadNovel(novel: NovelT): Promise<NovelT> {
		const response = await invoke<string>('download_novel', { source: this.id, url: novel.url, batchSize: 10 });
		console.log(response);
		return novel;
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
			let thumbnailURL = $(elem).find("img").attr("src");
			if (thumbnailURL) thumbnailURL = `${this.url}${thumbnailURL}`;

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

	private async getChapterContent(chapter: ChapterT): Promise<ChapterT> {
		const chapterContent = await invoke<string>('fetch_html', { url: chapter.url });
		if (!chapterContent) throw new Error('Failed to fetch chapter content');
		const $ = cheerio.load(chapterContent);

		const contentEl = $("#chapter-content");
		contentEl.find("script").remove();
		contentEl.find("iframe").remove();

		let content = contentEl.html();
		if (!content) throw new Error("Chapter content not found");
		content = content
			?.replace(/class=".*?"/g, "")
			.replace(/id=".*?"/g, "")
			.replace(/style=".*?"/g, "")
			.replace(/data-.*?=".*?"/g, "")
			.replace(/<!--.*?-->/g, "")
			.replace(
				/<div align="left"[\s\S]*?If you find any errors \( Ads popup, ads redirect, broken links, non-standard content, etc.. \)[\s\S]*?<\/div>/g,
				""
			);

		const titleHTML = `<h1>${chapter.title}</h1>`;
		const propagandaHTML = NovelSource.getPropagandaHTML();

		content = `${titleHTML}\n${content}\n${propagandaHTML}`;
		chapter.content = content;
		return chapter;
	}
}
