import { CardGridUI, CardUI } from "@/components/card";
import Page from '@/components/page';
import SearchBar from "@/components/search-bar";
import { getUnCachedFileSrc } from "@/lib/library/library";
import { activeNovelAtom, libraryStateAtom } from "@/lib/store";
import { createFileRoute } from '@tanstack/react-router'
import { useAtomValue, useSetAtom } from "jotai/react";

export const Route = createFileRoute('/library')({
	component: RouteComponent,
})

function RouteComponent() {
	const libraryState = useAtomValue(libraryStateAtom);
	const setActiveNovel = useSetAtom(activeNovelAtom);

	const handleSearch = async (query: string) => {
		// TODO: Implement search
	}

	const handleClear = () => {
		// TODO: Implement clear
	}

	return (
		<Page>
			<SearchBar
				handleSearch={handleSearch}
				handleClear={handleClear}
			// showClear={!!searchHistory[sourceId as SourceIDsT].length}
			// disabled={isSearching}
			/>
			<CardGridUI>
				{Object.values(libraryState.novels).map((novel) => {
					let coverSrc = novel.coverURL ?? novel.thumbnailURL ?? "";
					if (novel.localCoverPath) coverSrc = getUnCachedFileSrc(novel.localCoverPath);

					return <CardUI
						key={novel.id}
						href={`/novel?fromRoute=${location.pathname}`}
						imageURL={coverSrc}
						title={novel.title}
						subTitle={novel.authors.join(', ')}
						onClick={() => setActiveNovel(novel)}
					/>
				})}
			</CardGridUI>
		</Page>
	);
}
