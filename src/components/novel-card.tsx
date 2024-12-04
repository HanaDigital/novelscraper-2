import { Link } from "@tanstack/react-router";
import { SmallP, TinyP } from "./typography";
import { useSetAtom } from "jotai/react";
import { activeNovelAtom } from "@/lib/store";
import { NovelT } from "@/lib/sources/types";
import { Bookmark, BookmarkSolid } from "@mynaui/icons-react";
import { Badge } from "./ui/badge";

type NovelCardProps = {
	href: string;
	novel: NovelT;
	highlightInLibrary?: boolean;
}
export default function NovelCard({ href, novel, highlightInLibrary = false }: NovelCardProps) {
	const setActiveNovel = useSetAtom(activeNovelAtom);

	return (
		<Link
			className={`relative flex flex-col gap-3 group rounded-lg bg-card border p-2 pb-3 hover:border-primary`}
			href={href}
			onClick={() => setActiveNovel(novel)}
		>
			{(highlightInLibrary && novel.isInLibrary) && <Badge className="absolute top-3 left-3 z-10 text-green-900 p-0">
				<BookmarkSolid width={20} />
			</Badge>}
			<div className="rounded-lg overflow-hidden w-full aspect-auto max-h-80 flex-1 grid place-items-center bg-background border">
				<img
					className="group-hover:scale-[1.05] transition-transform w-full"
					src={novel.coverURL ?? novel.thumbnailURL}
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
