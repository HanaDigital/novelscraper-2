import * as cheerio from 'cheerio';
import { ChapterT, NovelSource, NovelSourceProps, NovelT } from "./types";
import { invoke } from "@tauri-apps/api/core";
import { hashString } from "../utils";
import { testChapters } from "./test_chapters";

export class LightNovelPub extends NovelSource {

	constructor({ id, name, tags, logo, url }: NovelSourceProps) {
		super({ id, name, tags, logo, url });
	}

	async searchNovels(query: string): Promise<NovelT[]> {
		return [];
	}

	async getNovelMetadata(novel: NovelT): Promise<NovelT> {
		return novel;
	}

	async downloadNovel(novel: NovelT, batchSize: number, batchDelay: number, startFromChapterIndex = 0): Promise<ChapterT[]> {
		const chapters = await this.downloadChapters(novel, batchSize, batchDelay, startFromChapterIndex);
		return chapters;
	}
}
