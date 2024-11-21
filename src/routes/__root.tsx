import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { Link, Outlet, createRootRoute } from '@tanstack/react-router'
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Fragment, useEffect } from 'react';
import { load } from '@tauri-apps/plugin-store';
import { useAtom, useSetAtom } from 'jotai/react';
import { appStateAtom, AppStateT, appStoreAtom } from '@/lib/store';
import Loader from '@/components/loader';
import * as path from '@tauri-apps/api/path';

export const Route = createRootRoute({
    component: RootComponent,
})

function RootComponent() {
    const [appStore, setAppStore] = useAtom(appStoreAtom);
    const [appState, setAppState] = useAtom(appStateAtom);

    useEffect(() => {
        loadStore();
    }, []);

    useEffect(() => {
        if (!appStore) return;
        appStore.set(appState.key, appState);
    }, [appStore, appState]);

    const loadStore = async () => {
        const store = await load('store.json', { autoSave: true });
        setAppStore(store);

        const state = await store.get(appState.key) as AppStateT | undefined;
        const libraryRootPath = await path.join(await path.documentDir(), "NovelScraper-Library");
        if (state) {
            state.initialized = true;
            if (!state.libraryRootPath) state.libraryRootPath = libraryRootPath;
            setAppState(state);
        } else {
            setAppState((state) => {
                state.initialized = true;
                state.libraryRootPath = libraryRootPath;
                return state;
            });
        }
    }

    if (!appState.initialized) return <Loader />;
    return (
        <Fragment>
            <SidebarProvider defaultOpen={appState.isSidePanelOpen}>
                <AppSidebar />
                <Outlet />
            </SidebarProvider>
            <TanStackRouterDevtools position='bottom-right' />
        </Fragment>
    )
}
