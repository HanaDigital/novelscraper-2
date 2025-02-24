import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";


type TooltipUIProps = {
	children: ReactNode;
	content: ReactNode;
	side?: "top" | "right" | "bottom" | "left";
	sideOffset?: number;
}
export function TooltipUI({ children, content, side, sideOffset }: TooltipUIProps) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>{children}</TooltipTrigger>
				<TooltipContent className="bg-background border shadow-lg text-gray-500 font-medium" side={side} sideOffset={sideOffset}>{content}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}
