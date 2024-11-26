import NovelCard from "@/components/novel-card"
import Page from '@/components/page'
import SearchBar from "@/components/search-bar"
import { Sources } from '@/lib/sources/sources'
import { NovelSource, NovelT } from '@/lib/sources/types'
import { createFileRoute, Link } from '@tanstack/react-router'
import { message } from "@tauri-apps/plugin-dialog"
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/sources/$sourceId')({
	component: RouteComponent,
})

function RouteComponent() {
	const { sourceId } = Route.useParams();
	const [source, setSource] = useState<NovelSource>();
	const [searchedNovels, setSearchedNovels] = useState<NovelT[]>([]);

	useEffect(() => {
		setSource(Sources.find((s) => s.id === sourceId));
	}, [sourceId]);

	const handleSearch = async (query: string) => {
		if (!source) return;
		try {
			const novels = await source.searchNovels(query);
			setSearchedNovels(novels);
		} catch (e) {
			console.error(e);
			await message("Couldn't search for novels!", { title: 'NovelScraper Library', kind: 'error' });
		}
	}

	if (!source) return <></>
	return (
		<Page>
			<SearchBar handleSearch={handleSearch} />

			<div className="grid grid-cols-3 gap-4">
				{searchedNovels.map((novel) => (
					<NovelCard
						key={novel.id}
						href={`/sources/${sourceId}/${novel.id}`}
						novel={novel}
					/>
				))}
			</div>
		</Page>
	)
}
