import { Link, useLocation } from "@tanstack/react-router";
import { H4 } from "./typography";
import { routes } from "@/lib/routes";
import { Sources } from "@/lib/sources/sources";


export default function Breadcrumbs() {
	const location = useLocation();
	const routeURLs = routes.map((r) => r.url);

	if (routeURLs.includes(location.pathname))
		return <H4>{routes.find((r) => r.url === location.pathname)!.title}</H4>;

	const locationSplit = location.pathname.split("/");
	locationSplit.shift();
	if (locationSplit.length === 2) {
		if (locationSplit[0] === "sources") {
			return (
				<div className="flex items-center gap-2">
					<Link href="/sources">
						<H4 className="text-muted-foreground hover:underline">Store</H4>
					</Link>
					<H4 className="text-muted-foreground">/</H4>
					<H4>{Sources.find((s) => s.id === locationSplit[1])?.name}</H4>
				</div>
			);
		} else if (locationSplit[0] === "library") {
			return (
				<div className="flex items-center gap-2">
					<Link href="/library">
						<H4 className="text-muted-foreground hover:underline">Library</H4>
					</Link>
					<H4 className="text-muted-foreground">/</H4>
					<H4>{locationSplit[1]}</H4>
				</div>
			);
		}
	}
	return <H4 className="bg-red-500">UNHANDLED BREADCRUMB ROUTE</H4>
}
