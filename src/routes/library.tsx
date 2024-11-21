import Page from '@/components/page';
import { H1, H4 } from '@/components/typography';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/library')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Page header={<H4>Library</H4>}>

    </Page>
  );
}
