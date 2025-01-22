import Loader from "@/components/loader";
import Page from "@/components/page";
import { SourceIDsT, SOURCES } from "@/lib/sources/sources";
import { DownloadData, NovelT } from "@/lib/sources/types";
import { activeNovelAtom, appStateAtom, downloadStatusAtom, libraryStateAtom, searchHistoryAtom } from "@/lib/store";
import { createFileRoute } from '@tanstack/react-router'
import { useAtom, useAtomValue, useSetAtom } from "jotai/react";
import { useEffect, useState } from "react";
import clone from "clone";
import { Button } from "@/components/ui/button";
import { BookmarkPlus, Delete, Download, Refresh } from "@mynaui/icons-react";
import { deleteNovelData, getNovelChapters, saveNovelChapters, saveNovelCover, saveNovelEpub } from "@/lib/library/library";
import { convertFileSrc } from "@tauri-apps/api/core";
import EpubTemplate from "@/lib/library/epub";
import { message } from "@tauri-apps/plugin-dialog";

export const Route = createFileRoute('/novel')({
	component: RouteComponent,
})

function RouteComponent() {
	const [activeNovel, setActiveNovel] = useAtom(activeNovelAtom);
	const setSearchHistory = useSetAtom(searchHistoryAtom);
	const setLibraryState = useSetAtom(libraryStateAtom);
	const [novel, setNovel] = useState<NovelT>();
	const [coverSrc, setCoverSrc] = useState<string>();
	const [novelDownloadStatus, setNovelDownloadStatus] = useState<DownloadData>();
	const [isLoading, setIsLoading] = useState(false);
	const appState = useAtomValue(appStateAtom);
	const downloadStatus = useAtomValue(downloadStatusAtom);

	useEffect(() => {
		loadNovelMetadata();
	}, []);

	useEffect(() => {
		if (!activeNovel) return;
		const status = downloadStatus[activeNovel.id];
		setNovelDownloadStatus(status);
	}, [downloadStatus]);

	const loadNovelMetadata = async (forceFetch = false) => {
		try {
			if (!activeNovel) return;
			setNovel(undefined);
			let _novel = activeNovel;
			if (!_novel.isMetadataLoaded || forceFetch) _novel = await fetchMetadata(_novel);

			if (_novel.localCoverPath) {
				const src = convertFileSrc(_novel.localCoverPath);
				setCoverSrc(src);
			} else {
				setCoverSrc(_novel.coverURL ?? _novel.thumbnailURL);
			}

			updateState(_novel, false);
		} catch (e) {
			console.error(e);
		}
	}

	const fetchMetadata = async (_novel: NovelT) => {
		try {
			const novelSource = SOURCES[_novel.source];
			await new Promise((resolve) => setTimeout(resolve, 500));
			_novel = await novelSource.getNovelMetadata(clone(_novel));
			_novel.isMetadataLoaded = true;
			_novel.updatedMetadataAt = new Date().toISOString();
			if (_novel.totalChapters !== _novel.totalChapters) _novel.updatedChaptersAt = new Date().toISOString();
		} catch (e) {
			console.error(e);
			await message(`Couldn't get metadata for ${_novel.title}`, { title: SOURCES[_novel.source].name, kind: 'error' });
		}
		return _novel;
	}

	const handleAddToLibrary = async () => {
		try {
			if (!novel) return;
			setIsLoading(true);
			const libNovel = clone(novel);
			libNovel.isInLibrary = true;
			libNovel.addedToLibraryAt = new Date().toISOString();
			const localCoverPath = await saveNovelCover(libNovel);
			libNovel.localCoverPath = localCoverPath;
			updateState(libNovel, true);
		} catch (e) {
			console.error(e);
		}
		setIsLoading(false);
	}

	const handleDownload = async () => {
		try {
			if (!novel) return;
			const novelSource = SOURCES[novel.source];
			await new Promise((resolve) => setTimeout(resolve, 500));
			const libNovel = clone(novel);
			const preDownloadedChapters = await getNovelChapters(novel);
			const downloadedChapters = await novelSource.downloadNovel(novel, appState.downloadBatchSize, appState.downloadBatchDelay, preDownloadedChapters.length);
			console.log("!!! Downloaded Chapters", downloadedChapters);
			const chapters = preDownloadedChapters.concat(downloadedChapters);
			await saveNovelChapters(novel, chapters);
			const epub = await EpubTemplate.generateEpub(novel, chapters);
			await saveNovelEpub(novel, epub, appState.libraryRootPath);
			libNovel.downloadedChapters = chapters.length;
			libNovel.isDownloaded = true;
			libNovel.downloadedAt = new Date().toISOString();
			updateState(libNovel, true);
		} catch (e) {
			console.error(e);
		}
	}

	const handleRemoveFromLibrary = async () => {
		try {
			if (!novel) return;
			const libNovel = clone(novel);
			libNovel.isInLibrary = false;
			libNovel.addedToLibraryAt = undefined;
			libNovel.updatedMetadataAt = new Date().toISOString();
			libNovel.localCoverPath = undefined;
			libNovel.downloadedChapters = 0;
			libNovel.isFavorite = false;
			libNovel.isDownloaded = false;
			setLibraryState((library) => {
				delete library.novels[libNovel.id];
			})
			updateState(libNovel, false);
			await deleteNovelData(libNovel);
		} catch (e) {
			console.error(e);
		}
	}

	const updateState = async (_novel: NovelT, saveInLibrary: boolean) => {
		if (saveInLibrary || _novel.isInLibrary) setLibraryState((library) => {
			library.novels[_novel.id] = _novel;
		});
		setSearchHistory((state) => {
			let novels = state[_novel.source as SourceIDsT];
			let novelIndex = novels.findIndex((n) => n.id === _novel.id);
			if (novelIndex < 0) return state;
			novels[novelIndex] = _novel;
		});
		setActiveNovel(_novel);
		setNovel(_novel);
	}

	if (!novel || isLoading) return <Loader />
	return (
		<Page>
			{novelDownloadStatus && <p>Download Status: {novelDownloadStatus.status} @ {novelDownloadStatus.downloaded_chapters}</p>}
			{novel.isInLibrary && <Button size="icon" onClick={handleDownload}><Download /></Button>}
			{!novel.isInLibrary && <Button size="icon" onClick={handleAddToLibrary}><BookmarkPlus /></Button>}
			{novel.isInLibrary && <Button size="icon" onClick={handleRemoveFromLibrary}><Delete /></Button>}
			<Button size="icon" onClick={() => loadNovelMetadata(true)}><Refresh /></Button>

			<img src={coverSrc} alt="Novel Cover" />
			<h1>{novel.title}</h1>
			<p>{novel.description}</p>
			<p>Author: {novel.authors.join(', ')}</p>
			<p>Genres: {novel.genres.join(', ')}</p>
			<p>Alternative Titles: {novel.alternativeTitles.join(', ')}</p>
			<p>Status: {novel.status}</p>
			<p>Is Downloaded: {novel.isDownloaded}</p>
			<p>Is In Library: {novel.isInLibrary}</p>
			<p>Is Favorite: {novel.isFavorite}</p>
			<p>Total Chapters: {novel.totalChapters}</p>
			<p>Downloaded Chapters: {novel.downloadedChapters}</p>
			<p>Latest Chapter Title: {novel.latestChapterTitle}</p>
			<p>Rating: {novel.rating}</p>
		</Page>
	)
}
