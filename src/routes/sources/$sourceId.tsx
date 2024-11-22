import Page from '@/components/page'
import { H4 } from '@/components/typography'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sources } from '@/lib/sources/sources'
import { NovelSource } from '@/lib/sources/types'
import { Search } from '@mynaui/icons-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { message } from "@tauri-apps/plugin-dialog"
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/sources/$sourceId')({
	component: RouteComponent,
})

function RouteComponent() {
	const { sourceId } = Route.useParams();
	const [source, setSource] = useState<NovelSource>();
	const [searchQuery, setSearchQuery] = useState('');

	useEffect(() => {
		setSource(Sources.find((s) => s.id === sourceId))
	}, [sourceId]);

	const handleSearch = async (query: string) => {
		if (!source) return;
		try {
			const novels = await source.searchNovels(query);
			console.log(novels);
		} catch (e) {
			console.error(e);
			await message("Couldn't search for novels!", { title: 'NovelScraper Library', kind: 'error' });
		}
	}

	if (!source) return <></>
	return (
		<Page header={
			<div className="flex items-center gap-2">
				<Link href="/sources">
					<H4 className="text-muted-foreground hover:underline">Store</H4>
				</Link>
				<H4 className="text-muted-foreground">/</H4>
				<H4>{source.name}</H4>
			</div>
		}>
			<div className="relative">
				<Input
					className="pr-14 rounded-lg bg-card"
					value={searchQuery}
					onChange={e => setSearchQuery(e.target.value)}
					onKeyDown={e => e.key === 'Enter' && handleSearch(searchQuery)}
					type="text"
					placeholder='Search'
				/>
				<Button className="h-full absolute right-0 top-0" onClick={() => handleSearch(searchQuery)}>
					<Search />
				</Button>
			</div>
		</Page>
	)
}
