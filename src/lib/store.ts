import { atomWithImmer } from 'jotai-immer'
import { atom } from 'jotai/vanilla'
import { NovelT } from "./sources/types";
import { SourceIDsT, SOURCES } from "./sources/sources";

export type AppStateT = {
	key: string;
	isSidePanelOpen: boolean;
	libraryRootPath: string;
}
export const appStateAtom = atomWithImmer<AppStateT>({
	key: 'appState',
	isSidePanelOpen: true,
	libraryRootPath: "",
})

export type LibraryStateT = {
	key: string;
	novels: { [key: string]: NovelT };
}
export const libraryStateAtom = atomWithImmer<LibraryStateT>({
	key: 'libraryState',
	novels: {},
});


type searchHistoryT = { [key in SourceIDsT]: NovelT[]; }
const searchHistory: searchHistoryT = {} as searchHistoryT;
Object.keys(SOURCES).forEach((s) => {
	searchHistory[s as SourceIDsT] = [];
});
export const searchHistoryAtom = atomWithImmer<searchHistoryT>(searchHistory);

export const activeNovelAtom = atom<NovelT | null>(null);
