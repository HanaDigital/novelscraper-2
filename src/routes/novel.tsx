import Loader from "@/components/loader";
import Page from "@/components/page";
import { SourceIDsT, SOURCES } from "@/lib/sources/sources";
import { NovelT } from "@/lib/sources/types";
import { activeNovelAtom, searchHistoryAtom } from "@/lib/store";
import { createFileRoute } from '@tanstack/react-router'
import { useAtom, useSetAtom } from "jotai/react";
import { useEffect, useState } from "react";
import clone from "clone";
import { Button } from "@/components/ui/button";
import { Download } from "@mynaui/icons-react";

export const Route = createFileRoute('/novel')({
	component: RouteComponent,
})

function RouteComponent() {
	const [activeNovel, setActiveNovel] = useAtom(activeNovelAtom);
	const setSearchHistory = useSetAtom(searchHistoryAtom);
	const [novel, setNovel] = useState<NovelT>();

	useEffect(() => {
		loadNovelMetadata();
	}, []);

	const loadNovelMetadata = async () => {
		if (!activeNovel) return;
		if (!activeNovel.isMetadataLoaded) {
			const novelSource = SOURCES[activeNovel.source as SourceIDsT];
			await new Promise((resolve) => setTimeout(resolve, 500));
			const updatedNovel = await novelSource.updateNovelMetadata(clone(activeNovel));
			setSearchHistory((state) => {
				let novels = state[activeNovel.source as SourceIDsT];
				let novelIndex = novels.findIndex((n) => n.id === activeNovel.id);
				novels[novelIndex] = updatedNovel;
			});
			setNovel(updatedNovel);
			setActiveNovel(updatedNovel);
		} else {
			setNovel(activeNovel);
			setActiveNovel(activeNovel);
		}
	}

	const handleDownload = async () => {
		if (!novel) return;
		const novelSource = SOURCES[novel.source as SourceIDsT];
		await new Promise((resolve) => setTimeout(resolve, 500));
		const downloadedNovel = await novelSource.downloadNovel(novel);
	}

	if (!novel) return <Loader />
	return (
		<Page>
			<Button size="icon" onClick={handleDownload}><Download /></Button>
			<img src={novel.coverURL || novel.thumbnailURL} alt="Novel Cover" />
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
