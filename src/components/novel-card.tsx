import { NovelT } from "@/lib/sources/types";
import { Link } from "@tanstack/react-router";
import { SmallP, TinyP } from "./typography";

type NovelCardProps = {
	href: string;
	novel: NovelT;
}
export default function NovelCard({ href, novel }: NovelCardProps) {
	return (
		<Link
			className="flex flex-col gap-3 group rounded-lg bg-card border p-2 pb-3 hover:border-primary-foreground"
			href={href}
		>
			<div className="rounded-lg overflow-hidden w-full h-64 grid place-items-center bg-background border">
				<img
					className="group-hover:scale-[1.05] transition-transform w-full"
					src={novel.thumbnailURL}
					alt={`${novel.title} thumbnail`}
				/>
			</div>
			<div className="flex flex-col gap-1">
				<SmallP className="text-ellipsis text-nowrap overflow-hidden">{novel.title}</SmallP>
				<TinyP className="text-muted-foreground">{novel.authors.join(', ')}</TinyP>
			</div>
		</Link>
	)
}
