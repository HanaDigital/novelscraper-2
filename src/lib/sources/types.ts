import { invoke } from "@tauri-apps/api/core";
import { SourceIDsT } from "./sources";
import { CloudflareHeadersT, getCloudflareHeaders } from "@/components/cloudflare-resolver";

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

export type DownloadDataT = {
	novel_id: string;
	status: "Downloading" | "Paused" | "Completed" | "Cancelled" | "Error";
	downloaded_chapters_count: number;
	downloaded_chapters?: ChapterT[];
}

export type NovelSourceProps = {
	id: string;
	name: string;
	tags: string[];
	logo: string;
	url: string;
	cloudflareProtected: boolean;
}
export class NovelSource {
	id: SourceIDsT;
	name: string;
	tags: string[];
	logo: string;
	url: string;
	cloudflareProtected: boolean;

	cfHeaders: CloudflareHeadersT | null;
	cfHeadersLastFetchedAt: Date | null;

	constructor({ id, name, tags, logo, url, cloudflareProtected }: NovelSourceProps) {
		this.id = id as SourceIDsT;
		this.name = name;
		this.tags = tags;
		this.logo = logo;
		this.url = url;
		this.cloudflareProtected = cloudflareProtected;

		this.cfHeaders = null;
		this.cfHeadersLastFetchedAt = null;
	}

	async searchNovels(query: string): Promise<NovelT[]> {
		throw new Error(`${this.name}: 'searchNovels' method not implemented.`);
	}

	async getNovelMetadata(novel: NovelT): Promise<NovelT> {
		throw new Error(`${this.name}: 'updateNovelMetadata' method not implemented.`);
	}

	async downloadNovel(novel: NovelT, batchSize: number, batchDelay: number, startFromChapterIndex = 0): Promise<ChapterT[]> {
		const chapters = await this.downloadChapters(novel, batchSize, batchDelay, startFromChapterIndex);
		return chapters;
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

	async fetchHTML(url: string): Promise<string> {
		await this.setCFHeaders();
		return await invoke<string>('fetch_html', { url, headers: this.cfHeaders });
	}

	async fetchImage(url: string): Promise<ArrayBuffer> {
		await this.setCFHeaders();
		return await invoke<ArrayBuffer>('fetch_image', { url, headers: this.cfHeaders });
	}

	private async setCFHeaders() {
		if (this.cloudflareProtected) {
			this.cfHeaders = await getCloudflareHeaders(this.url);
			this.cfHeadersLastFetchedAt = new Date();
		}
	}
}
