import Page from '@/components/page';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
	component: RouteComponent,
})

function RouteComponent() {


	return (
		<Page></Page>
	);
}
