import Page from '@/components/page'
import { H4 } from '@/components/typography'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sources } from '@/lib/sources/sources'
import { NovelSource } from '@/lib/sources/types'
import { Search } from '@mynaui/icons-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/sources/$sourceId')({
	component: RouteComponent,
})

function RouteComponent() {
	const { sourceId } = Route.useParams();
	const [source, setSource] = useState<NovelSource>();

	useEffect(() => {
		setSource(Sources.find((s) => s.id === sourceId))
	}, [sourceId])

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
				<Input className="pr-14 placeholder:text-gray-600 rounded-lg" type="text" placeholder='Search' />
				<Button className="h-full absolute right-0 top-0"><Search /></Button>
			</div>
		</Page>
	)
}
