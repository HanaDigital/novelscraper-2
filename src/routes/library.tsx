import NovelCard from "@/components/novel-card";
import Page from '@/components/page';
import SearchBar from "@/components/search-bar";
import { libraryStateAtom } from "@/lib/store";
import { createFileRoute } from '@tanstack/react-router'
import { useAtomValue } from "jotai/react";

export const Route = createFileRoute('/library')({
	component: RouteComponent,
})

function RouteComponent() {
	const libraryState = useAtomValue(libraryStateAtom);

	const handleSearch = async (query: string) => {

	}

	const handleClear = () => {

	}

	return (
		<Page>
			<SearchBar
				handleSearch={handleSearch}
				handleClear={handleClear}
			// showClear={!!searchHistory[sourceId as SourceIDsT].length}
			// disabled={isSearching}
			/>

			<div className="grid grid-cols-3 gap-4">
				{Object.values(libraryState.novels).map((novel) => (
					<NovelCard
						key={novel.id}
						href={`/novel?fromRoute=${location.pathname}`}
						novel={novel}
					/>
				))}
			</div>
		</Page>
	);
}
