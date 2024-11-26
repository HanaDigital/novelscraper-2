import { Search } from "@mynaui/icons-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";

type SearchBarProps = {
	handleSearch: (query: string) => void;
}
export default function SearchBar({ handleSearch }: SearchBarProps) {
	const [searchQuery, setSearchQuery] = useState('');

	return (
		<div className="relative">
			<Input
				className="pr-14 rounded-lg bg-card"
				value={searchQuery}
				onChange={e => setSearchQuery(e.target.value)}
				onKeyDown={e => e.key === 'Enter' && handleSearch(searchQuery)}
				type="text"
				placeholder='Search'
			/>
			<Button className="h-full absolute right-0 top-0" onClick={() => handleSearch(searchQuery)}>
				<Search />
			</Button>
		</div>
	)
}
