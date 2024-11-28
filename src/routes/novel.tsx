import Page from "@/components/page";
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/novel')({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<Page>

		</Page>
	)
}
