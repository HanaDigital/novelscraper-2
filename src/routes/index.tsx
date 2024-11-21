import Page from '@/components/page';
import { H4 } from '@/components/typography';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <Page header={<H4>Home</H4>}>

        </Page>
    );
}
