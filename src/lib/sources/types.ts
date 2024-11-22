export type NovelT = {
	id: string;
	source: NovelSource;
	url: string;
	title: string;
	authors: string[];
	genres: string[];
	alternativeTitles: string[];
	description?: string;
	coverURL?: string;
	thumbnailURL?: string;
	latestChapterTitle?: string;
	totalChapters?: number;
	downloadedChapters?: number;
	status?: string;
	isDownloaded?: boolean;
	isInLibrary?: boolean;
	isFavorite?: boolean;
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
}
