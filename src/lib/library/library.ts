import { message } from "@tauri-apps/plugin-dialog";
import { exists, mkdir, writeFile } from "@tauri-apps/plugin-fs";
import * as path from '@tauri-apps/api/path';
import { ChapterT, NovelT } from "../sources/types";
import { invoke } from "@tauri-apps/api/core";
import { SOURCES } from "../sources/sources";
import { load } from "@tauri-apps/plugin-store";

export const createLibraryDir = async (libraryRootPath: string, subDir = "") => {
	try {
		const dir = await path.join(libraryRootPath, subDir);
		const dirExists = await exists(dir);
		if (!dirExists) await mkdir(dir, { recursive: true });
	} catch (e) {
		console.error(e);
		await message("Couldn't create library root folder!", { title: 'NovelScraper Library', kind: 'error' });
	}
}

export const saveNovelEpub = async (novel: NovelT, epub: Uint8Array, libraryRootPath: string) => {
	try {
		const source = SOURCES[novel.source];
		const dir = await path.join(libraryRootPath, source.name);
		const dirExists = await exists(dir);
		if (!dirExists) await mkdir(dir, { recursive: true });

		const novelFilename = getFilenameFromStr(novel.title) + ".epub";
		const epubPath = await path.join(dir, novelFilename);
		await writeFile(epubPath, epub);

	} catch (e) {
		console.error(e);
		await message("Couldn't save novel epub!", { title: 'NovelScraper Library', kind: 'error' });
	}
}

export const saveNovelCover = async (novel: NovelT) => {
	try {
		const coverURL = novel.coverURL ?? novel.thumbnailURL;
		if (!coverURL) return;
		const dir = await path.appDataDir();
		const novelDir = await path.join(dir, "novel-data", novel.source as string, novel.id);
		const dirExists = await exists(novelDir);
		if (!dirExists) await mkdir(novelDir, { recursive: true });

		const cover = new Uint8Array(await invoke<ArrayBuffer>("fetch_image", { url: coverURL }));
		const coverPath = await path.join(novelDir, "cover.png");
		await writeFile(coverPath, cover);
		return coverPath;
	} catch (e) {
		console.error(e);
		await message("Couldn't save novel cover!", { title: 'NovelScraper Library', kind: 'error' });
	}
}

export const saveNovelChapters = async (novel: NovelT, chapters: ChapterT[]) => {
	try {
		const novelStore = await load(`novel-data/${novel.source}/${novel.id}.json`, { autoSave: false });
		novelStore.set("chapters", chapters);
		await novelStore.save();
		await novelStore.close();
	} catch (e) {
		console.error(e);
		await message("Couldn't save novel chapters!", { title: 'NovelScraper Library', kind: 'error' });
	}
}

export const getNovelChapters = async (novel: NovelT) => {
	try {
		const novelStore = await load(`novel-data/${novel.source}/${novel.id}.json`, { autoSave: false });
		const chapters = await novelStore.get("chapters") as ChapterT[] || undefined;
		await novelStore.close();
		return chapters ?? [];
	} catch (e) {
		console.error(e);
		await message("Couldn't get novel chapters!", { title: 'NovelScraper Library', kind: 'error' });
	}
	return [];
}

export const getFilenameFromStr = (str: string) => {
	return str.replace(/[^a-zA-Z0-9]/g, "_");
}
