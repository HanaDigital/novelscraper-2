import { Store } from '@tauri-apps/plugin-store'
import { atomWithImmer } from 'jotai-immer'
import { atom } from 'jotai/vanilla'

export const appStoreAtom = atom<Store>();

export type AppStateT = {
    key: string;
    initialized: boolean;
    isSidePanelOpen: boolean;
}
export const appStateAtom = atomWithImmer<AppStateT>({
    key: 'appState',
    initialized: false,
    isSidePanelOpen: true,
})
