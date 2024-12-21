import { createFileRoute } from '@tanstack/react-router'
import { P, TinyP } from '@/components/typography';
import { Button } from '@/components/ui/button';
import { open } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { useAtom } from 'jotai/react';
import { appStateAtom } from '@/lib/store';
import * as path from '@tauri-apps/api/path';
import Page from '@/components/page';
import { createLibraryDir } from '@/lib/library/library';
import { InfoCircle, Minus, Plus } from '@mynaui/icons-react';

export const Route = createFileRoute('/settings')({
	component: RouteComponent,
})

function RouteComponent() {
	const [appState, setAppState] = useAtom(appStateAtom);

	const handleSavePath = async () => {
		const libraryParentPath = await path.resolve(appState.libraryRootPath, "..");
		const dir = await open({
			multiple: false,
			directory: true,
			recursive: true,
			defaultPath: libraryParentPath,
			title: "Select a directory",
		});
		if (!dir) return;
		const newLibraryRootPath = await path.join(dir, "NovelScraper-Library");
		await createLibraryDir(newLibraryRootPath);
		setAppState((state) => {
			state.libraryRootPath = newLibraryRootPath;
			return state;
		});
	}

	const handleIncreaseBatchSize = async () => {
		if (appState.downloadBatchSize >= 5) return;
		setAppState((state) => {
			state.downloadBatchSize += 1;
			return state;
		});
	}

	const handleDecreaseBatchSize = async () => {
		if (appState.downloadBatchSize <= 1) return;
		setAppState((state) => {
			state.downloadBatchSize -= 1;
			return state;
		});
	}

	const handleIncreaseBatchDelay = async () => {
		if (appState.downloadBatchDelay >= 10) return;
		setAppState((state) => {
			state.downloadBatchDelay += 1;
			return state;
		});
	}

	const handleDecreaseBatchDelay = async () => {
		if (appState.downloadBatchDelay <= 0) return;
		setAppState((state) => {
			state.downloadBatchDelay -= 1;
			return state;
		});
	}

	const handleWriteFile = async () => {
		const contents = JSON.stringify({ notifications: true });
		const filePath = await path.join(appState.libraryRootPath, "config.json");
		await writeTextFile(filePath, contents);
	}

	return (
		<Page>
			<div className="flex flex-col">
				<TinyP className="mb-2">Library Root Path</TinyP>
				<div className="flex items-center bg-card border rounded pl-2">
					<P className='flex-1'>{appState.libraryRootPath}</P>
					<Button onClick={handleSavePath}>Change Path</Button>
				</div>
				<TinyP className="text-muted-foreground flex gap-1 items-center">
					<InfoCircle width={15} />
					The <b><i>NovelScraper-Library</i></b> folder will be created in the selected path.
				</TinyP>
			</div>

			<div className="flex flex-col">
				<TinyP className="mb-2">Batch Size</TinyP>
				<div className="flex items-center gap-2">
					<Button size="icon" disabled={appState.downloadBatchSize <= 1} onClick={handleDecreaseBatchSize}><Minus /></Button>
					<P className='bg-card border rounded px-4 h-full'>{appState.downloadBatchSize}</P>
					<Button size="icon" disabled={appState.downloadBatchSize >= 5} onClick={handleIncreaseBatchSize}><Plus /></Button>
				</div>
				<TinyP className="text-muted-foreground flex gap-1 items-center">
					<InfoCircle width={15} />
					The number of chapters to download in a single batch. Makes downloading faster but may result in a ban.
				</TinyP>
			</div>

			<div className="flex flex-col">
				<TinyP className="mb-2">Batch Delay</TinyP>
				<div className="flex items-center gap-2">
					<Button size="icon" disabled={appState.downloadBatchDelay <= 0} onClick={handleDecreaseBatchDelay}><Minus /></Button>
					<P className='bg-card border rounded px-4 h-full'>{appState.downloadBatchDelay}</P>
					<Button size="icon" disabled={appState.downloadBatchDelay >= 10} onClick={handleIncreaseBatchDelay}><Plus /></Button>
				</div>
				<TinyP className="text-muted-foreground flex gap-1 items-center">
					<InfoCircle width={15} />
					A delay in seconds between each batch. Makes downloading slower but may help against getting a ban.
				</TinyP>
			</div>
		</Page>
	);
}
