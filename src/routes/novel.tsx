import Loader from "@/components/loader";
import Page from "@/components/page";
import { SourceIDsT, SOURCES } from "@/lib/sources/sources";
import { NovelT } from "@/lib/sources/types";
import { activeNovelAtom, appStateAtom, libraryStateAtom, searchHistoryAtom } from "@/lib/store";
import { createFileRoute } from '@tanstack/react-router'
import { useAtom, useAtomValue, useSetAtom } from "jotai/react";
import { useEffect, useState } from "react";
import clone from "clone";
import { Button } from "@/components/ui/button";
import { BookmarkPlus, Download } from "@mynaui/icons-react";
import { getNovelChapters, saveNovelChapters, saveNovelCover, saveNovelEpub } from "@/lib/library/library";
import { convertFileSrc } from "@tauri-apps/api/core";
import EpubTemplate from "@/lib/library/epub";

export const Route = createFileRoute('/novel')({
	component: RouteComponent,
})

function RouteComponent() {
	const [activeNovel, setActiveNovel] = useAtom(activeNovelAtom);
	const setSearchHistory = useSetAtom(searchHistoryAtom);
	const setLibraryState = useSetAtom(libraryStateAtom);
	const [novel, setNovel] = useState<NovelT>();
	const [coverSrc, setCoverSrc] = useState<string>();
	const [isLoading, setIsLoading] = useState(false);
	const appState = useAtomValue(appStateAtom);

	useEffect(() => {
		loadNovelMetadata();
	}, []);

	const loadNovelMetadata = async () => {
		try {
			if (!activeNovel) return;
			let _novel = activeNovel;
			if (!_novel.isMetadataLoaded) {
				const novelSource = SOURCES[_novel.source];
				await new Promise((resolve) => setTimeout(resolve, 500));
				_novel = await novelSource.getNovelMetadata(clone(_novel));
				_novel.isMetadataLoaded = true;
				_novel.updatedMetadataAt = new Date().toISOString();
				if (_novel.totalChapters !== _novel.totalChapters) _novel.updatedChaptersAt = new Date().toISOString();
				setSearchHistory((state) => {
					let novels = state[_novel.source as SourceIDsT];
					let novelIndex = novels.findIndex((n) => n.id === _novel.id);
					novels[novelIndex] = _novel;
				});
			}

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

	const updateState = async (novel: NovelT, saveInLibrary = true) => {
		if (saveInLibrary) setLibraryState((library) => {
			library.novels[novel.id] = novel;
		});
		setActiveNovel(novel);
		setNovel(novel);
	}

	if (!novel || isLoading) return <Loader />
	return (
		<Page>
			<Button size="icon" onClick={handleDownload}><Download /></Button>
			<Button size="icon" onClick={handleAddToLibrary}><BookmarkPlus /></Button>
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
