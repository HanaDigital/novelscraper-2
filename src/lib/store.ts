import { Store } from '@tauri-apps/plugin-store'
import { atomWithImmer } from 'jotai-immer'
import { atom } from 'jotai/vanilla'
import { NovelT } from "./sources/types";

export const appStoreAtom = atom<Store>();

export type AppStateT = {
	key: string;
	initialized: boolean;
	isSidePanelOpen: boolean;
	libraryRootPath: string;
}
export const appStateAtom = atomWithImmer<AppStateT>({
	key: 'appState',
	initialized: false,
	isSidePanelOpen: true,
	libraryRootPath: "",
})

export type ActiveNovelT = {
	backLink: string | null;
	novel: NovelT | null;
}
export const activeNovelAtom = atom({
	backLink: null,
	novel: null,
})
