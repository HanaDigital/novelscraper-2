import { createFileRoute, Link } from '@tanstack/react-router'
import { SmallP, TinyP } from '@/components/typography'
import { SOURCES } from '@/lib/sources/sources'
import Page from '@/components/page'

export const Route = createFileRoute('/sources/')({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<Page className="grid grid-cols-3 gap-4">
			{Object.values(SOURCES).map((s) => (
				<Link
					key={s.id}
					className="flex flex-col gap-3 group rounded-lg bg-card border p-2 pb-2 hover:shadow-dark"
					href={`/sources/${s.id}`}
				>
					<div className="rounded-lg overflow-hidden">
						<img
							className="group-hover:scale-[1.05] transition-transform"
							src={s.logo}
							alt={`${s.name} logo`}
						/>
					</div>
					<div className="flex flex-col gap-1">
						<SmallP>{s.name}</SmallP>
						<TinyP className="text-muted-foreground">
							{s.tags.join(', ')}
						</TinyP>
					</div>
				</Link>
			))}
		</Page>
	)
}
