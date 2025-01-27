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
				<TooltipContent side={side} sideOffset={sideOffset}>{content}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}
