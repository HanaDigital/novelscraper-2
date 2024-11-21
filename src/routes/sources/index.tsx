import { createFileRoute, Link } from '@tanstack/react-router'
import { H4, SmallP, TinyP } from '@/components/typography'
import { Sources } from '@/lib/sources'
import Page from '@/components/page'

export const Route = createFileRoute('/sources/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Page
      className="grid grid-cols-3 gap-4"
      header={<H4>Sources</H4>}
    >
      {Sources.map((ls) => (
        <Link
          className="flex flex-col gap-3 group rounded-lg bg-card border p-2 hover:shadow-dark"
          href={`/sources/${ls.id}`}
        >
          <div className="rounded-lg overflow-hidden">
            <img
              className="group-hover:scale-[1.05] transition-transform"
              src={ls.logo}
              alt={`${ls.name} logo`}
            />
          </div>
          <div className="flex flex-col gap-1">
            <SmallP>{ls.name}</SmallP>
            <TinyP className="text-muted-foreground">
              {ls.tags.join(', ')}
            </TinyP>
          </div>
        </Link>
      ))}
    </Page>
  )
}
