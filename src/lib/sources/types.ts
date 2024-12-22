import { invoke } from "@tauri-apps/api/core";
import { SourceIDsT } from "./sources";

export type ChapterT = {
	title: string;
	url: string;
	content?: string;
}

export type NovelT = {
	id: string;
	source: SourceIDsT;
	url: string;
	title: string;
	authors: string[];
	genres: string[];
	alternativeTitles: string[];
	description?: string;
	coverURL?: string;
	thumbnailURL?: string;
	localCoverPath?: string;
	latestChapterTitle?: string;
	totalChapters?: number;
	status?: string;
	rating?: string;
	downloadedChapters: number;
	isDownloaded: boolean;
	isInLibrary: boolean;
	isFavorite: boolean;
	isMetadataLoaded: boolean;
	addedToLibraryAt?: string;
	updatedMetadataAt?: string;
	updatedChaptersAt?: string;
	downloadedAt?: string;
}

export type NovelSourceProps = {
	id: string;
	name: string;
	tags: string[];
	logo: string;
	url: string;
}

export type DownloadData = {
	novel_id: string;
	status: "downloading" | "paused" | "completed" | "error";
	downloaded_chapters: number;
}
export class NovelSource {
	id: SourceIDsT;
	name: string;
	tags: string[];
	logo: string;
	url: string;

	constructor({ id, name, tags, logo, url }: NovelSourceProps) {
		this.id = id as SourceIDsT;
		this.name = name;
		this.tags = tags;
		this.logo = logo;
		this.url = url;
	}

	async searchNovels(query: string): Promise<NovelT[]> {
		throw new Error(`${this.name}: 'searchNovels' method not implemented.`);
	}

	async getNovelMetadata(novel: NovelT): Promise<NovelT> {
		throw new Error(`${this.name}: 'updateNovelMetadata' method not implemented.`);
	}

	async downloadNovel(novel: NovelT, batchSize: number, batchDelay: number, startFromChapterIndex = 0): Promise<ChapterT[]> {
		throw new Error(`${this.name}: 'downloadNovel' method not implemented.`);
	}

	async downloadChapters(novel: NovelT, batchSize: number, batchDelay: number, startFromChapterIndex = 0): Promise<ChapterT[]> {
		const chapters = await invoke<ChapterT[]>('download_novel_chapters', {
			novel_id: novel.id,
			novel_url: novel.url,
			source_id: this.id,
			source_url: this.url,
			batch_size: batchSize,
			batch_delay: batchDelay,
			start_downloading_from_index: startFromChapterIndex,
		});
		return chapters;
	}

	static getPropagandaHTML(): string {
		return `<br />
<br />
<p>This novel was scraped using <a href="https://github.com/HanaDigital/NovelScraper">NovelScraper</a>, a free and open-source novel scraping app.</p>`;
	}
}
