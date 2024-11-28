import { CircleDashed, Search, X } from "@mynaui/icons-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";

type SearchBarProps = {
	handleSearch: (query: string) => void;
	handleClear: () => void;
	showClear?: boolean;
	disabled?: boolean;
}
export default function SearchBar({ handleSearch, handleClear, showClear = false, disabled = false }: SearchBarProps) {
	const [searchQuery, setSearchQuery] = useState('');

	return (
		<div className="flex items-center gap-2">
			<div className="relative w-full">
				<Input
					className="pr-14 rounded-lg bg-card"
					value={searchQuery}
					onChange={e => setSearchQuery(e.target.value)}
					onKeyDown={e => e.key === 'Enter' && handleSearch(searchQuery)}
					type="text"
					placeholder='Search'
					disabled={disabled}
				/>
				<Button className={`h-full absolute right-0 top-0 disabled:bg-muted disabled:text-foreground`} onClick={() => handleSearch(searchQuery)} disabled={disabled}>
					{disabled ? <CircleDashed className="animate-spin" /> : <Search />}
				</Button>
			</div>
			<div className={`overflow-hidden transition-all ${showClear ? "w-max pr-2" : "w-0"}`}>
				<Button
					variant="secondary"
					onClick={() => {
						setSearchQuery("");
						handleClear();
					}}
					disabled={disabled}
				>
					<X />
				</Button>
			</div>
		</div>
	)
}
