import NovelCard from "@/components/novel-card"
import Page from '@/components/page'
import SearchBar from "@/components/search-bar"
import { SourceIDsT, SOURCES } from '@/lib/sources/sources'
import { NovelSource } from "@/lib/sources/types"
import { searchHistoryAtom } from "@/lib/store"
import { createFileRoute, useLocation } from '@tanstack/react-router'
import { message } from "@tauri-apps/plugin-dialog"
import { useAtom } from "jotai/react"
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/sources/$sourceId')({
	component: RouteComponent,
})

function RouteComponent() {
	const { sourceId } = Route.useParams();
	const location = useLocation();

	const [source, setSource] = useState<NovelSource>();
	const [isSearching, setIsSearching] = useState(false);
	const [searchHistory, setSearchHistory] = useAtom(searchHistoryAtom);

	useEffect(() => {
		setSource(SOURCES[sourceId as SourceIDsT]);
	}, [sourceId]);

	const handleSearch = async (query: string) => {
		if (!source || !query || isSearching) return;
		try {
			setIsSearching(true);
			const searchedNovels = await source.searchNovels(query);
			setSearchHistory((state) => {
				let novels = state[sourceId as SourceIDsT];
				searchedNovels.forEach((n) => novels = novels.filter((n2) => n2.id !== n.id));
				novels.unshift(...searchedNovels);
				return {
					...state,
					[sourceId as SourceIDsT]: novels,
				};
			});
		} catch (e) {
			console.error(e);
			await message("Couldn't search for novels!", { title: 'NovelScraper Library', kind: 'error' });
		}
		setIsSearching(false);
	}

	const handleClear = () => {
		setSearchHistory((state) => {
			state[sourceId as SourceIDsT] = [];
		});
	}

	if (!source) return <></>
	return (
		<Page>
			<SearchBar
				handleSearch={handleSearch}
				handleClear={handleClear}
				showClear={!!searchHistory[sourceId as SourceIDsT].length}
				disabled={isSearching}
			/>

			<div className="grid grid-cols-3 gap-4">
				{searchHistory[sourceId as SourceIDsT].map((novel) => (
					<NovelCard
						key={novel.id}
						href={`/novel?fromRoute=${location.pathname}`}
						novel={novel}
					/>
				))}
			</div>
		</Page>
	)
}
