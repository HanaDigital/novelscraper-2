import { atomWithImmer } from 'jotai-immer'
import { atom } from 'jotai/vanilla'
import { NovelT } from "./sources/types";
import { SourceIDsT, SOURCES } from "./sources/sources";

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


type searchHistoryT = { [key in SourceIDsT]: NovelT[]; }
const searchHistory: searchHistoryT = {} as searchHistoryT;
Object.keys(SOURCES).forEach((s) => {
	searchHistory[s as SourceIDsT] = [];
});
export const searchHistoryAtom = atomWithImmer<searchHistoryT>(searchHistory);

export const activeNovelAtom = atom<NovelT | null>(null);
