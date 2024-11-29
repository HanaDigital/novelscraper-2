export type NovelT = {
	id: string;
	source: string;
	url: string;
	title: string;
	authors: string[];
	genres: string[];
	alternativeTitles: string[];
	isDownloaded: boolean;
	isInLibrary: boolean;
	isFavorite: boolean;
	isMetadataLoaded: boolean;
	description?: string;
	coverURL?: string;
	thumbnailURL?: string;
	latestChapterTitle?: string;
	totalChapters?: number;
	downloadedChapters?: number;
	status?: string;
	rating?: string;
}

export type NovelSourceProps = {
	id: string;
	name: string;
	tags: string[];
	logo: string;
	url: string;
}
export class NovelSource {
	id: string;
	name: string;
	tags: string[];
	logo: string;
	url: string;

	constructor({ id, name, tags, logo, url }: NovelSourceProps) {
		this.id = id;
		this.name = name;
		this.tags = tags;
		this.logo = logo;
		this.url = url;
	}

	async searchNovels(query: string): Promise<NovelT[]> {
		throw new Error(`${this.name}: 'searchNovels' method not implemented.`);
	}

	async updateNovelMetadata(novel: NovelT): Promise<NovelT> {
		throw new Error(`${this.name}: 'updateNovelMetadata' method not implemented.`);
	}
}
