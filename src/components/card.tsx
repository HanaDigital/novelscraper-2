import { Link } from "@tanstack/react-router";
import { SmallP, TinyP } from "./typography";
import { ReactNode } from "react";

type CardUIProps = {
	href: string;
	imageURL: string;
	title: string;
	subTitle: string;
	badge?: ReactNode;
	onClick?: () => void;
}
export function CardUI({ href, imageURL, title, subTitle, badge, onClick = () => { } }: CardUIProps) {
	return (
		<Link
			className={`relative flex flex-col gap-3 group rounded-lg bg-card border p-2 pb-3 hover:border-primary`}
			href={href}
			onClick={onClick}
		>
			{badge && badge}
			<div className="rounded-lg overflow-hidden w-full aspect-auto flex-1 grid place-items-center bg-background border">
				<img
					className="group-hover:scale-[1.05] transition-transform w-full"
					src={imageURL}
					alt={`${title}`}
				/>
			</div>
			<div className="flex flex-col gap-1">
				<SmallP className="text-ellipsis text-nowrap overflow-hidden">{title}</SmallP>
				<TinyP className="text-muted-foreground">{subTitle}</TinyP>
			</div>
		</Link>
	)
}

type CardGridUIProps = {
	children: ReactNode;
	className?: string;
}
export function CardGridUI({ children, className = "" }: CardGridUIProps) {
	return (
		<div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 ${className}`}>
			{children}
		</div>
	)
}
