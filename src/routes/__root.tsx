import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Fragment, useEffect, useState } from 'react';
import { load, Store } from '@tauri-apps/plugin-store';
import { useAtom, useSetAtom } from 'jotai/react';
import { appStateAtom, AppStateT, downloadStatusAtom, libraryStateAtom, LibraryStateT } from '@/lib/store';
import Loader from '@/components/loader';
import * as path from '@tauri-apps/api/path';
import { createLibraryDir } from '@/lib/library/library';
import { listen } from "@tauri-apps/api/event";
import { DownloadData } from "@/lib/sources/types";

export const Route = createRootRoute({
	component: RootComponent,
})

function RootComponent() {
	const [appInitialized, setAppInitialized] = useState(false);
	const [appStore, setAppStore] = useState<Store>();
	const [appState, setAppState] = useAtom(appStateAtom);
	const [libraryState, setLibraryState] = useAtom(libraryStateAtom);
	const setDownloadStatus = useSetAtom(downloadStatusAtom);

	useEffect(() => {
		loadStore();


		const downloadStatusListenerP = listen<DownloadData>("download-status", (event) => {
			setDownloadStatus((state) => {
				const data = event.payload as DownloadData;
				state[data.novel_id] = data;
			})
		});

		return () => {
			downloadStatusListenerP.then((unsub) => unsub());
		}
	}, []);

	useEffect(() => {
		if (!appInitialized || !appStore) return;
		appStore.set(appState.key, appState);
	}, [appInitialized, appStore, appState]);

	useEffect(() => {
		if (!appInitialized || !appStore) return;
		appStore.set(libraryState.key, libraryState);
	}, [appInitialized, appStore, libraryState]);

	const loadStore = async () => {
		const store = await load('store.json');
		setAppStore(store);

		try {
			let app = await store.get(appState.key) as AppStateT | undefined;
			if (!app) app = appState;

			if (!app.libraryRootPath) app.libraryRootPath = await path.join(await path.documentDir(), "NovelScraper-Library");
			setAppState(app);

			await createLibraryDir(app.libraryRootPath);
		} catch (e) {
			console.error(e);
		}

		try {
			let library = await store.get(libraryState.key) as LibraryStateT | undefined;
			if (!library) library = libraryState;
			setLibraryState(library);
		} catch (e) {
			console.error(e);
		}

		setAppInitialized(true);
	}

	if (!appInitialized) return <Loader />;
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
