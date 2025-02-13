import { CardUI, CardGridUI } from "@/components/card"
import Page from '@/components/page'
import SearchBar from "@/components/search-bar"
import { Badge } from "@/components/ui/badge"
import { SourceIDsT, SOURCES } from '@/lib/sources/sources'
import { NovelSource } from "@/lib/sources/types"
import { activeNovelAtom, libraryStateAtom, searchHistoryAtom } from "@/lib/store"
import { BookmarkSolid } from "@mynaui/icons-react"
import { createFileRoute, useLocation } from '@tanstack/react-router'
import { message } from "@tauri-apps/plugin-dialog"
import { useAtom, useAtomValue, useSetAtom } from "jotai/react"
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
	const libraryState = useAtomValue(libraryStateAtom);
	const setActiveNovel = useSetAtom(activeNovelAtom);

	useEffect(() => {
		setSource(SOURCES[sourceId as SourceIDsT]);
	}, [sourceId]);

	const handleSearch = async (query: string) => {
		if (!source || !query || isSearching) return;
		try {
			setIsSearching(true);
			await new Promise((resolve) => setTimeout(resolve, 500));
			let searchedNovels = await source.searchNovels(query);
			searchedNovels = searchedNovels.map((n) => libraryState.novels[n.id] ?? n);
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
				// showClear={!!searchHistory[sourceId as SourceIDsT].length}
				disabled={isSearching}
			/>

			<CardGridUI>
				{searchHistory[sourceId as SourceIDsT].map((novel) => (
					<CardUI
						key={novel.id}
						href={`/novel?fromRoute=${location.pathname}`}
						imageURL={novel.coverURL ?? novel.thumbnailURL ?? ""}
						title={novel.title}
						subTitle={novel.authors.join(', ')}
						badge={novel.isInLibrary &&
							<Badge className="absolute top-3 left-3 z-10 text-green-900 p-0">
								<BookmarkSolid width={20} />
							</Badge>
						}
						onClick={() => setActiveNovel(novel)}
					/>
				))}
			</CardGridUI>
		</Page>
	)
}
