import Page from '@/components/page'
import { H4 } from '@/components/typography'
import { Sources, SourceT } from '@/lib/sources'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/sources/$sourceId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { sourceId } = Route.useParams()
  const [source, setSource] = useState<SourceT>()

  useEffect(() => {
    setSource(Sources.find((ls) => ls.id === sourceId))
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

    </Page>
  )
}
