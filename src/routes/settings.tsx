import { createFileRoute } from '@tanstack/react-router'
import { H4, P } from '@/components/typography';
import { Button } from '@/components/ui/button';
import { open } from '@tauri-apps/plugin-dialog';
import { writeTextFile, exists, mkdir } from '@tauri-apps/plugin-fs';
import { useAtom } from 'jotai/react';
import { appStateAtom } from '@/lib/store';
import * as path from '@tauri-apps/api/path';
import Page from '@/components/page';

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
        const dirExists = await exists(newLibraryRootPath);
        if (!dirExists) await mkdir(newLibraryRootPath, { recursive: true });
        setAppState((state) => {
            state.libraryRootPath = newLibraryRootPath;
            return state;
        });
    }

    const handleWriteFile = async () => {
        const contents = JSON.stringify({ notifications: true });
        const filePath = await path.join(appState.libraryRootPath, "config.json");
        await writeTextFile(filePath, contents);
    }

    return (
        <Page header={<H4>Settings</H4>}>
            <div className="flex items-center bg-card border rounded pl-2">
                <P className='flex-1'>{appState.libraryRootPath}</P>
                <Button onClick={handleSavePath}>Change Path</Button>
            </div>
            <Button onClick={handleWriteFile}>Write File</Button>
        </Page>
    );
}
