import { NovelSource, NovelSourceProps, NovelT } from "./types";


export class NovelFull extends NovelSource {

	constructor({ id, name, tags, logo, url }: NovelSourceProps) {
		super({ id, name, tags, logo, url });
	}

	async searchNovels(query: string): Promise<NovelT[]> {
		throw new Error("Method not implemented.");
	}
}
