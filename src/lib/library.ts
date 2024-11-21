import { message } from "@tauri-apps/plugin-dialog";
import { exists, mkdir } from "@tauri-apps/plugin-fs";
import * as path from '@tauri-apps/api/path';

export const createLibraryPath = async (libraryRootPath: string, subDir = "") => {
    try {
        const dir = await path.join(libraryRootPath, subDir);
        const dirExists = await exists(dir);
        if (!dirExists) await mkdir(dir, { recursive: true });
    } catch (e) {
        console.error(e);
        await message("Couldn't create library root folder!", { title: 'NovelScraper Library', kind: 'error' });
    }
}